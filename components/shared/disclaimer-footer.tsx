import { LEGAL_DISCLAIMER } from '@/lib/rules-engine/constants';

export function DisclaimerFooter() {
  return (
    <div className="border-t bg-muted/50 px-5 py-4 text-sm text-muted-foreground">
      <p>{LEGAL_DISCLAIMER.text}</p>
      <p className="mt-1">
        法律扶助基金會：
        <a href={`tel:${LEGAL_DISCLAIMER.legalAidPhone}`} className="underline font-medium">
          {LEGAL_DISCLAIMER.legalAidPhone}
        </a>
        {' | '}
        <a href={LEGAL_DISCLAIMER.legalAidUrl} target="_blank" rel="noopener noreferrer" className="underline">
          官方網站
        </a>
      </p>
      <div className="mt-2 flex gap-3 text-sm">
        <a href="/privacy" className="underline hover:text-foreground">隱私權政策</a>
        <span>|</span>
        <a href="/terms" className="underline hover:text-foreground">服務條款</a>
        <span>|</span>
        <a href="/" className="underline hover:text-foreground">首頁</a>
      </div>
    </div>
  );
}
