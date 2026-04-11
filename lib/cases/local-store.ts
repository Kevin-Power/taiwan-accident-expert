/**
 * Local (browser-only) case store — fallback when Supabase is unavailable or
 * the user has not configured credentials. Uses localStorage as persistence.
 *
 * This lets guest users save cases even in offline / private-mode situations.
 * When Supabase is later wired up, cases can be migrated by reading this
 * store and POSTing to the API.
 */

import type { CaseRecord, NewCaseInput, SaveResult } from './types';

const STORAGE_KEY = 'accident_expert_local_cases';

function readAll(): CaseRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(cases: CaseRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch {
    // Storage may be full or disabled — swallow
  }
}

function generateCaseId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ACC-${date}-${rand}`;
}

export function saveCaseLocal(input: NewCaseInput): SaveResult {
  const now = new Date().toISOString();
  const record: CaseRecord = {
    ...input,
    id: generateCaseId(),
    createdAt: now,
    updatedAt: now,
  };

  const cases = readAll();
  cases.unshift(record);
  // Cap at 50 cases to avoid unlimited storage growth
  writeAll(cases.slice(0, 50));

  return {
    caseId: record.id,
    backend: 'local',
  };
}

export function listCasesLocal(): CaseRecord[] {
  return readAll();
}

export function getCaseLocal(id: string): CaseRecord | null {
  return readAll().find(c => c.id === id) || null;
}

export function updateCaseLocal(id: string, updates: Partial<CaseRecord>): boolean {
  const cases = readAll();
  const idx = cases.findIndex(c => c.id === id);
  if (idx === -1) return false;
  cases[idx] = {
    ...cases[idx],
    ...updates,
    id: cases[idx].id,
    updatedAt: new Date().toISOString(),
  };
  writeAll(cases);
  return true;
}

export function deleteCaseLocal(id: string): boolean {
  const cases = readAll();
  const filtered = cases.filter(c => c.id !== id);
  if (filtered.length === cases.length) return false;
  writeAll(filtered);
  return true;
}

export function clearAllLocal(): void {
  writeAll([]);
}
