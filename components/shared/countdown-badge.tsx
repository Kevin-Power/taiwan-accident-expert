import { Badge } from '@/components/ui/badge';

interface CountdownBadgeProps {
  daysRemaining: number;
  label?: string;
}

export function CountdownBadge({ daysRemaining, label }: CountdownBadgeProps) {
  let className: string;
  let text: string;

  if (daysRemaining < 0) {
    className = 'bg-red-600 text-white';
    text = `已逾期 ${Math.abs(daysRemaining)} 天`;
  } else if (daysRemaining === 0) {
    className = 'bg-red-500 text-white';
    text = '今天到期';
  } else if (daysRemaining <= 3) {
    className = 'bg-red-100 text-red-800';
    text = `剩餘 ${daysRemaining} 天`;
  } else if (daysRemaining <= 14) {
    className = 'bg-yellow-100 text-yellow-800';
    text = `剩餘 ${daysRemaining} 天`;
  } else {
    className = 'bg-muted text-muted-foreground';
    text = `剩餘 ${daysRemaining} 天`;
  }

  return (
    <Badge variant="outline" className={className}>
      {label ? `${label}：${text}` : text}
    </Badge>
  );
}
