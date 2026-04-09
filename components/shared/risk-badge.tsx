import { Badge } from '@/components/ui/badge';
import type { Severity } from '@/lib/rules-engine/types';

const severityConfig: Record<Severity, { label: string; className: string }> = {
  A1_fatal: { label: 'A1 死亡', className: 'bg-red-600 text-white hover:bg-red-700' },
  A2_injury: { label: 'A2 受傷', className: 'bg-yellow-500 text-black hover:bg-yellow-600' },
  A3_property_only: { label: 'A3 財損', className: 'bg-green-600 text-white hover:bg-green-700' },
};

const riskConfig: Record<string, { label: string; className: string }> = {
  low: { label: '低風險', className: 'bg-green-100 text-green-800' },
  medium: { label: '中風險', className: 'bg-yellow-100 text-yellow-800' },
  high: { label: '高風險', className: 'bg-orange-100 text-orange-800' },
  critical: { label: '極高風險', className: 'bg-red-100 text-red-800' },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return <Badge className={`text-sm font-semibold ${config.className}`}>{config.label}</Badge>;
}

export function RiskBadge({ level }: { level: string }) {
  const config = riskConfig[level] || riskConfig.low;
  return <Badge variant="outline" className={`text-sm ${config.className}`}>{config.label}</Badge>;
}
