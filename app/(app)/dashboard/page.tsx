import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CaseCard } from './_components/case-card';
import { differenceInDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: cases } = await supabase
    .from('cases')
    .select('*, reminders(*), evidence(id), documents(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">我的案件</h2>
        <Link href="/scene">
          <Button size="sm">+ 新增案件</Button>
        </Link>
      </div>

      {!cases || cases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-4">尚無案件</p>
          <Link href="/scene">
            <Button>建立第一個案件</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c: any) => {
            const pendingReminders = (c.reminders || [])
              .filter((r: any) => r.status === 'pending')
              .map((r: any) => ({
                description: r.description || r.type,
                daysRemaining: differenceInDays(new Date(r.due_date), new Date()),
              }))
              .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);

            return (
              <CaseCard
                key={c.id}
                id={c.id}
                severity={c.severity}
                roadType={c.road_type}
                accidentDate={c.accident_date}
                status={c.status}
                nearestReminder={pendingReminders[0]}
                evidenceCount={(c.evidence || []).length}
                documentCount={(c.documents || []).length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
