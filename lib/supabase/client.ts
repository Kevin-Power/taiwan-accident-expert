import { createBrowserClient } from '@supabase/ssr';
import { getAnonymousId } from '@/lib/cases/anonymous-id';

export function createClient() {
  const anonId = typeof window !== 'undefined' ? getAnonymousId() : null;

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: anonId
        ? {
            headers: {
              'x-anonymous-id': anonId,
            },
          }
        : undefined,
    },
  );
}
