'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SeverityBadge, RiskBadge } from '@/components/shared/risk-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';
import { ScenarioGuidanceCard } from '@/components/shared/scenario-guidance-card';
import { getCase, type CaseRecord } from '@/lib/cases/store';
import { calculateDeadlines } from '@/lib/rules-engine/deadlines';
import { findMatchingScenarios } from '@/lib/rules-engine/scenarios';
import { DOCUMENT_TEMPLATES } from '@/lib/templates/all-templates';
import { isGeneratorAvailable } from '@/lib/templates/generators';

interface Props {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function GuestCaseDetailPage({ params }: Props) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getCase(id);
      setCaseData(result);
      setLoading(false);
      // Also store in sessionStorage for document generation
      if (result) {
        try {
          sessionStorage.setItem('accident_expert_scene_data', JSON.stringify({
            ...result,
            caseId: result.id,
          }));
        } catch { /* ignore */ }
      }
    }
    load();
  }, [id]);

  const deadlines = useMemo(() => {
    if (!caseData) return null;
    return calculateDeadlines({
      accidentDate: new Date(caseData.accidentDate),
      severity: caseData.severity,
      policeArrived: caseData.policeArrived,
    });
  }, [caseData]);

  const scenarios = useMemo(() => {
    if (!caseData) return [];
    return findMatchingScenarios({
      severity: caseData.severity,
      roadType: caseData.roadType ?? undefined,
      hasInjuries: caseData.severity === 'A2_injury',
      hasDeaths: caseData.severity === 'A1_fatal',
      vehicleCanDrive: caseData.canMoveVehicle ?? true,
      suspectedHitAndRun: !!caseData.riskFlags?.suspectedHitAndRun,
      suspectedDUI: !!caseData.riskFlags?.suspectedDUI,
      hasDispute: false,
      vehicleTypes: caseData.vehicleTypes || ['car', 'car'],
    });
  }, [caseData]);

  const triageResult = caseData?.triageResult as any;
  const availableDocuments = DOCUMENT_TEMPLATES.filter(t => t.priority === 'P0' || t.priority === 'P1');

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-lg text-muted-foreground">載入案件...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b px-4 py-3">
          <a href="/" className="text-xl font-bold hover:text-primary">台灣車禍事故處理專家</a>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
          <div className="text-5xl">😕</div>
          <p className="text-xl font-semibold">找不到此案件</p>
          <p className="text-muted-foreground">案件可能已過期或不存在於此瀏覽器。</p>
          <Link href="/my-cases"><Button>返回案件列表</Button></Link>
        </main>
        <DisclaimerFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/my-cases" className="text-base text-muted-foreground hover:text-foreground">← 案件列表</a>
          <a href="/" className="text-base font-bold hover:text-primary">車禍專家</a>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-lg mx-auto w-full px-5 py-8 space-y-6">
          {/* Case header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-mono">{caseData.id}</h2>
              <p className="text-sm text-muted-foreground">{formatDate(caseData.accidentDate)}</p>
            </div>
            <SeverityBadge severity={caseData.severity} />
          </div>

          {/* Triage result */}
          {triageResult && (
            <Card className="shadow-sm rounded-xl">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">分流結果</h3>
                  {triageResult.riskLevel && <RiskBadge level={triageResult.riskLevel} />}
                </div>
                <p className="text-base text-muted-foreground">{triageResult.explanation}</p>
                {triageResult.lawReferences?.map((ref: any, i: number) => (
                  <LawReferenceBadge key={i} reference={ref} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Scenarios */}
          {scenarios.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                🎯 適用情境指引（{scenarios.length} 項）
              </h3>
              {scenarios.map((s) => (
                <ScenarioGuidanceCard key={s.id} scenario={s} />
              ))}
            </div>
          )}

          {/* Deadlines */}
          {deadlines && deadlines.reminders.length > 0 && (
            <Card className="shadow-sm rounded-xl">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-lg font-bold">📅 重要期限</h3>
                {deadlines.reminders.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CountdownBadge daysRemaining={r.daysRemaining} />
                    <span className="text-base text-muted-foreground flex-1">{r.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Document generation */}
          <Card className="shadow-sm rounded-xl">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-lg font-bold">📄 可生成的文件</h3>
              <div className="space-y-2">
                {availableDocuments.map((doc) => {
                  const available = isGeneratorAvailable(doc.id);
                  return available ? (
                    <Link key={doc.id} href={`/document/${doc.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-blue-300">
                      <span className="shrink-0 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">可生成 →</span>
                      <div className="flex-1">
                        <span className="text-base font-semibold">{doc.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{doc.category}</span>
                      </div>
                    </Link>
                  ) : (
                    <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 opacity-60">
                      <span className="shrink-0 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">即將開放</span>
                      <span className="text-base">{doc.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Escalation */}
          {triageResult?.escalateToHuman && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <AlertDescription className="space-y-2">
                <p className="text-lg font-bold text-red-800">{triageResult.escalateReason}</p>
                <a href="tel:412-8518" className="underline font-medium text-base block text-red-700">
                  法律扶助基金會：412-8518
                </a>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
