'use client';

import { StepWizard } from '@/components/shared/step-wizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SceneData } from './scene-wizard';

interface StepInfoExchangeProps {
  data: SceneData;
  updateData: (updates: Partial<SceneData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInfoExchange({ data, updateData, onNext, onBack }: StepInfoExchangeProps) {
  return (
    <StepWizard
      currentStep={5}
      totalSteps={6}
      stepTitle="📝 資訊交換"
      onNext={onNext}
      onBack={onBack}
      nextLabel="完成，建立案件"
    >
      <div className="space-y-6">
        {/* Tip */}
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-base">
            建議直接拍攝對方駕照、行車執照與保險卡，以確保資訊正確留存。
          </AlertDescription>
        </Alert>

        {/* Location */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4 space-y-4">
            <h2 className="text-lg font-bold">📍 事故地點</h2>
            <div className="space-y-1.5">
              <Label htmlFor="locationText" className="text-base">地點描述</Label>
              <Input
                id="locationText"
                className="h-12 text-base"
                value={data.locationText || ''}
                onChange={(e) => updateData({ locationText: e.target.value })}
                placeholder="例：台北市信義區忠孝東路五段與松仁路口"
              />
              <p className="text-sm text-muted-foreground">填寫路名+路口或地標，越精確越好</p>
            </div>
          </CardContent>
        </Card>

        {/* Other party section */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4 space-y-4">
            <h2 className="text-lg font-bold">👤 對方當事人</h2>

            <div className="space-y-1.5">
              <Label htmlFor="otherPartyName" className="text-base">姓名</Label>
              <Input
                id="otherPartyName"
                placeholder="對方姓名"
                className="h-12 text-base"
                value={data.otherPartyName ?? ''}
                onChange={e => updateData({ otherPartyName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otherPartyPlate" className="text-base">車牌號碼</Label>
              <Input
                id="otherPartyPlate"
                placeholder="ABC-1234"
                className="h-12 text-base"
                value={data.otherPartyPlate ?? ''}
                onChange={e => updateData({ otherPartyPlate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otherPartyPhone" className="text-base">聯絡電話</Label>
              <Input
                id="otherPartyPhone"
                type="tel"
                placeholder="0912-345-678"
                className="h-12 text-base"
                value={data.otherPartyPhone ?? ''}
                onChange={e => updateData({ otherPartyPhone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otherPartyInsurance" className="text-base">保險公司及保單號碼</Label>
              <Input
                id="otherPartyInsurance"
                placeholder="○○產險 第 XXXXXXX 號"
                className="h-12 text-base"
                value={data.otherPartyInsurance ?? ''}
                onChange={e => updateData({ otherPartyInsurance: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Witness section */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-4 space-y-4">
            <h2 className="text-lg font-bold">👁️ 目擊者（如有）</h2>

            <div className="space-y-1.5">
              <Label htmlFor="witnessName" className="text-base">目擊者姓名</Label>
              <Input
                id="witnessName"
                placeholder="目擊者姓名（選填）"
                className="h-12 text-base"
                value={data.witnessName ?? ''}
                onChange={e => updateData({ witnessName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="witnessPhone" className="text-base">目擊者電話</Label>
              <Input
                id="witnessPhone"
                type="tel"
                placeholder="目擊者聯絡電話（選填）"
                className="h-12 text-base"
                value={data.witnessPhone ?? ''}
                onChange={e => updateData({ witnessPhone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </StepWizard>
  );
}
