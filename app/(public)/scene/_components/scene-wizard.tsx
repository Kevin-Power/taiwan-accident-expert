'use client';

import { useState, useCallback } from 'react';
import type { RoadType, Weather, VehicleType } from '@/lib/rules-engine/types';
import { StepSafety } from './step-safety';
import { StepInjury } from './step-injury';
import { StepVehicleMove } from './step-vehicle-move';
import { Button } from '@/components/ui/button';

export interface SceneData {
  // Step 1: Safety
  roadType?: RoadType;
  speedLimit?: number;
  weather?: Weather;
  // Step 2: Injury
  hasDeaths: boolean;
  hasInjuries: boolean;
  hasFire: boolean;
  hasHazmat: boolean;
  suspectedDUI: boolean;
  suspectedHitAndRun: boolean;
  // Step 3: Vehicle move
  vehicleCanDrive: boolean;
  bothPartiesAgreeToMove: boolean;
  hasDispute: boolean;
  // Step 4: Evidence (for later)
  vehicleTypes: VehicleType[];
  hasTrafficSignal: boolean;
  hasSurveillance: boolean;
  hasDashcam: boolean;
  hasSkidMarks: boolean;
  // Step 5: Info exchange (for later)
  otherPartyName?: string;
  otherPartyPlate?: string;
  otherPartyPhone?: string;
  otherPartyInsurance?: string;
  witnessName?: string;
  witnessPhone?: string;
}

const initialData: SceneData = {
  hasDeaths: false, hasInjuries: false, hasFire: false, hasHazmat: false,
  suspectedDUI: false, suspectedHitAndRun: false,
  vehicleCanDrive: true, bothPartiesAgreeToMove: true, hasDispute: false,
  vehicleTypes: ['car', 'car'],
  hasTrafficSignal: false, hasSurveillance: false, hasDashcam: false, hasSkidMarks: false,
};

export function SceneWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SceneData>(initialData);

  const updateData = useCallback((updates: Partial<SceneData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const next = useCallback(() => setStep(s => Math.min(s + 1, 6)), []);
  const back = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  switch (step) {
    case 1:
      return <StepSafety data={data} updateData={updateData} onNext={next} />;
    case 2:
      return <StepInjury data={data} updateData={updateData} onNext={next} onBack={back} />;
    case 3:
      return <StepVehicleMove data={data} updateData={updateData} onNext={next} onBack={back} />;
    default:
      // Steps 4-6 will be added in Task 13
      return (
        <div className="p-8 text-center">
          <p className="text-lg">步驟 {step} 開發中...</p>
          <Button variant="outline" onClick={back} className="mt-4">返回上一步</Button>
        </div>
      );
  }
}
