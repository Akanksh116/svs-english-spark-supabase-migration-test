# Migration package — external Supabase project `sgagofrwazxucxqkkvkg`

Prepared and validated on 2026-08-12 against the live production database.
This is **preparation only**: nothing here has been deployed, the current
backend is untouched, and no data was deleted.

## Files

| File | Contents |
| --- | --- |
| `01_schema.sql` | `pgcrypto`, 5 enum types, 15 tables, 38 constraints (PK / FK / unique / check), all indexes, 3 functions, 12 triggers, Data-API grants, RLS enabled on every table, 44 policies |
| `02_content_data.sql` | Shared content: `app_settings` (1), `challenge_categories` (6), `daily_challenges` (2). `announcements` and `roles` are empty in the source. |
| `03_users_and_data.sql` | 5 auth accounts + identities, then `profiles` (5), `user_roles` (5), `user_stats` (5), `user_settings` (5), `practice_sessions` (21), `user_achievements` (13), `user_learning_items` (3) |

All original UUIDs are preserved, so every session, achievement, role and
setting stays attached to the correct person.

No API keys, passwords, service-role keys or password hashes appear in any file.

## Run order

Supabase Dashboard → SQL Editor → New query → paste → Run, in this order:

1. `01_schema.sql`
2. `02_content_data.sql`
3. `03_users_and_data.sql`

Every file is re-runnable: objects use `IF NOT EXISTS` / `CREATE OR REPLACE` /
`DO $$ ... EXCEPTION WHEN duplicate_object`, and every row uses
`ON CONFLICT ... DO NOTHING`. A partial run can be repeated safely.

## Authentication — what can and cannot be migrated

Migrated:

- user UUIDs (identical to the source, so all foreign keys still resolve)
- email addresses (`login_id@svs.local` internal addresses, plus the admin account)
- `raw_user_meta_data` (`login_id`, `full_name`)
- one `auth.identities` row per user, provider `email`, `provider_id` = user id
- email confirmed state

Cannot be migrated:

- **password hashes** — Supabase never exposes them outside a project.
  `03_users_and_data.sql` therefore sets one shared temporary password:

  ```
  ChangeMe!2026
  ```

  To use a different one, find-and-replace `ChangeMe!2026` in that file before
  running it. Reset individual passwords from Admin → Users afterwards.
- sessions, refresh tokens, MFA factors, audit log — users simply sign in again.
- auth provider configuration (see below).

Staff sign in with their **User ID**, not an email, exactly as today.

## Manual steps in the new project

1. Auth → Providers: enable **Email**, disable public sign-ups (admins create
   accounts), and disable email confirmations — the `@svs.local` addresses are
   internal and cannot receive mail.
2. Re-add the Gemini API key secrets (`GEMINI_API_KEY`, `GEMINI_API_KEY_1…5`).
   Secrets never transfer between backends and are deliberately absent here.
3. Do **not** create a trigger on `auth.users`. `public.handle_new_user()` is
   included for parity, but the source project has no trigger bound to it — the
   app creates profile/role/stats/settings rows explicitly in
   `src/services/users.server.ts`. Adding the trigger would duplicate rows.

## Verification after running

```sql
select count(*) from public.profiles;           -- 5
select count(*) from public.practice_sessions;  -- 21
select count(*) from public.user_achievements;  -- 13
select count(*) from pg_policies where schemaname='public';   -- 44
select count(*) from information_schema.triggers
  where trigger_schema='public';                -- 12
select count(*) from auth.users;                -- 5
```

## Validation performed on this package

- All three files parse cleanly with the real PostgreSQL grammar
  (226 + 9 + 67 statements, zero syntax errors).
- Policy names diffed against the live database: 44 / 44, no missing or extra.
- All 38 live constraints and every live index present in `01_schema.sql`.
- Data files regenerated directly from the live tables, so row counts match
  the production database exactly.
