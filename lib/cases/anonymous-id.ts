/**
 * Anonymous user ID management.
 *
 * Guest users get a stable UUID stored in localStorage. This lets them save
 * cases without creating an account. When they later sign up, we can migrate
 * cases by matching the anonymous ID.
 */

const STORAGE_KEY = 'accident_expert_anon_id';

function generateUuid(): string {
  // Prefer crypto.randomUUID (modern browsers & Node 19+)
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get (or create) a stable anonymous user ID.
 * Safe to call multiple times — returns the same ID within a browser.
 * Returns null if called on the server (no window/localStorage).
 */
export function getAnonymousId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateUuid();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Private mode / disabled storage — return a session-scoped UUID
    return generateUuid();
  }
}

/**
 * Clear the anonymous ID. Used when upgrading a guest to a real account
 * (after case migration completes).
 */
export function clearAnonymousId(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
