import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/shared/risk-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { formatDateTW } from '@/lib/utils/date';
import type { Severity } from '@/lib/rules-engine/types';

interface CaseCardProps {
  id: string;
  severity: Severity;
  roadType: string | null;
  accidentDate: string;
  status: string;
  nearestReminder?: { description: string; daysRemaining: number };
  evidenceCount: number;
  documentCount: number;
}

const statusLabels: Record<string, string> = {
  on_scene: '現場處理中',
  post_scene: '事故後處理',
  data_request: '資料申請中',
  appraisal: '鑑定中',
  mediation: '調解中',
  closed: '已結案',
};

const roadTypeLabels: Record<string, string> = {
  highway: '高速公路',
  expressway: '快速道路',
  general: '一般道路',
  alley: '巷道',
};

export function CaseCard(props: CaseCardProps) {
  return (
    <Link href={`/case/${props.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <SeverityBadge severity={props.severity} />
            <span className="text-xs text-muted-foreground">
              {statusLabels[props.status] || props.status}
            </span>
          </div>
          <div className="text-sm">
            <span>{formatDateTW(props.accidentDate)}</span>
            {props.roadType && (
              <span className="ml-2 text-muted-foreground">
                {roadTypeLabels[props.roadType] || props.roadType}
              </span>
            )}
          </div>
          {props.nearestReminder && (
            <div className="flex items-center justify-between">
              <span className="text-sm truncate mr-2">{props.nearestReminder.description}</span>
              <CountdownBadge daysRemaining={props.nearestReminder.daysRemaining} />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            證據 {props.evidenceCount} 件 | 文件 {props.documentCount} 份
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
