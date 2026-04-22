import { NextResponse } from 'next/server';

/**
 * Health check endpoint — keeps Supabase alive by performing a lightweight
 * query every time it's called. An external cron service (e.g. cron-job.org)
 * should ping this endpoint every 5-6 days to prevent Supabase free-tier
 * auto-pause (triggers after 7 days of inactivity).
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseStatus = 'not_configured';

  if (supabaseUrl && supabaseKey) {
    try {
      // Lightweight query — just check if the cases table is reachable
      const res = await fetch(`${supabaseUrl}/rest/v1/cases?select=id&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      supabaseStatus = res.ok ? 'healthy' : `error_${res.status}`;
    } catch (e) {
      supabaseStatus = 'unreachable';
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
  });
}
