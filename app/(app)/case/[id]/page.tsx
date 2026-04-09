import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeverityBadge, RiskBadge } from '@/components/shared/risk-badge';
import { LawReferenceBadge } from '@/components/shared/law-reference-badge';
import { CountdownBadge } from '@/components/shared/countdown-badge';
import { formatDateTW } from '@/lib/utils/date';
import { differenceInDays } from 'date-fns';

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: caseData } = await supabase
    .from('cases')
    .select('*, reminders(*), evidence(*), documents(*)')
    .eq('id', id)
    .single();

  if (!caseData) notFound();

  const triageResult = caseData.triage_result as any;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">案件詳情</h2>
          <p className="text-sm text-muted-foreground">{formatDateTW(caseData.accident_date)}</p>
        </div>
        <SeverityBadge severity={caseData.severity} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">概覽</TabsTrigger>
          <TabsTrigger value="evidence" className="flex-1">證據</TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1">時間線</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {triageResult && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">分流結果</h3>
                  <RiskBadge level={triageResult.riskLevel} />
                </div>
                <p className="text-sm">{triageResult.explanation}</p>
                {triageResult.lawReferences?.map((ref: any, i: number) => (
                  <LawReferenceBadge key={i} reference={ref} />
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">待辦提醒</h3>
              {(caseData.reminders || [])
                .filter((r: any) => r.status === 'pending')
                .sort(
                  (a: any, b: any) =>
                    new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
                )
                .map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>{r.description || r.type}</span>
                    <CountdownBadge
                      daysRemaining={differenceInDays(new Date(r.due_date), new Date())}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            <p>證據管理功能開發中</p>
            <p className="text-sm mt-1">共 {(caseData.evidence || []).length} 件證據</p>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="space-y-4">
            {(caseData.reminders || [])
              .sort(
                (a: any, b: any) =>
                  new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
              )
              .map((r: any, i: number) => {
                const days = differenceInDays(new Date(r.due_date), new Date());
                const reminders = caseData.reminders || [];
                return (
                  <div key={r.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          r.status === 'completed'
                            ? 'bg-green-500'
                            : days < 0
                              ? 'bg-red-500'
                              : days <= 7
                                ? 'bg-yellow-500'
                                : 'bg-muted-foreground'
                        }`}
                      />
                      {i < reminders.length - 1 && (
                        <div className="w-0.5 h-full bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium">{r.description || r.type}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTW(r.due_date)}</p>
                      <CountdownBadge daysRemaining={days} />
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
