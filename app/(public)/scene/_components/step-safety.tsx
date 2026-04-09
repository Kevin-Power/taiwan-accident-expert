'use client';

import { useMemo } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// Using native <select> for reliable label display with base-ui
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

const SAFETY_CHECKLIST = [
  { id: 'hazard', label: '開啟雙黃燈（危險警告燈）' },
  { id: 'move_away', label: '人員移至安全處（護欄外或路邊）' },
  { id: 'warning_sign', label: '在車後方放置三角警告標誌' },
];

export function StepSafety({ data, updateData, onNext }: StepSafetyProps) {
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
    >
      <div className="space-y-6">
        {/* Safety checklist */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4">
            <h2 className="font-semibold text-xl mb-3">立即執行安全措施</h2>
            <ul className="space-y-3">
              {SAFETY_CHECKLIST.map(item => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    ✓
                  </span>
                  <span className="text-base">{item.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Road conditions */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4">
            <h2 className="font-semibold text-xl mb-4">道路環境</h2>
            <div className="space-y-4">
              {/* Road type */}
              <div className="space-y-1.5">
                <Label>道路類型</Label>
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

              {/* Speed limit */}
              <div className="space-y-1.5">
                <Label>速限</Label>
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

              {/* Weather */}
              <div className="space-y-1.5">
                <Label>天氣狀況</Label>
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
          <div className="space-y-3">
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertDescription className="text-amber-800 dark:text-amber-200 font-bold">
                請在車後方 <span className="text-4xl font-bold">{warningResult.decision}</span> 公尺處放置警告標誌
              </AlertDescription>
            </Alert>

            {warningResult.warnings.map((w, i) => (
              <Alert key={i} variant="destructive" className="border-red-400">
                <AlertDescription>{w}</AlertDescription>
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
    </StepWizard>
  );
}
