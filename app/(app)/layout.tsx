import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DisclaimerFooter } from '@/components/shared/disclaimer-footer';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">
          <a href="/dashboard">台灣車禍事故處理專家</a>
        </h1>
        <span className="text-sm text-muted-foreground">{user.phone || user.email}</span>
      </header>
      <main className="flex-1">{children}</main>
      <DisclaimerFooter />
    </div>
  );
}
