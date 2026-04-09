'use client';

import { useMemo } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { determineVehicleMove } from '@/lib/rules-engine/vehicle-move';
import type { SceneData } from './scene-wizard';

interface StepVehicleMoveProps {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

type YesNoButtonsProps = {
  value: boolean;
  onChange: (val: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
};

function YesNoButtons({ value, onChange, yesLabel = '是', noLabel = '否' }: YesNoButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
          value
            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
            : 'border-muted text-muted-foreground hover:border-green-300'
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
          !value
            ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            : 'border-muted text-muted-foreground hover:border-red-300'
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}

const decisionConfig: Record<string, { label: string; colorClass: string }> = {
  must_move: {
    label: '必須移車',
    colorClass: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
  },
  may_move: {
    label: '可以移車',
    colorClass: 'border-green-500 bg-green-50 dark:bg-green-950/20',
  },
  must_not_move: {
    label: '不得移車',
    colorClass: 'border-red-500 bg-red-50 dark:bg-red-950/20',
  },
  wait_for_tow: {
    label: '等候拖吊',
    colorClass: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
  },
};

export function StepVehicleMove({ data, updateData, onNext, onBack }: StepVehicleMoveProps) {
  const moveResult = useMemo(() => {
    return determineVehicleMove({
      hasInjuries: data.hasInjuries,
      hasDeaths: data.hasDeaths,
      vehicleCanDrive: data.vehicleCanDrive,
      bothPartiesAgreeToMove: data.bothPartiesAgreeToMove,
      roadType: data.roadType ?? 'general',
      hasDispute: data.hasDispute,
    });
  }, [data.hasInjuries, data.hasDeaths, data.vehicleCanDrive, data.bothPartiesAgreeToMove, data.roadType, data.hasDispute]);

  const config = decisionConfig[moveResult.moveDecision] ?? decisionConfig.must_not_move;

  return (
    <StepWizard
      currentStep={3}
      totalSteps={6}
      stepTitle="車輛移置"
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Quick questions */}
        <Card>
          <CardContent className="pt-4 space-y-5">
            <h2 className="font-semibold text-base">車輛狀況</h2>

            <div className="space-y-2">
              <p className="text-sm font-medium">車輛可以自行行駛？</p>
              <YesNoButtons
                value={data.vehicleCanDrive}
                onChange={val => updateData({ vehicleCanDrive: val })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">雙方同意移車？</p>
              <YesNoButtons
                value={data.bothPartiesAgreeToMove}
                onChange={val => updateData({ bothPartiesAgreeToMove: val })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">雙方有爭議？</p>
              <YesNoButtons
                value={data.hasDispute}
                onChange={val => updateData({ hasDispute: val })}
                yesLabel="有爭議"
                noLabel="無爭議"
              />
            </div>
          </CardContent>
        </Card>

        {/* Decision result */}
        <div className={`rounded-xl border-2 p-4 space-y-3 ${config.colorClass}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{config.label}</span>
            <span className="text-sm text-muted-foreground">— {moveResult.explanation}</span>
          </div>

          {moveResult.warnings.map((w, i) => (
            <Alert key={i} variant="destructive">
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Step-by-step instructions */}
        {moveResult.nextSteps.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-sm mb-3">處理步驟</h3>
              <ol className="space-y-2">
                {moveResult.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Law references */}
        <div className="flex flex-wrap gap-2">
          {moveResult.lawReferences.map((ref, i) => (
            <LawReferenceBadge key={i} reference={ref} />
          ))}
        </div>
      </div>
    </StepWizard>
  );
}
