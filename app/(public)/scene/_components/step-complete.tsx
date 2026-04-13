'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { SeverityBadge } from '@/components/shared/risk-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { triageAccident } from '@/lib/rules-engine/triage';
import { calculateDeadlines } from '@/lib/rules-engine/deadlines';
import { findMatchingScenarios } from '@/lib/rules-engine/scenarios';
import { DOCUMENT_TEMPLATES } from '@/lib/templates/all-templates';
import { isGeneratorAvailable } from '@/lib/templates/generators';
import { ScenarioGuidanceCard } from '@/components/shared/scenario-guidance-card';
import { saveCase, isCloudStorageAvailable } from '@/lib/cases/store';
import { getAnonymousId } from '@/lib/cases/anonymous-id';
import type { NewCaseInput } from '@/lib/cases/store';
import type { SceneData } from './scene-wizard';

interface StepCompleteProps {
  data: SceneData;
}

export function StepComplete({ data }: StepCompleteProps) {
  const triageResult = useMemo(() => {
    return triageAccident({
      hasDeaths: data.hasDeaths,
      hasInjuries: data.hasInjuries,
      vehicleCount: data.vehicleTypes.length,
      hasFire: data.hasFire,
      hasHazmat: data.hasHazmat,
      suspectedDUI: data.suspectedDUI,
      suspectedHitAndRun: data.suspectedHitAndRun,
      hasMinor: false,
      hasForeignNational: false,
    });
  }, [data.hasDeaths, data.hasInjuries, data.vehicleTypes, data.hasFire, data.hasHazmat, data.suspectedDUI, data.suspectedHitAndRun]);

  const deadlinesResult = useMemo(() => {
    return calculateDeadlines({
      accidentDate: new Date(),
      severity: triageResult.severity,
      policeArrived: true,
    });
  }, [triageResult.severity]);

  const matchedScenarios = useMemo(() => findMatchingScenarios({
    severity: triageResult.severity,
    roadType: data.roadType,
    hasInjuries: data.hasInjuries,
    hasDeaths: data.hasDeaths,
    vehicleCanDrive: data.vehicleCanDrive,
    suspectedHitAndRun: data.suspectedHitAndRun,
    suspectedDUI: data.suspectedDUI,
    hasDispute: data.hasDispute,
    vehicleTypes: data.vehicleTypes,
  }), [triageResult.severity, data]);

  // Filter to P0 + P1 templates
  const availableDocuments = DOCUMENT_TEMPLATES.filter(t => t.priority === 'P0' || t.priority === 'P1');

  // Save state: null=saving, {caseId,backend}=done, {error}=failed
  const [saveState, setSaveState] = useState<{ caseId: string; backend: 'supabase' | 'local'; error?: string } | null>(null);
  // Guard against React Strict Mode double-invoke in dev
  const hasSavedRef = useRef(false);

  // Persist case on mount: writes to Supabase (if configured) or localStorage.
  // Also keeps a sessionStorage copy for document preview pages to read.
  useEffect(() => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    // Ensure we have an anonymous ID for guest users
    getAnonymousId();

    let cancelled = false;

    async function persist() {
      // Build the NewCaseInput payload
      const newCase: NewCaseInput = {
        status: 'on_scene',
        severity: triageResult.severity,
        riskFlags: {
          hasFire: data.hasFire,
          hasHazmat: data.hasHazmat,
          suspectedDUI: data.suspectedDUI,
          suspectedHitAndRun: data.suspectedHitAndRun,
        },
        accidentDate: new Date().toISOString(),
        roadType: data.roadType ?? null,
        speedLimit: data.speedLimit ?? null,
        weather: data.weather ?? null,
        parties: [
          {
            role: 'other' as const,
            name: data.otherPartyName,
            plate: data.otherPartyPlate,
            phone: data.otherPartyPhone,
            insurance: data.otherPartyInsurance,
          },
        ].filter(p => p.name || p.plate || p.phone || p.insurance),
        witnesses: data.witnessName || data.witnessPhone
          ? [{ name: data.witnessName, phone: data.witnessPhone }]
          : [],
        vehicleTypes: data.vehicleTypes,
        hasTrafficSignal: data.hasTrafficSignal,
        hasSurveillance: data.hasSurveillance,
        hasDashcam: data.hasDashcam,
        hasSkidMarks: data.hasSkidMarks,
        triageResult,
        canMoveVehicle: !data.hasDeaths && data.vehicleCanDrive && data.bothPartiesAgreeToMove && !data.hasDispute,
        moveVehicleReason: null,
        policeArrived: true,
      };

      const result = await saveCase(newCase);
      if (cancelled) return;
      setSaveState(result);

      // Also write to sessionStorage so document preview pages can read
      const sessionPayload = {
        ...data,
        caseId: result.caseId,
        accidentDate: newCase.accidentDate,
      };
      try {
        sessionStorage.setItem('accident_expert_scene_data', JSON.stringify(sessionPayload));
      } catch {
        // private mode — ignore
      }
    }

    persist();
    return () => {
      cancelled = true;
    };
  }, [data, triageResult]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full px-5 py-8 space-y-6">
        {/* Save status alert */}
        {!saveState ? (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-lg font-semibold flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-3 border-blue-600 border-t-transparent inline-block shrink-0" />
              案件儲存中...
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="font-extrabold text-2xl">案件已建立！</div>
              <div className="text-base mt-1">
                案件編號：<span className="font-mono">{saveState.caseId}</span>
              </div>
              <div className="text-sm mt-1 opacity-80">
                {saveState.backend === 'supabase'
                  ? '☁️ 已儲存至雲端（跨裝置同步）'
                  : isCloudStorageAvailable()
                  ? '⚠️ 雲端儲存失敗，已暫存至本機'
                  : '📱 已儲存至本機（僅此瀏覽器可見）'}
              </div>
              {saveState.error && (
                <div className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                  {saveState.error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Severity badge */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4 space-y-3">
            <h2 className="text-lg font-bold">事故等級</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={triageResult.severity} />
              <span className="text-base text-muted-foreground">{triageResult.explanation}</span>
            </div>
          </CardContent>
        </Card>

        {/* Matched scenarios section */}
        {matchedScenarios.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🎯</span>
              <span>適用情境指引</span>
              <span className="text-base font-normal text-muted-foreground">（共 {matchedScenarios.length} 項）</span>
            </h3>
            {matchedScenarios.map((scenario) => (
              <ScenarioGuidanceCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}

        {/* Deadlines / reminders */}
        {deadlinesResult.reminders.length > 0 && (
          <Card className="shadow-sm rounded-xl">
            <CardContent className="pt-4 space-y-3">
              <h2 className="text-lg font-bold">重要期限提醒</h2>
              <div className="space-y-3">
                {deadlinesResult.reminders.map((reminder, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CountdownBadge daysRemaining={reminder.daysRemaining} />
                    <span className="text-base text-muted-foreground flex-1">{reminder.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available documents section */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>📄</span>
              <span>可生成的文件</span>
              <span className="text-base font-normal text-muted-foreground">（{availableDocuments.length} 種）</span>
            </h3>
            <p className="text-base text-muted-foreground">點擊可直接預覽/列印的文件，其餘將在下一階段開放：</p>
            <div className="space-y-2">
              {availableDocuments.map((doc) => {
                const isAvailable = isGeneratorAvailable(doc.id);
                const cardInner = (
                  <>
                    <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-700 dark:text-blue-300">
                      {doc.priority}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold">{doc.name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{doc.category}</span>
                        {isAvailable ? (
                          <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded">可生成 →</span>
                        ) : (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">即將開放</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{doc.description}</p>
                    </div>
                  </>
                );

                return isAvailable ? (
                  <Link
                    key={doc.id}
                    href={`/document/${doc.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-blue-300"
                  >
                    {cardInner}
                  </Link>
                ) : (
                  <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 opacity-70">
                    {cardInner}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legal escalation alert */}
        {triageResult.escalateToHuman && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-200 space-y-2">
              <p className="text-lg font-bold">{triageResult.escalateReason}</p>
              <a href="tel:412-8518" className="underline font-medium text-base block">
                法律扶助基金會：412-8518
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Link href="/my-cases">
            <Button className="w-full h-14 text-lg font-semibold shadow-lg rounded-xl">
              📋 查看我的案件
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full h-14 text-lg">
              🏠 回到首頁
            </Button>
          </Link>
        </div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  );
}
