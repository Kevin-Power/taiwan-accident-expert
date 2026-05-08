-- Migration 003: Tighten anonymous RLS by requiring anonymous_id match in WHERE clause
--
-- Previous policies allowed anon SELECT/UPDATE on any case with anonymous_id IS NOT NULL.
-- That meant a leaked case ID could expose the case to anyone.
--
-- New strategy: Require the client to provide an anonymous_id filter in their query.
-- The RLS USING clause references current_setting('request.headers', true) to read a
-- custom 'x-anonymous-id' header that the Supabase client should send.
--
-- For MVP we use a simpler approach: drop the broad anon read/update policies and
-- rely on the application layer always filtering by anonymous_id (enforced in
-- supabase-store.ts). Anon INSERT remains allowed for new case creation.

-- Drop the overly permissive anon SELECT and UPDATE policies
DROP POLICY IF EXISTS "Anonymous users can read guest cases by anonymous_id" ON cases;
DROP POLICY IF EXISTS "Anonymous users can update their own guest cases" ON cases;

-- Create a more restrictive SELECT policy that requires the query filter to match
-- a header-supplied anonymous_id. If the client doesn't send the header or doesn't
-- include the filter, no rows match.
CREATE POLICY "Anonymous SELECT requires anonymous_id header match"
  ON cases FOR SELECT
  TO anon
  USING (
    anonymous_id IS NOT NULL
    AND user_id IS NULL
    AND anonymous_id::text = current_setting('request.headers', true)::json->>'x-anonymous-id'
  );

CREATE POLICY "Anonymous UPDATE requires anonymous_id header match"
  ON cases FOR UPDATE
  TO anon
  USING (
    anonymous_id IS NOT NULL
    AND user_id IS NULL
    AND anonymous_id::text = current_setting('request.headers', true)::json->>'x-anonymous-id'
  )
  WITH CHECK (
    anonymous_id IS NOT NULL
    AND user_id IS NULL
    AND anonymous_id::text = current_setting('request.headers', true)::json->>'x-anonymous-id'
  );

-- INSERT remains as-is (allows creating new guest cases)
-- Authenticated user policy remains as-is
