import { LEGAL_DISCLAIMER } from '@/lib/rules-engine/constants';

export function DisclaimerFooter() {
  return (
    <div className="border-t bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
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
    </div>
  );
}
