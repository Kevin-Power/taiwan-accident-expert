'use client';

import { useMemo } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { triageAccident } from '@/lib/rules-engine/triage';
import type { SceneData } from './scene-wizard';

interface StepInjuryProps {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type SeverityChoice = 'fatal' | 'injury' | 'none';

function getSeverityChoice(data: SceneData): SeverityChoice | null {
  if (data.hasDeaths) return 'fatal';
  if (data.hasInjuries) return 'injury';
  if (!data.hasDeaths && !data.hasInjuries) return 'none';
  return null;
}

export function StepInjury({ data, updateData, onNext, onBack }: StepInjuryProps) {
  const severityChoice = getSeverityChoice(data);

  const triageResult = useMemo(() => {
    return triageAccident({
      hasDeaths: data.hasDeaths,
      hasInjuries: data.hasInjuries,
      vehicleCount: 2,
      hasFire: data.hasFire,
      hasHazmat: data.hasHazmat,
      suspectedDUI: data.suspectedDUI,
      suspectedHitAndRun: data.suspectedHitAndRun,
      hasMinor: false,
      hasForeignNational: false,
    });
  }, [data.hasDeaths, data.hasInjuries, data.hasFire, data.hasHazmat, data.suspectedDUI, data.suspectedHitAndRun]);

  function selectSeverity(choice: SeverityChoice) {
    updateData({
      hasDeaths: choice === 'fatal',
      hasInjuries: choice === 'injury',
    });
  }

  const riskColorMap: Record<string, string> = {
    critical: 'border-red-500 bg-red-50 dark:bg-red-950/20',
    high: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
    medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    low: 'border-green-500 bg-green-50 dark:bg-green-950/20',
  };

  const alertColorClass = riskColorMap[triageResult.riskLevel] ?? riskColorMap.medium;

  return (
    <StepWizard
      currentStep={2}
      totalSteps={6}
      stepTitle="傷亡確認"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Three big severity buttons */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">事故傷亡情況</h2>
          <button
            type="button"
            onClick={() => selectSeverity('fatal')}
            className={`w-full rounded-xl border-2 p-5 min-h-[72px] text-left transition-all ${
              severityChoice === 'fatal'
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                : 'border-muted hover:border-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="font-bold text-base text-red-700 dark:text-red-400">有人死亡（A1）</p>
                <p className="text-base text-muted-foreground">事故造成人員死亡</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => selectSeverity('injury')}
            className={`w-full rounded-xl border-2 p-5 min-h-[72px] text-left transition-all ${
              severityChoice === 'injury'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                : 'border-muted hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="font-bold text-base text-yellow-700 dark:text-yellow-400">有人受傷（A2）</p>
                <p className="text-base text-muted-foreground">事故造成人員受傷</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => selectSeverity('none')}
            className={`w-full rounded-xl border-2 p-5 min-h-[72px] text-left transition-all ${
              severityChoice === 'none'
                ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                : 'border-muted hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟢</span>
              <div>
                <p className="font-bold text-base text-green-700 dark:text-green-400">無人傷亡（A3）</p>
                <p className="text-base text-muted-foreground">僅財物損失</p>
              </div>
            </div>
          </button>
        </div>

        {/* Additional risk flags */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-base mb-3">其他風險因素（選填）</h3>
            <div className="space-y-2">
              {[
                { key: 'hasFire' as const, label: '現場起火' },
                { key: 'hasHazmat' as const, label: '危險物品外洩' },
                { key: 'suspectedDUI' as const, label: '疑似酒駕' },
                { key: 'suspectedHitAndRun' as const, label: '疑似肇事逃逸' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data[item.key]}
                    onChange={e => updateData({ [item.key]: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-base">{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Triage result */}
        <div className={`rounded-xl border-2 p-4 space-y-3 ${alertColorClass}`}>
          <p className="font-semibold text-base">{triageResult.explanation}</p>

          {/* Emergency call buttons */}
          {(data.hasDeaths || data.hasInjuries || data.hasFire || data.hasHazmat) && (
            <div className="flex gap-2">
              {(data.hasDeaths || data.hasInjuries || data.hasFire) && (
                <a href="tel:119" className="flex-1">
                  <Button variant="destructive" className="w-full">
                    撥打 119 急救
                  </Button>
                </a>
              )}
              <a href="tel:110" className="flex-1">
                <Button variant="outline" className="w-full border-red-400 text-red-700 hover:bg-red-50">
                  撥打 110 報警
                </Button>
              </a>
            </div>
          )}

          {triageResult.warnings.map((w, i) => (
            <Alert key={i} variant="destructive">
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}

          {triageResult.escalateReason && (
            <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950/20">
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                {triageResult.escalateReason}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Law references */}
        <div className="flex flex-wrap gap-2">
          {triageResult.lawReferences.map((ref, i) => (
            <LawReferenceBadge key={i} reference={ref} />
          ))}
        </div>
      </div>
    </StepWizard>
  );
}
