'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';
import { generateDocument, isGeneratorAvailable, type GeneratorInput } from '@/lib/templates/generators';
import type { GeneratedDocument } from '@/lib/templates/types';

interface Props {
  params: Promise<{ templateId: string }>;
}

export default function DocumentPreviewPage({ params }: Props) {
  const { templateId } = use(params);
  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read scene data from sessionStorage
    const raw = sessionStorage.getItem('accident_expert_scene_data');
    if (!raw) {
      setError('找不到案件資料，請重新完成事故精靈流程。');
      return;
    }

    try {
      const sceneData = JSON.parse(raw);
      const input: GeneratorInput = {
        caseId: sceneData.caseId || `ACC-${Date.now()}`,
        accidentDate: sceneData.accidentDate ? new Date(sceneData.accidentDate) : new Date(),
        roadType: sceneData.roadType,
        speedLimit: sceneData.speedLimit,
        weather: sceneData.weather,
        hasDeaths: sceneData.hasDeaths,
        hasInjuries: sceneData.hasInjuries,
        hasFire: sceneData.hasFire,
        hasHazmat: sceneData.hasHazmat,
        suspectedDUI: sceneData.suspectedDUI,
        suspectedHitAndRun: sceneData.suspectedHitAndRun,
        vehicleCanDrive: sceneData.vehicleCanDrive,
        bothPartiesAgreeToMove: sceneData.bothPartiesAgreeToMove,
        hasDispute: sceneData.hasDispute,
        hasTrafficSignal: sceneData.hasTrafficSignal,
        hasSurveillance: sceneData.hasSurveillance,
        hasDashcam: sceneData.hasDashcam,
        hasSkidMarks: sceneData.hasSkidMarks,
        vehicleTypes: sceneData.vehicleTypes,
        otherPartyName: sceneData.otherPartyName,
        otherPartyPlate: sceneData.otherPartyPlate,
        otherPartyPhone: sceneData.otherPartyPhone,
        otherPartyInsurance: sceneData.otherPartyInsurance,
        witnessName: sceneData.witnessName,
        witnessPhone: sceneData.witnessPhone,
        locationText: sceneData.locationText,
      };

      if (!isGeneratorAvailable(templateId)) {
        setError(`此文件類型尚未實作生成器：${templateId}`);
        return;
      }

      const generated = generateDocument(templateId, input);
      setDoc(generated);
    } catch (e) {
      setError('資料解析錯誤：' + (e instanceof Error ? e.message : String(e)));
    }
  }, [templateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!doc) return;
    const text = [
      `【${doc.template.name}】`,
      `案件編號：${doc.caseId}`,
      `生成時間：${doc.generatedAt.toLocaleString('zh-TW')}`,
      '',
      ...doc.sections.map(s => `## ${s.title}\n${s.content}`),
      '',
      '─────────────────',
      doc.disclaimer,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('已複製到剪貼簿');
    } catch {
      alert('複製失敗，請手動選取文字');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
          <Alert className="border-red-500 bg-red-50">
            <AlertDescription className="text-base font-semibold text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link href="/scene">
              <Button size="lg" className="h-14 text-lg">返回事故精靈</Button>
            </Link>
          </div>
        </div>
        <DisclaimerFooter />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-lg text-muted-foreground">文件生成中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toolbar (hidden when printing) */}
      <div className="sticky top-0 z-10 bg-background border-b px-5 py-3 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="sm">🏠</Button></Link>
            <Link href="/scene"><Button variant="outline" size="sm">← 返回精靈</Button></Link>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy}>
              📋 複製文字
            </Button>
            <Button size="sm" onClick={handlePrint}>
              🖨️ 列印 / 存 PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Document content */}
      <main className="flex-1 px-5 py-8 max-w-3xl mx-auto w-full print:py-4 print:max-w-full">
        {/* Document header */}
        <header className="mb-8 border-b pb-6 print:mb-6 print:pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {doc.template.category}
            </span>
            <span className="text-sm text-muted-foreground">優先 {doc.template.priority}</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{doc.template.name}</h1>
          <p className="text-base text-muted-foreground">{doc.template.description}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            <div>案件編號：{doc.caseId}</div>
            <div>生成時間：{doc.generatedAt.toLocaleString('zh-TW')}</div>
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-6">
          {doc.sections.map((section, i) => (
            <Card key={i} className="shadow-sm rounded-xl print:shadow-none print:rounded-none print:border-0">
              <CardContent className="p-6 print:p-0 print:py-3">
                <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ⚠️ {doc.disclaimer}
          </p>
        </div>
      </main>

      <div className="print:hidden">
        <DisclaimerFooter />
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { font-size: 12pt; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}
