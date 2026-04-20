'use client';

import { useState, useMemo } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { calculateWarningDistance } from '@/lib/rules-engine/warning-distance';
import type { RoadType, Weather } from '@/lib/rules-engine/types';
import type { SceneData } from './scene-wizard';

interface StepSafetyProps {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
}

const ROAD_TYPE_OPTIONS: { value: RoadType; label: string }[] = [
  { value: 'highway', label: '高速公路' },
  { value: 'expressway', label: '快速道路' },
  { value: 'general', label: '一般道路' },
  { value: 'alley', label: '巷弄' },
];

const WEATHER_OPTIONS: { value: Weather; label: string }[] = [
  { value: 'clear', label: '晴天' },
  { value: 'rain', label: '雨天' },
  { value: 'fog', label: '霧天' },
  { value: 'night', label: '夜間' },
];

const SPEED_LIMIT_OPTIONS = [
  { value: 110, label: '110 km/h' },
  { value: 100, label: '100 km/h' },
  { value: 90, label: '90 km/h' },
  { value: 80, label: '80 km/h' },
  { value: 70, label: '70 km/h' },
  { value: 60, label: '60 km/h' },
  { value: 50, label: '50 km/h' },
  { value: 40, label: '40 km/h' },
  { value: 30, label: '30 km/h' },
  { value: 20, label: '20 km/h' },
];

const SAFETY_ITEMS = [
  { id: 'hazard', emoji: '🚨', label: '開啟雙黃燈（危險警告燈）' },
  { id: 'move_away', emoji: '🚶', label: '人員移至安全處（護欄外或路邊）' },
  { id: 'warning_sign', emoji: '⚠️', label: '在車後方放置三角警告標誌' },
] as const;

export function StepSafety({ data, updateData, onNext }: StepSafetyProps) {
  // Interactive checklist state
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allChecked = checked.size === SAFETY_ITEMS.length;

  const warningResult = useMemo(() => {
    if (!data.roadType || !data.speedLimit || !data.weather) return null;
    return calculateWarningDistance({
      roadType: data.roadType,
      speedLimit: data.speedLimit,
      weather: data.weather,
    });
  }, [data.roadType, data.speedLimit, data.weather]);

  return (
    <StepWizard
      currentStep={1}
      totalSteps={6}
      stepTitle="現場安全"
      onNext={onNext}
      showBack={false}
      nextDisabled={!allChecked}
      nextLabel={allChecked ? '安全確認完成，下一步' : `請完成安全措施（${checked.size}/${SAFETY_ITEMS.length}）`}
    >
      <div className="space-y-6">
        {/* Interactive safety checklist */}
        <div>
          <h2 className="text-2xl font-bold mb-4">🚨 先確保安全！</h2>
          <p className="text-base text-muted-foreground mb-4">
            請依序完成以下安全措施，每完成一項請打勾：
          </p>

          <div className="space-y-3">
            {SAFETY_ITEMS.map((item) => {
              const isChecked = checked.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isChecked
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-muted hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  {/* Checkbox circle */}
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all ${
                    isChecked
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/40'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </span>

                  {/* Content */}
                  <span className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={`text-lg font-medium ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                      {item.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${(checked.size / SAFETY_ITEMS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {checked.size}/{SAFETY_ITEMS.length}
            </span>
          </div>
        </div>

        {/* Road conditions — only show after safety checklist complete */}
        {allChecked && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="shadow-sm rounded-xl border-2 border-primary/20">
              <CardContent className="pt-4">
                <h2 className="font-semibold text-xl mb-2">🛣️ 計算你的警示距離</h2>
                <p className="text-sm text-muted-foreground mb-4">依道路類型計算正確的警告標誌距離</p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-base">道路類型</Label>
                    <select
                      className="flex h-12 text-base w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={data.roadType ?? ''}
                      onChange={(e) => updateData({ roadType: e.target.value as RoadType })}
                    >
                      <option value="" disabled>請選擇道路類型</option>
                      {ROAD_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-base">速限</Label>
                    <select
                      className="flex h-12 text-base w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={data.speedLimit ?? ''}
                      onChange={(e) => updateData({ speedLimit: Number(e.target.value) })}
                    >
                      <option value="" disabled>請選擇速限</option>
                      {SPEED_LIMIT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-base">天氣狀況</Label>
                    <select
                      className="flex h-12 text-base w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={data.weather ?? ''}
                      onChange={(e) => updateData({ weather: e.target.value as Weather })}
                    >
                      <option value="" disabled>請選擇天氣</option>
                      {WEATHER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning distance result */}
            {warningResult && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 py-5">
                  <AlertDescription className="text-amber-800 dark:text-amber-200 font-bold text-center">
                    <div className="text-base mb-1">請在車後方</div>
                    <div className="text-5xl font-extrabold my-2">{warningResult.decision}</div>
                    <div className="text-base">公尺處放置警告標誌</div>
                  </AlertDescription>
                </Alert>

                {warningResult.warnings.map((w, i) => (
                  <Alert key={i} variant="destructive" className="border-red-400">
                    <AlertDescription className="text-base">{w}</AlertDescription>
                  </Alert>
                ))}

                <div className="flex flex-wrap gap-2">
                  {warningResult.lawReferences.map((ref, i) => (
                    <LawReferenceBadge key={i} reference={ref} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StepWizard>
  );
}
