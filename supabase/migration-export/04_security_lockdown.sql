-- Security lockdown: derived stats and practice scores become server-write-only.
--
-- Run this once against the standalone Supabase project (SQL editor).
-- Idempotent and non-destructive: no data is touched, only privileges/policies.
--
-- Rationale: the browser previously held INSERT/UPDATE rights on
-- practice_sessions, user_stats and user_achievements, so a signed-in teacher
-- could forge XP, streaks, growth score and evaluation scores for their own
-- account. Those writes now happen exclusively in server code
-- (src/services/practice.server.ts) with the service-role key, after the AI
-- evaluation is produced server-side for the authenticated user.

-- 1. Practice sessions: users may read their own rows only.
DROP POLICY IF EXISTS "Users insert own sessions" ON public.practice_sessions;
REVOKE INSERT, UPDATE, DELETE ON public.practice_sessions FROM authenticated;

-- 2. User stats: users may read their own row only.
DROP POLICY IF EXISTS "Users insert own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users update own stats" ON public.user_stats;
REVOKE INSERT, UPDATE, DELETE ON public.user_stats FROM authenticated;

-- 3. Achievements: unlocked server-side only.
DROP POLICY IF EXISTS "Users insert own achievements" ON public.user_achievements;
REVOKE INSERT, UPDATE, DELETE ON public.user_achievements FROM authenticated;

-- Existing SELECT policies ("Users view own ...", admin analytics policies)
-- and all service_role grants stay exactly as they are.
