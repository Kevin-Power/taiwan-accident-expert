'use client';

import { useState } from 'react';
import { StepWizard } from '@/components/shared/step-wizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

type LocateState = 'idle' | 'requesting' | 'resolving' | 'success' | 'error';

export function StepInfoExchange({ data, updateData, onNext, onBack }: StepInfoExchangeProps) {
  const [locateState, setLocateState] = useState<LocateState>('idle');
  const [locateError, setLocateError] = useState<string>('');

  const handleAutoDetect = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocateState('error');
      setLocateError('您的瀏覽器不支援定位功能');
      return;
    }

    setLocateState('requesting');
    setLocateError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocateState('resolving');

        try {
          // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-TW&zoom=18`,
            { headers: { 'User-Agent': 'taiwan-accident-expert' } }
          );
          if (!res.ok) throw new Error('reverse_geocode_failed');
          const json = await res.json();
          const addr = json.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          updateData({ locationText: addr });
          setLocateState('success');
        } catch {
          // Fallback: use raw coordinates
          updateData({ locationText: `經緯度：${lat.toFixed(6)}, ${lng.toFixed(6)}` });
          setLocateState('success');
        }
      },
      (err) => {
        setLocateState('error');
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError('您拒絕了定位權限，請手動輸入地點');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocateError('無法取得位置，請手動輸入');
        } else if (err.code === err.TIMEOUT) {
          setLocateError('定位逾時，請手動輸入或重試');
        } else {
          setLocateError('定位失敗，請手動輸入');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const isLocating = locateState === 'requesting' || locateState === 'resolving';

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
        <Card className="shadow-sm rounded-xl border-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10">
          <CardContent className="pt-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold">📍 事故地點 <span className="text-red-600 text-base">*</span></h2>
              <p className="text-sm text-muted-foreground mt-1">所有文件都需要地點，建議使用自動定位</p>
            </div>

            {/* Auto-detect button — primary action */}
            <Button
              type="button"
              onClick={handleAutoDetect}
              disabled={isLocating}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl"
            >
              {locateState === 'requesting' && (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  正在取得 GPS 座標...
                </span>
              )}
              {locateState === 'resolving' && (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  解析地址中...
                </span>
              )}
              {locateState === 'idle' && '📍 一鍵自動定位'}
              {locateState === 'success' && '✅ 已定位（再次定位）'}
              {locateState === 'error' && '🔄 重試定位'}
            </Button>

            {locateError && (
              <Alert className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-800 text-sm">{locateError}</AlertDescription>
              </Alert>
            )}

            {/* Manual fallback */}
            <div className="space-y-1.5">
              <Label htmlFor="locationText" className="text-base">
                {locateState === 'success' ? '已自動填入（可手動修正）' : '或手動輸入地點'}
              </Label>
              <Input
                id="locationText"
                className="h-12 text-base"
                value={data.locationText || ''}
                onChange={(e) => updateData({ locationText: e.target.value })}
                placeholder="例：台北市信義區忠孝東路五段與松仁路口"
              />
              <p className="text-sm text-muted-foreground">路名+路口或地標，越精確越好</p>
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
