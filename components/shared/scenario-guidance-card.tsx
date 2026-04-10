'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import type { ScenarioGuidance } from '@/lib/rules-engine/scenarios';

interface ScenarioGuidanceCardProps {
  scenario: ScenarioGuidance;
  defaultExpanded?: boolean;
}

export function ScenarioGuidanceCard({ scenario, defaultExpanded = true }: ScenarioGuidanceCardProps) {
  return (
    <Card className="shadow-sm rounded-xl border-l-4 border-l-blue-500">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{scenario.name}</h3>
              <p className="text-base text-muted-foreground mt-1">{scenario.description}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-base font-bold mb-2 flex items-center gap-2">
            <span>✅</span>
            <span>建議行動</span>
          </h4>
          <ol className="space-y-2 ml-2">
            {scenario.actions.map((action, i) => (
              <li key={i} className="flex gap-2 text-base">
                <span className="font-bold text-blue-600 shrink-0">{i + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Evidence focus */}
        {scenario.evidenceFocus.length > 0 && (
          <div>
            <h4 className="text-base font-bold mb-2 flex items-center gap-2">
              <span>📸</span>
              <span>本情境蒐證重點</span>
            </h4>
            <ul className="space-y-1.5 ml-2">
              {scenario.evidenceFocus.map((item, i) => (
                <li key={i} className="text-base">
                  <span className="text-amber-700 font-medium">• </span>
                  <span className="text-muted-foreground">{item.tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Escalation triggers */}
        {scenario.escalationTriggers.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
            <h4 className="text-base font-bold mb-1 text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>⚠️</span>
              <span>注意事項</span>
            </h4>
            <ul className="space-y-1 ml-1">
              {scenario.escalationTriggers.map((trigger, i) => (
                <li key={i} className="text-base text-amber-800 dark:text-amber-300">
                  • {trigger}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Law references */}
        {scenario.lawReferences.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {scenario.lawReferences.map((ref, i) => (
              <LawReferenceBadge key={i} reference={ref} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
