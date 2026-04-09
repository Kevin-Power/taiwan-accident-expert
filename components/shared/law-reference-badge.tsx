'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { LawReference } from '@/lib/rules-engine/types';

interface LawReferenceBadgeProps {
  reference: LawReference;
}

export function LawReferenceBadge({ reference }: LawReferenceBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="inline-block">
      <Badge
        variant="outline"
        className="cursor-pointer text-sm hover:bg-accent"
        onClick={() => setExpanded(!expanded)}
      >
        {reference.law} {reference.article}
        {reference.clause ? ` ${reference.clause}` : ''}
      </Badge>
      {expanded && (
        <span className="block mt-1 text-sm text-muted-foreground bg-muted rounded p-3">
          {reference.summary}
        </span>
      )}
    </span>
  );
}
