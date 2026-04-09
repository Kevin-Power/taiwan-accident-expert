'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function StepWizard({
  currentStep, totalSteps, stepTitle, children, onNext, onBack,
  nextLabel = '下一步', nextDisabled = false, showBack = true,
}: StepWizardProps) {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
        <div className="flex items-center justify-between text-base font-medium text-muted-foreground mb-1">
          <span>步驟 {currentStep}/{totalSteps}</span>
          <span className="text-base">{stepTitle}</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      <div className="flex-1 px-5 py-8 overflow-y-auto">
        {children}
      </div>

      <div className="sticky bottom-0 bg-background border-t px-5 py-4 flex gap-3">
        {showBack && currentStep > 1 && onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1 h-14 text-lg">
            上一步
          </Button>
        )}
        <Button onClick={onNext} disabled={nextDisabled} className="flex-1 h-14 text-xl font-semibold">
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
