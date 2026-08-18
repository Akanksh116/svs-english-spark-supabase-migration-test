-- Optional hardening: stop teachers from editing their own account state.
--
-- Run once against the standalone Supabase project (SQL editor).
-- Idempotent, non-destructive: privileges only, no data or policy is dropped.
--
-- Rationale: the "Users update own profile" policy lets a signed-in teacher
-- update ANY column of their own profiles row, including `status` and
-- `login_id`. Sign-in itself is already safe (deactivation bans the auth user,
-- so a self-flipped status cannot restore access), but a teacher could still
-- make the admin user list show a banned account as "active", or rename their
-- own login id. Column-level privileges close that while keeping the profile
-- edit form (name / phone / department / avatar) working.
--
-- Admin edits are unaffected: they run server-side with the service role.

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, department, avatar_url) ON public.profiles TO authenticated;
