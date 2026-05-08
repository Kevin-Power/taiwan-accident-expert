'use client';

import { useState, useMemo, useEffect } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { generateEvidenceChecklist } from '@/lib/rules-engine/evidence-checklist';
import { findMatchingScenarios } from '@/lib/rules-engine/scenarios';
import { saveEvidence, listEvidenceByCase, deleteEvidence, type StoredEvidence } from '@/lib/evidence/storage';
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
  const [evidence, setEvidence] = useState<Record<string, StoredEvidence[]>>({});

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
      hasInjuries: data.hasInjuries ?? false,
    });
  }, [data.roadType, data.vehicleTypes, data.hasTrafficSignal, data.hasSurveillance, data.hasDashcam, data.hasSkidMarks, data.weather, data.hasInjuries]);

  const matchedScenarios = useMemo(() => findMatchingScenarios({
    severity: data.hasDeaths ? 'A1_fatal' : data.hasInjuries ? 'A2_injury' : 'A3_property_only',
    roadType: data.roadType,
    hasInjuries: data.hasInjuries ?? false,
    hasDeaths: data.hasDeaths ?? false,
    vehicleCanDrive: data.vehicleCanDrive ?? false,
    suspectedHitAndRun: data.suspectedHitAndRun,
    suspectedDUI: data.suspectedDUI,
    hasDispute: data.hasDispute ?? false,
    vehicleTypes: data.vehicleTypes,
  }), [data]);

  // Collect all unique evidence focus tips from matched scenarios
  const scenarioEvidenceTips = matchedScenarios.flatMap(s =>
    s.evidenceFocus.map(e => ({ scenario: s.name, ...e }))
  );

  // Load existing pending evidence on mount
  useEffect(() => {
    listEvidenceByCase('pending').then(items => {
      const grouped: Record<string, StoredEvidence[]> = {};
      for (const item of items) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      }
      setEvidence(grouped);
    }).catch(() => {});
  }, []);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      try {
        const saved = await saveEvidence({ caseId: 'pending', category, file });
        setEvidence(prev => ({
          ...prev,
          [category]: [...(prev[category] || []), saved],
        }));
      } catch (err) {
        console.error('save evidence failed', err);
      }
    }
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const handleDelete = async (id: string, category: string) => {
    await deleteEvidence(id);
    setEvidence(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(ev => ev.id !== id),
    }));
  };

  const totalItems = checklist.items.length;
  const capturedCount = checklist.items.filter(item => (evidence[item.category] || []).length > 0).length;

  return (
    <StepWizard
      currentStep={4}
      totalSteps={6}
      stepTitle="蒐證拍攝"
      onNext={onNext}
      onBack={onBack}
      nextLabel={`已拍 ${capturedCount}/${totalItems} 項，下一步`}
    >
      <div className="space-y-6">
        {/* Condition toggles */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4">
            <h2 className="font-semibold text-xl mb-3">現場條件</h2>
            <div className="space-y-2">
              {CONDITION_TOGGLES.map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer py-1">
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

        {/* Scenario-specific evidence focus */}
        {scenarioEvidenceTips.length > 0 && (
          <Card className="shadow-sm rounded-xl border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/10">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>🎯</span>
                <span>本案件蒐證重點</span>
              </h3>
              <p className="text-base text-muted-foreground">系統依你的事故情況，特別提醒以下蒐證重點：</p>
              <ul className="space-y-2">
                {scenarioEvidenceTips.slice(0, 8).map((tip, i) => (
                  <li key={i} className="flex gap-2 text-base">
                    <span className="text-amber-600 shrink-0">⚡</span>
                    <div className="flex-1">
                      <span className="font-medium">{tip.tip}</span>
                      <span className="text-sm text-muted-foreground ml-2">（{tip.scenario}）</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Checklist items with capture */}
        <div className="space-y-3">
          <h2 className="font-semibold text-2xl font-bold">蒐證清單</h2>
          {checklist.items.map(item => {
            const hasEvidence = (evidence[item.category] || []).length > 0;
            return (
              <div
                key={item.category}
                className={`rounded-xl border-2 p-4 transition-all ${
                  hasEvidence
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-muted'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    hasEvidence
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/40 text-muted-foreground'
                  }`}>
                    {hasEvidence ? '✓' : item.priority}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-semibold">{item.description}</p>
                      {item.required && (
                        <span className="text-xs rounded-full bg-red-100 text-red-700 px-2 py-0.5 font-medium">必拍</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.tips}</p>
                  </div>
                </div>

                {/* Captured thumbnails */}
                {(evidence[item.category] || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {evidence[item.category].map(ev => (
                      <div key={ev.id} className="relative aspect-square">
                        {ev.type === 'photo' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={URL.createObjectURL(ev.blob)}
                            alt={ev.filename}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(ev.blob)}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(ev.id, item.category)}
                          className="absolute top-1 right-1 h-6 w-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Capture button — hidden file input */}
                <label className="block w-full">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={(e) => handleCapture(e, item.category)}
                  />
                  <span className="block w-full text-center py-2 px-4 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium cursor-pointer transition-colors">
                    📷 拍照 / 選擇檔案
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Warnings */}
        {checklist.warnings.length > 0 && (
          <div className="space-y-2">
            {checklist.warnings.map((w, i) => (
              <Alert key={i} className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-base">{w}</AlertDescription>
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
