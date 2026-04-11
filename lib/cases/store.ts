/**
 * Unified case store — tries Supabase first, falls back to localStorage.
 *
 * This is the single API that components should use for case persistence.
 * Backend selection happens transparently based on whether Supabase is
 * configured at runtime.
 */

import type { CaseRecord, NewCaseInput, SaveResult } from './types';
import { saveCaseLocal, listCasesLocal, getCaseLocal } from './local-store';
import { saveCaseSupabase, listCasesSupabase, getCaseSupabase } from './supabase-store';

/**
 * Save a new case. Always returns a SaveResult — never throws.
 * Tries Supabase first (if configured), then falls back to localStorage.
 * On Supabase failure, the case is still saved locally so the user doesn't
 * lose data.
 */
export async function saveCase(input: NewCaseInput): Promise<SaveResult> {
  // Try Supabase first
  const supabaseResult = await saveCaseSupabase(input);

  if (supabaseResult && !supabaseResult.error) {
    // Supabase succeeded
    return supabaseResult;
  }

  // Supabase not configured OR failed — fall back to local
  const localResult = saveCaseLocal(input);

  // If Supabase was attempted but failed, surface the error alongside the
  // local save so the UI can show a "saved offline" message
  if (supabaseResult?.error) {
    return {
      ...localResult,
      error: `Supabase save failed, saved locally: ${supabaseResult.error}`,
    };
  }

  return localResult;
}

/**
 * List cases for the current user/anon ID.
 * Merges Supabase + local results when both are available (local can hold
 * cases from before Supabase was configured).
 */
export async function listCases(): Promise<CaseRecord[]> {
  const supabaseCases = await listCasesSupabase();
  const localCases = listCasesLocal();

  if (supabaseCases === null) {
    // Supabase unavailable — local only
    return localCases;
  }

  // Merge, dedupe by ID, Supabase takes precedence
  const seen = new Set(supabaseCases.map(c => c.id));
  const merged = [...supabaseCases, ...localCases.filter(c => !seen.has(c.id))];
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Get a single case by ID. Checks Supabase first, then local.
 */
export async function getCase(id: string): Promise<CaseRecord | null> {
  const supabaseCase = await getCaseSupabase(id);
  if (supabaseCase) return supabaseCase;
  return getCaseLocal(id);
}

/**
 * Returns true if Supabase is configured and reachable. Useful for UI
 * messages like "儲存於雲端" vs "儲存於本機".
 */
export function isCloudStorageAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Re-export types for convenience
export type { CaseRecord, NewCaseInput, SaveResult } from './types';
