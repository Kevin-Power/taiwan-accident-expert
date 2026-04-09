'use client';

import { useState, useMemo } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { generateEvidenceChecklist } from '@/lib/rules-engine/evidence-checklist';
import type { SceneData } from './scene-wizard';

interface StepEvidenceProps {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CONDITION_TOGGLES: { key: keyof Pick<SceneData, 'hasTrafficSignal' | 'hasSurveillance' | 'hasDashcam' | 'hasSkidMarks'>; label: string }[] = [
  { key: 'hasTrafficSignal', label: '現場有交通號誌' },
  { key: 'hasSurveillance', label: '附近有監視器' },
  { key: 'hasDashcam', label: '有行車記錄器' },
  { key: 'hasSkidMarks', label: '有煞車痕跡' },
];

export function StepEvidence({ data, updateData, onNext, onBack }: StepEvidenceProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const checklist = useMemo(() => {
    return generateEvidenceChecklist({
      roadType: data.roadType ?? 'general',
      vehicleTypes: data.vehicleTypes,
      hasTrafficSignal: data.hasTrafficSignal,
      hasSurveillance: data.hasSurveillance,
      hasDashcam: data.hasDashcam,
      hasSkidMarks: data.hasSkidMarks,
      weather: data.weather ?? 'clear',
      isNight: data.weather === 'night',
      hasInjuries: data.hasInjuries,
    });
  }, [data.roadType, data.vehicleTypes, data.hasTrafficSignal, data.hasSurveillance, data.hasDashcam, data.hasSkidMarks, data.weather, data.hasInjuries]);

  function toggleChecked(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const totalItems = checklist.items.length;
  const checkedCount = checklist.items.filter(item => checked.has(item.category)).length;

  return (
    <StepWizard
      currentStep={4}
      totalSteps={6}
      stepTitle="蒐證拍攝"
      onNext={onNext}
      onBack={onBack}
      nextLabel={`已拍 ${checkedCount}/${totalItems} 項，下一步`}
    >
      <div className="space-y-6">
        {/* Condition toggles */}
        <Card>
          <CardContent className="pt-4">
            <h2 className="font-semibold text-base mb-3">現場條件</h2>
            <div className="space-y-2">
              {CONDITION_TOGGLES.map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data[item.key]}
                    onChange={e => updateData({ [item.key]: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist items */}
        <div className="space-y-3">
          <h2 className="font-semibold text-base">蒐證清單</h2>
          {checklist.items.map(item => (
            <button
              key={item.category}
              type="button"
              onClick={() => toggleChecked(item.category)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                checked.has(item.category)
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                  : 'border-muted hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  checked.has(item.category)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {checked.has(item.category) ? '✓' : item.priority}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{item.description}</span>
                    {item.required && (
                      <span className="text-xs rounded-full bg-red-100 text-red-700 px-2 py-0.5 font-medium">必拍</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.tips}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Warnings */}
        {checklist.warnings.length > 0 && (
          <div className="space-y-2">
            {checklist.warnings.map((w, i) => (
              <Alert key={i} className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">{w}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Law references */}
        <div className="flex flex-wrap gap-2">
          {checklist.lawReferences.map((ref, i) => (
            <LawReferenceBadge key={i} reference={ref} />
          ))}
        </div>
      </div>
    </StepWizard>
  );
}
