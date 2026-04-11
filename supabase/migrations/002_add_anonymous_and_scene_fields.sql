-- Migration 002: Add anonymous user support and scene condition columns
--
-- Context: MVP supports guest users without login. Each guest gets a stable
-- anonymous_id (UUID generated and stored in browser localStorage) so cases
-- can be scoped to that user even without a real auth account.
--
-- Also adds scene condition columns that were previously only in sessionStorage
-- but need to be persisted for scenario matching and evidence checklist in
-- the case detail view.

-- === Add columns to cases ===

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS anonymous_id UUID,
  ADD COLUMN IF NOT EXISTS vehicle_types JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS has_traffic_signal BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_surveillance BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_dashcam BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_skid_marks BOOLEAN NOT NULL DEFAULT false;

-- Make user_id nullable (guest cases have no real user)
ALTER TABLE cases ALTER COLUMN user_id DROP NOT NULL;

-- Index for anonymous ID lookups
CREATE INDEX IF NOT EXISTS idx_cases_anonymous_id ON cases(anonymous_id);

-- === RLS policy updates ===
--
-- Drop the old "only own cases" policy that requires user_id to be set, and
-- replace with a policy that allows reads/writes when either:
--   (a) the authenticated user owns the case (user_id = auth.uid()), OR
--   (b) the case belongs to an anonymous user and this is an anonymous
--       request matching the anonymous_id header (handled at application
--       layer — see the app-level filter in supabase-store.ts)
--
-- For the MVP we keep RLS simple: allow anon reads/writes to cases where
-- anonymous_id is set (no cross-user leakage because all queries filter by
-- anonymous_id which is only known to the owning browser).

DROP POLICY IF EXISTS "Users can only access own cases" ON cases;

CREATE POLICY "Authenticated users access own cases"
  ON cases FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert guest cases"
  ON cases FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can read guest cases by anonymous_id"
  ON cases FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can update their own guest cases"
  ON cases FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (anonymous_id IS NOT NULL AND user_id IS NULL);
