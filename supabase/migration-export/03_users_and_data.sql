-- =====================================================================
-- 03 - AUTH ACCOUNTS + PER-USER DATA
-- Generated from the live Lovable Cloud database.
-- Run AFTER 02_content_data.sql.
-- Re-runnable: every row uses ON CONFLICT ... DO NOTHING.
-- Contains NO secrets, API keys or password hashes.
-- =====================================================================

-- Password hashes cannot be exported from the source project, so each account
-- is recreated with the SAME user UUID (all history stays linked) and one
-- shared temporary password. To use a different one, find-and-replace every
-- occurrence of 'ChangeMe!2026' below before running this file.

-- ---------- auth accounts (5) ----------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000', '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6', 'authenticated', 'authenticated',
  'admin@lovable.app', crypt('ChangeMe!2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id": "admin", "full_name": "Administrator"}'::jsonb, false, false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) VALUES (
  gen_random_uuid(), '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6', '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6',
  '{"sub":"5ca75a45-1424-4cd6-9c63-bf2c6ca116b6","email":"admin@lovable.app"}'::jsonb, 'email', now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc', 'authenticated', 'authenticated',
  'svsak01@svs.local', crypt('ChangeMe!2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id": "svsak01", "full_name": "Akanksh"}'::jsonb, false, false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc', 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc',
  '{"sub":"ee2746c3-32d5-4cf4-883d-48f846bcd1fc","email":"svsak01@svs.local"}'::jsonb, 'email', now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000', 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40', 'authenticated', 'authenticated',
  'svsmani01@svs.local', crypt('ChangeMe!2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id": "svsmani01", "full_name": "Manikanth"}'::jsonb, false, false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40', 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40',
  '{"sub":"ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40","email":"svsmani01@svs.local"}'::jsonb, 'email', now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000', '734cbce1-7426-4444-9039-c0baaabfcc0a', 'authenticated', 'authenticated',
  'qa.teachera@svs.local', crypt('ChangeMe!2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id": "qa.teachera", "full_name": "QA Teacher A"}'::jsonb, false, false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) VALUES (
  gen_random_uuid(), '734cbce1-7426-4444-9039-c0baaabfcc0a', '734cbce1-7426-4444-9039-c0baaabfcc0a',
  '{"sub":"734cbce1-7426-4444-9039-c0baaabfcc0a","email":"qa.teachera@svs.local"}'::jsonb, 'email', now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0000-000000000000', '6dae8282-8068-4b3e-aea4-71da2176e762', 'authenticated', 'authenticated',
  'qa.teacherb@svs.local', crypt('ChangeMe!2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"login_id": "qa.teacherb", "full_name": "QA Teacher B"}'::jsonb, false, false
) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, created_at, updated_at
) VALUES (
  gen_random_uuid(), '6dae8282-8068-4b3e-aea4-71da2176e762', '6dae8282-8068-4b3e-aea4-71da2176e762',
  '{"sub":"6dae8282-8068-4b3e-aea4-71da2176e762","email":"qa.teacherb@svs.local"}'::jsonb, 'email', now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- ---------- per-user application data ----------
-- profiles: 5 row(s)
INSERT INTO public.profiles (id, full_name, email, phone, department, avatar_url, status, last_login_at, created_at, updated_at, login_id) VALUES ('5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'Administrator', 'admin@lovable.app', NULL, NULL, NULL, 'active'::public.user_status, '2026-08-11T05:43:30.48+00:00', '2026-08-01T06:02:39.473252+00:00', '2026-08-11T05:43:30.608691+00:00', 'admin') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, full_name, email, phone, department, avatar_url, status, last_login_at, created_at, updated_at, login_id) VALUES ('ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'Akanksh', 'svsak01@svs.local', '9490854669', 'Support', NULL, 'active'::public.user_status, '2026-08-05T04:44:11.743+00:00', '2026-08-01T06:30:58.127559+00:00', '2026-08-05T04:44:12.241672+00:00', 'svsak01') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, full_name, email, phone, department, avatar_url, status, last_login_at, created_at, updated_at, login_id) VALUES ('ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Manikanth', 'svsmani01@svs.local', '9490854669', 'High School', NULL, 'active'::public.user_status, '2026-08-03T04:32:58.211+00:00', '2026-08-01T07:09:25.799882+00:00', '2026-08-03T04:32:58.350707+00:00', 'svsmani01') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, full_name, email, phone, department, avatar_url, status, last_login_at, created_at, updated_at, login_id) VALUES ('734cbce1-7426-4444-9039-c0baaabfcc0a'::uuid, 'QA Teacher A', 'qa.teachera@svs.local', '9999999999', 'Primary', NULL, 'inactive'::public.user_status, '2026-08-05T05:05:50.002+00:00', '2026-08-05T04:57:21.98113+00:00', '2026-08-05T05:15:30.377391+00:00', 'qa.teachera') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, full_name, email, phone, department, avatar_url, status, last_login_at, created_at, updated_at, login_id) VALUES ('6dae8282-8068-4b3e-aea4-71da2176e762'::uuid, 'QA Teacher B', 'qa.teacherb@svs.local', '9999999999', 'Primary', NULL, 'inactive'::public.user_status, '2026-08-05T05:04:35.246+00:00', '2026-08-05T04:57:32.608221+00:00', '2026-08-05T05:15:22.888672+00:00', 'qa.teacherb') ON CONFLICT (id) DO NOTHING;

-- user_roles: 5 row(s)
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('a21dbecf-db94-47e6-b943-11db79ce2cc1'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'admin'::public.app_role, '2026-08-01T06:02:38.824101+00:00') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('3b994110-bb49-4e35-a3e9-3066a46f160e'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'support_staff'::public.app_role, '2026-08-01T06:30:58.337844+00:00') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('8a1657d0-6cac-49f0-8590-d45b0982087f'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'office_staff'::public.app_role, '2026-08-01T07:09:26.00245+00:00') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('25001c4e-ef15-473e-bcd9-5d50e75efeb6'::uuid, '734cbce1-7426-4444-9039-c0baaabfcc0a'::uuid, 'teacher'::public.app_role, '2026-08-05T04:57:22.195988+00:00') ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('fea39cfc-9a3b-4c70-8c11-d8f071a096a8'::uuid, '6dae8282-8068-4b3e-aea4-71da2176e762'::uuid, 'teacher'::public.app_role, '2026-08-05T04:57:32.820262+00:00') ON CONFLICT (user_id, role) DO NOTHING;

-- user_stats: 5 row(s)
INSERT INTO public.user_stats (user_id, xp, growth_score, practice_minutes, conversation_count, daily_streak, longest_streak, weekly_goal_minutes, monthly_goal_minutes, last_session_date, created_at, updated_at) VALUES ('ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 247, 59, 13, 7, 2, 2, 25, 100, '2026-08-05', '2026-08-01T06:30:58.576359+00:00', '2026-08-05T04:48:05.641798+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_stats (user_id, xp, growth_score, practice_minutes, conversation_count, daily_streak, longest_streak, weekly_goal_minutes, monthly_goal_minutes, last_session_date, created_at, updated_at) VALUES ('5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 160, 17, 6, 6, 1, 2, 25, 100, '2026-08-11', '2026-08-01T06:43:34.050549+00:00', '2026-08-11T05:43:49.966692+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_stats (user_id, xp, growth_score, practice_minutes, conversation_count, daily_streak, longest_streak, weekly_goal_minutes, monthly_goal_minutes, last_session_date, created_at, updated_at) VALUES ('ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 236, 60, 11, 7, 3, 3, 25, 100, '2026-08-03', '2026-08-01T07:09:26.496038+00:00', '2026-08-03T05:07:15.863024+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_stats (user_id, xp, growth_score, practice_minutes, conversation_count, daily_streak, longest_streak, weekly_goal_minutes, monthly_goal_minutes, last_session_date, created_at, updated_at) VALUES ('734cbce1-7426-4444-9039-c0baaabfcc0a'::uuid, 31, 60, 1, 1, 1, 1, 25, 100, '2026-08-05', '2026-08-05T04:57:22.408544+00:00', '2026-08-05T05:03:24.395112+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_stats (user_id, xp, growth_score, practice_minutes, conversation_count, daily_streak, longest_streak, weekly_goal_minutes, monthly_goal_minutes, last_session_date, created_at, updated_at) VALUES ('6dae8282-8068-4b3e-aea4-71da2176e762'::uuid, 0, 0, 0, 0, 0, 0, 25, 100, NULL, '2026-08-05T04:57:33.030556+00:00', '2026-08-05T04:57:33.030556+00:00') ON CONFLICT (user_id) DO NOTHING;

-- user_settings: 5 row(s)
INSERT INTO public.user_settings (user_id, settings, created_at, updated_at) VALUES ('ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, '{"theme": "light", "difficulty": "beginner", "voiceSpeed": "normal", "reminderTime": "18:00", "soundEffects": true, "sessionLength": 10, "weeklySummary": false, "dailyGoalMinutes": 15, "showTranslations": true, "achievementAlerts": true, "practiceReminders": true, "preferredLanguage": "english", "showOnLeaderboard": true, "emailAnnouncements": true, "defaultPracticeMode": "classroom", "autoPlayPronunciation": false, "shareProgressWithAdmin": true}'::jsonb, '2026-08-01T06:30:59.1205+00:00', '2026-08-04T07:12:26.607936+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_settings (user_id, settings, created_at, updated_at) VALUES ('5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, '{}'::jsonb, '2026-08-01T06:43:46.925469+00:00', '2026-08-01T06:43:46.925469+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_settings (user_id, settings, created_at, updated_at) VALUES ('ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, '{"theme": "system", "difficulty": "beginner", "voiceSpeed": "normal", "reminderTime": "18:00", "soundEffects": true, "sessionLength": 10, "weeklySummary": false, "dailyGoalMinutes": 15, "showTranslations": true, "achievementAlerts": true, "practiceReminders": true, "preferredLanguage": "telugu", "showOnLeaderboard": true, "emailAnnouncements": true, "defaultPracticeMode": "classroom", "autoPlayPronunciation": false, "shareProgressWithAdmin": true}'::jsonb, '2026-08-01T07:09:26.700527+00:00', '2026-08-01T07:12:54.750589+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_settings (user_id, settings, created_at, updated_at) VALUES ('734cbce1-7426-4444-9039-c0baaabfcc0a'::uuid, '{}'::jsonb, '2026-08-05T04:57:22.623816+00:00', '2026-08-05T04:57:22.623816+00:00') ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_settings (user_id, settings, created_at, updated_at) VALUES ('6dae8282-8068-4b3e-aea4-71da2176e762'::uuid, '{}'::jsonb, '2026-08-05T04:57:33.578329+00:00', '2026-08-05T04:57:33.578329+00:00') ON CONFLICT (user_id) DO NOTHING;

-- practice_sessions: 21 row(s)
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('6bec238d-378e-4f19-a5ee-02f8850e842f'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'Classroom Teaching', 2, 5, 75, 70, 75, 78, 80, NULL, '2026-08-01T06:34:02.912247+00:00', '2026-08-01T06:34:02.912247+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('874143fd-fb53-4dd8-bee7-9d7b54735c3c'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Classroom Teaching', 1, 5, 80, 75, 80, 85, 80, NULL, '2026-08-01T07:12:29.342446+00:00', '2026-08-01T07:12:29.342446+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('2e732523-9dcf-402a-91a8-4a678f6672cd'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Classroom Teaching', 3, 3, 74, 72, 70, 75, 80, NULL, '2026-08-02T09:39:30.520904+00:00', '2026-08-02T09:39:30.520904+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('28fcdeba-e663-4e9e-bbaf-fe5687056a5e'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Free Conversation', 2, 5, 70, 65, 70, 72, 75, NULL, '2026-08-02T11:13:09.058787+00:00', '2026-08-02T11:13:09.058787+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('37e8daa7-d9f0-46a4-9c02-240aabef021b'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Classroom Teaching', 2, 1, 94, 95, 90, 95, 95, NULL, '2026-08-02T11:13:49.229292+00:00', '2026-08-02T11:13:49.229292+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('841e307a-70d0-422b-beac-10c3c1832c8d'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Classroom Teaching', 1, 1, 100, 100, 100, 100, 100, NULL, '2026-08-03T04:43:14.785448+00:00', '2026-08-03T04:43:14.785448+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('24d5621a-ca2f-40b1-b972-b6471f83ef44'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Classroom Teaching', 1, 0, 0, 0, 0, 0, 0, NULL, '2026-08-03T04:43:50.852407+00:00', '2026-08-03T04:43:50.852407+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('bad854c2-c5b1-4ac3-9e58-2b8ab1626bd6'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'Classroom Teaching', 1, 0, 0, 0, 0, 0, 0, NULL, '2026-08-03T05:07:15.722893+00:00', '2026-08-03T05:07:15.722893+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('e5fdcc96-65fb-42ef-9ac3-692db80a6c75'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'Classroom Teaching', 1, 1, 0, 0, 0, 0, 0, NULL, '2026-08-03T05:16:56.238734+00:00', '2026-08-03T05:16:56.238734+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('4ee2b811-3800-4d98-bcaf-b632f0a9d597'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'Classroom Teaching', 1, 1, 100, 100, 100, 100, 100, NULL, '2026-08-04T04:35:09.076364+00:00', '2026-08-04T04:35:09.076364+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('4715e2db-5abc-46ee-96e4-ffa96718ad44'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'Classroom Teaching', 1, 1, 0, 0, 0, 0, 0, NULL, '2026-08-04T04:35:32.116097+00:00', '2026-08-04T04:35:32.116097+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('9639bf46-a04a-4300-8275-3b7ec3d80a04'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'Classroom Teaching', 1, 0, 0, 0, 0, 0, 0, NULL, '2026-08-04T06:36:30.673728+00:00', '2026-08-04T06:36:30.673728+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('bca43f6c-b126-4940-93b8-32dba35f5c61'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'how was your day?', 1, 1, 0, 0, 0, 0, 0, NULL, '2026-08-04T06:36:59.80389+00:00', '2026-08-04T06:36:59.80389+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('d7274fdd-d521-4d2f-a935-9381fa801d17'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'Classroom Teaching', 1, 1, 100, 100, 100, 100, 100, NULL, '2026-08-04T08:59:13.151059+00:00', '2026-08-04T08:59:13.151059+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('4f27cf26-2087-4ff7-b8c0-0aebd1cfefd1'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'Classroom Teaching', 1, 1, 0, 0, 0, 0, 0, NULL, '2026-08-04T09:03:13.318305+00:00', '2026-08-04T09:03:13.318305+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('904d122e-d2e7-4ebb-a70d-e0fa03a8a43a'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'how was your day?', 2, 2, 44, 35, 50, 40, 50, NULL, '2026-08-04T09:05:55.075684+00:00', '2026-08-04T09:05:55.075684+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('6c912831-dc69-4069-9ad3-1e2596fb3793'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'Classroom Teaching', 2, 3, 62, 55, 60, 65, 70, NULL, '2026-08-04T09:10:40.29661+00:00', '2026-08-04T09:10:40.29661+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('c0be98eb-d442-43b4-b63e-0ced8e94bd94'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'introduce yourself', 1, 2, 56, 52, 58, 55, 60, NULL, '2026-08-04T09:23:02.009736+00:00', '2026-08-04T09:23:02.009736+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('a8198620-b112-47ae-9fc8-d20bf7ef5a53'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'how was your day?', 4, 3, 78, 72, 75, 80, 85, NULL, '2026-08-05T04:48:05.472408+00:00', '2026-08-05T04:48:05.472408+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('f78f1f18-8e82-44a1-aef8-a98b88dd1b5e'::uuid, '734cbce1-7426-4444-9039-c0baaabfcc0a'::uuid, 'Classroom Teaching', 1, 3, 60, 50, 65, 60, 70, NULL, '2026-08-05T05:03:24.167453+00:00', '2026-08-05T05:03:24.167453+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.practice_sessions (id, user_id, mode_title, duration_minutes, message_count, overall, grammar, vocabulary, fluency, confidence, notes, created_at, updated_at) VALUES ('00d4924b-2391-440e-8f85-3b902483ead4'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'how was your day?', 1, 1, 0, 0, 0, 0, 0, NULL, '2026-08-11T05:43:49.769024+00:00', '2026-08-11T05:43:49.769024+00:00') ON CONFLICT (id) DO NOTHING;

-- user_achievements: 13 row(s)
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('4d7ef6d0-0245-4fcc-a696-08d37ca784db'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'first-conversation', '2026-08-01T06:34:03.88896+00:00', '2026-08-01T06:34:03.88896+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('cfe336be-917d-4023-b77f-6dbe26031921'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'first-conversation', '2026-08-01T07:12:29.560444+00:00', '2026-08-01T07:12:29.560444+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('2a7a1c72-66bb-452f-aaf8-6237e5ead3e4'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'fluency-hero', '2026-08-01T07:12:29.560444+00:00', '2026-08-01T07:12:29.560444+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('2442a0a8-17d3-4127-9100-9d45a944110e'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'grammar-star', '2026-08-02T11:13:49.590025+00:00', '2026-08-02T11:13:49.590025+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('0ab6d842-d9e7-41be-8d35-70d4439511b6'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'vocabulary-master', '2026-08-02T11:13:49.590025+00:00', '2026-08-02T11:13:49.590025+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('a018b751-2a50-4859-8cac-7f2912e2b267'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'first-conversation', '2026-08-03T05:16:56.576342+00:00', '2026-08-03T05:16:56.576342+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('280dcb9c-c03b-4594-865c-f497151d82e8'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'grammar-star', '2026-08-04T04:35:09.41825+00:00', '2026-08-04T04:35:09.41825+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('660893ec-855d-4ee7-9488-24650f112fbc'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'vocabulary-master', '2026-08-04T04:35:09.41825+00:00', '2026-08-04T04:35:09.41825+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('ae82e553-ff19-4131-b761-a20e881f0423'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'fluency-hero', '2026-08-04T04:35:09.41825+00:00', '2026-08-04T04:35:09.41825+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('7ebf12a0-a3a1-4dc1-a825-09c0268cb1d5'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'grammar-star', '2026-08-04T08:59:13.573355+00:00', '2026-08-04T08:59:13.573355+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('f8cd2415-a6b3-4e59-9ae3-cd505c30cb91'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'vocabulary-master', '2026-08-04T08:59:13.573355+00:00', '2026-08-04T08:59:13.573355+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('bff68434-cddf-442f-9cd2-7bffc1f837ef'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'fluency-hero', '2026-08-04T08:59:13.573355+00:00', '2026-08-04T08:59:13.573355+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;
INSERT INTO public.user_achievements (id, user_id, achievement_id, unlocked_at, created_at) VALUES ('3d18d365-6c17-4021-8ec7-d1581eba9b73'::uuid, '734cbce1-7426-4444-9039-c0baaabfcc0a'::uuid, 'first-conversation', '2026-08-05T05:03:24.610677+00:00', '2026-08-05T05:03:24.610677+00:00') ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- user_learning_items: 3 row(s)
INSERT INTO public.user_learning_items (id, user_id, bucket, namespace, item_id, created_at) VALUES ('9f75abd1-0ece-4113-ae92-5d9b59c51a3d'::uuid, 'ee2746c3-32d5-4cf4-883d-48f846bcd1fc'::uuid, 'learned', 'daily-word', 'punctual', '2026-08-01T06:34:47.560515+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_learning_items (id, user_id, bucket, namespace, item_id, created_at) VALUES ('00238d4b-2eeb-47a8-b3a5-0510379b5756'::uuid, 'ef279e5c-a90a-4fe6-ae2a-a9d357d0dc40'::uuid, 'learned', 'daily-word', 'punctual', '2026-08-01T07:10:51.322873+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_learning_items (id, user_id, bucket, namespace, item_id, created_at) VALUES ('64d08864-5dad-445b-8829-bf5db15c53e9'::uuid, '5ca75a45-1424-4cd6-9c63-bf2c6ca116b6'::uuid, 'learned', 'daily-word', 'curriculum', '2026-08-03T08:41:52.379194+00:00') ON CONFLICT (id) DO NOTHING;

-- user_daily_progress: no rows in source

-- announcement_reads: no rows in source

-- notifications: no rows in source
