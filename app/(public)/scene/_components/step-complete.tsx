'use client';

import { useMemo } from 'react';
import { SeverityBadge } from '@/components/shared/risk-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { triageAccident } from '@/lib/rules-engine/triage';
import { calculateDeadlines } from '@/lib/rules-engine/deadlines';
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Success alert */}
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <AlertDescription className="text-green-800 dark:text-green-200 font-semibold text-base">
            案件資料已暫存！
          </AlertDescription>
        </Alert>

        {/* Severity badge */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h2 className="font-semibold text-base">事故等級</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={triageResult.severity} />
              <span className="text-sm text-muted-foreground">{triageResult.explanation}</span>
            </div>
          </CardContent>
        </Card>

        {/* Deadlines / reminders */}
        {deadlinesResult.reminders.length > 0 && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <h2 className="font-semibold text-base">重要期限提醒</h2>
              <div className="space-y-3">
                {deadlinesResult.reminders.map((reminder, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CountdownBadge daysRemaining={reminder.daysRemaining} />
                    <span className="text-sm text-muted-foreground flex-1">{reminder.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legal escalation alert */}
        {triageResult.escalateToHuman && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-200 space-y-2">
              <p className="font-semibold">{triageResult.escalateReason}</p>
              <a href="tel:412-8518" className="underline font-medium block">
                法律扶助基金會：412-8518
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button className="w-full h-12 text-base font-semibold">
            註冊帳號，永久保存案件
          </Button>
          <Button variant="outline" className="w-full h-12 text-base">
            暫不註冊（資料保留 7 天）
          </Button>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  );
}
