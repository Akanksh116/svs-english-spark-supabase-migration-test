-- =====================================================================
-- 02 - SHARED CONTENT DATA
-- Generated from the live Lovable Cloud database.
-- Run AFTER 01_schema.sql.
-- Re-runnable: every row uses ON CONFLICT ... DO NOTHING.
-- Contains NO secrets, API keys or password hashes.
-- =====================================================================

-- app_settings: 1 row(s)
INSERT INTO public.app_settings (id, school, practice, users, notifications, security, ai, appearance, updated_by, created_at, updated_at) VALUES ('school', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, NULL, '2026-08-01T10:25:21.817228+00:00', '2026-08-01T10:25:21.817228+00:00') ON CONFLICT (id) DO NOTHING;

-- challenge_categories: 6 row(s)
INSERT INTO public.challenge_categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES ('a5648f67-67c1-43ee-84b9-a32809ed2a42'::uuid, 'Classroom Teaching', 'classroom-teaching', 'English for classroom instruction', 1, true, '2026-08-03T04:25:16.314279+00:00', '2026-08-03T04:25:16.314279+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES ('153d6754-7db9-42e4-ae84-c7a1ea22a790'::uuid, 'Parent Meeting', 'parent-meeting', 'English for parent interactions', 2, true, '2026-08-03T04:25:16.314279+00:00', '2026-08-03T04:25:16.314279+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES ('5c99d510-ec33-4acd-9388-216d2dece78f'::uuid, 'Office Communication', 'office-communication', 'English for staff and office work', 3, true, '2026-08-03T04:25:16.314279+00:00', '2026-08-03T04:25:16.314279+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES ('9dcf3b96-29ee-4b97-826a-e0024ae0dd76'::uuid, 'Telephone English', 'telephone-english', 'English for phone conversations', 4, true, '2026-08-03T04:25:16.314279+00:00', '2026-08-03T04:25:16.314279+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES ('73935af4-fa03-4193-98b7-14f482dd6354'::uuid, 'Morning Assembly', 'morning-assembly', 'English for assembly announcements', 5, true, '2026-08-03T04:25:16.314279+00:00', '2026-08-03T04:25:16.314279+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES ('1202742c-1f1e-410a-abfb-d5e37841ccb3'::uuid, 'General English', 'general-english', 'Everyday general English practice', 6, true, '2026-08-03T04:25:16.314279+00:00', '2026-08-03T04:25:16.314279+00:00') ON CONFLICT (id) DO NOTHING;

-- daily_challenges: 2 row(s)
INSERT INTO public.daily_challenges (id, title, description, category_id, difficulty, estimated_duration_minutes, display_order, is_active, created_at, updated_at) VALUES ('3b440562-0371-4669-b12a-19df07253edf'::uuid, 'how was your day?', 'just explain what happened today.', '1202742c-1f1e-410a-abfb-d5e37841ccb3'::uuid, 'beginner'::public.challenge_difficulty, 5, 0, true, '2026-08-03T04:32:02.671077+00:00', '2026-08-03T04:32:02.671077+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.daily_challenges (id, title, description, category_id, difficulty, estimated_duration_minutes, display_order, is_active, created_at, updated_at) VALUES ('0986adf9-a46d-46b8-aeb5-fedaac75295e'::uuid, 'introduce yourself', '..', 'a5648f67-67c1-43ee-84b9-a32809ed2a42'::uuid, 'beginner'::public.challenge_difficulty, 2, 0, true, '2026-08-04T09:12:29.772833+00:00', '2026-08-04T09:12:29.772833+00:00') ON CONFLICT (id) DO NOTHING;

-- announcements: no rows in source

-- roles: no rows in source
