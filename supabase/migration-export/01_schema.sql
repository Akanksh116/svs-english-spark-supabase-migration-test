-- =====================================================================
-- SVS English Spark - complete schema for your own Supabase project
-- Target project: sgagofrwazxucxqkkvkg
-- HOW TO RUN: Supabase Dashboard > SQL Editor > New query > paste > Run
-- Run this file FIRST, before 02_data.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- 1. ENUM TYPES ----------
DO $$ BEGIN
  CREATE TYPE public.announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.announcement_status AS ENUM ('draft', 'published', 'scheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'receptionist', 'office_staff', 'support_staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.challenge_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- 2. TABLES ----------
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  announcement_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  audience app_role,
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp with time zone,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  category text,
  priority announcement_priority DEFAULT 'normal'::announcement_priority NOT NULL,
  status announcement_status DEFAULT 'draft'::announcement_status NOT NULL,
  expires_at timestamp with time zone,
  is_pinned boolean DEFAULT false NOT NULL,
  target_departments text[]
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id text DEFAULT 'school'::text NOT NULL,
  school jsonb DEFAULT '{}'::jsonb NOT NULL,
  practice jsonb DEFAULT '{}'::jsonb NOT NULL,
  users jsonb DEFAULT '{}'::jsonb NOT NULL,
  notifications jsonb DEFAULT '{}'::jsonb NOT NULL,
  security jsonb DEFAULT '{}'::jsonb NOT NULL,
  ai jsonb DEFAULT '{}'::jsonb NOT NULL,
  appearance jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.challenge_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  display_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  difficulty challenge_difficulty DEFAULT 'beginner'::challenge_difficulty NOT NULL,
  estimated_duration_minutes integer DEFAULT 5 NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  mode_title text NOT NULL,
  duration_minutes integer DEFAULT 0 NOT NULL,
  message_count integer DEFAULT 0 NOT NULL,
  overall integer DEFAULT 0 NOT NULL,
  grammar integer DEFAULT 0 NOT NULL,
  vocabulary integer DEFAULT 0 NOT NULL,
  fluency integer DEFAULT 0 NOT NULL,
  confidence integer DEFAULT 0 NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text,
  email text NOT NULL,
  phone text,
  department text,
  avatar_url text,
  status user_status DEFAULT 'active'::user_status NOT NULL,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  login_id text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name app_role NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_daily_progress (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completion_time_seconds integer,
  completed_at timestamp with time zone,
  challenge_date date DEFAULT ((now() AT TIME ZONE 'utc'::text))::date NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_learning_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  bucket text NOT NULL,
  namespace text NOT NULL,
  item_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id uuid NOT NULL,
  xp integer DEFAULT 0 NOT NULL,
  growth_score integer DEFAULT 0 NOT NULL,
  practice_minutes integer DEFAULT 0 NOT NULL,
  conversation_count integer DEFAULT 0 NOT NULL,
  daily_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  weekly_goal_minutes integer DEFAULT 25 NOT NULL,
  monthly_goal_minutes integer DEFAULT 100 NOT NULL,
  last_session_date date,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ---------- 3. CONSTRAINTS ----------
DO $$ BEGIN
  ALTER TABLE public.announcement_reads ADD CONSTRAINT announcement_reads_announcement_id_user_id_key UNIQUE (announcement_id, user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.announcement_reads ADD CONSTRAINT announcement_reads_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.announcement_reads ADD CONSTRAINT announcement_reads_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.announcement_reads ADD CONSTRAINT announcement_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.announcements ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.announcements ADD CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.challenge_categories ADD CONSTRAINT challenge_categories_name_key UNIQUE (name);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.challenge_categories ADD CONSTRAINT challenge_categories_slug_key UNIQUE (slug);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.challenge_categories ADD CONSTRAINT challenge_categories_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.daily_challenges ADD CONSTRAINT daily_challenges_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.daily_challenges ADD CONSTRAINT daily_challenges_category_id_fkey FOREIGN KEY (category_id) REFERENCES challenge_categories(id) ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.daily_challenges ADD CONSTRAINT daily_challenges_estimated_duration_minutes_check CHECK ((estimated_duration_minutes > 0));
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.practice_sessions ADD CONSTRAINT practice_sessions_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.practice_sessions ADD CONSTRAINT practice_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.roles ADD CONSTRAINT roles_name_key UNIQUE (name);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.roles ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_achievements ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_achievements ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_achievements ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_daily_progress ADD CONSTRAINT user_daily_progress_user_id_challenge_id_challenge_date_key UNIQUE (user_id, challenge_id, challenge_date);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_daily_progress ADD CONSTRAINT user_daily_progress_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_daily_progress ADD CONSTRAINT user_daily_progress_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_daily_progress ADD CONSTRAINT user_daily_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_learning_items ADD CONSTRAINT user_learning_items_user_id_bucket_namespace_item_id_key UNIQUE (user_id, bucket, namespace, item_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_learning_items ADD CONSTRAINT user_learning_items_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_learning_items ADD CONSTRAINT user_learning_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_stats ADD CONSTRAINT user_stats_pkey PRIMARY KEY (user_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.user_stats ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

-- ---------- 4. INDEXES ----------
CREATE INDEX IF NOT EXISTS announcements_status_idx ON public.announcements USING btree (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON public.daily_challenges USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_category ON public.daily_challenges USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_date ON public.user_daily_progress USING btree (user_id, challenge_date DESC);
CREATE INDEX IF NOT EXISTS practice_sessions_user_created_idx ON public.practice_sessions USING btree (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_login_id_lower_key ON public.profiles USING btree (lower(login_id));
CREATE INDEX IF NOT EXISTS user_learning_items_user_idx ON public.user_learning_items USING btree (user_id);

-- ---------- 5. FUNCTIONS ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, login_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'login_id', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ---------- 6. TRIGGERS ----------
DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_challenge_categories_updated ON public.challenge_categories;
CREATE TRIGGER trg_challenge_categories_updated BEFORE UPDATE ON public.challenge_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_daily_challenges_updated ON public.daily_challenges;
CREATE TRIGGER trg_daily_challenges_updated BEFORE UPDATE ON public.daily_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_notifications_updated_at ON public.notifications;
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_practice_sessions_updated_at ON public.practice_sessions;
CREATE TRIGGER update_practice_sessions_updated_at BEFORE UPDATE ON public.practice_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_user_daily_progress_updated ON public.user_daily_progress;
CREATE TRIGGER trg_user_daily_progress_updated BEFORE UPDATE ON public.user_daily_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------- 7. GRANTS (required: Supabase does not grant these by default) ----------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcement_reads TO authenticated;
GRANT ALL ON public.announcement_reads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_categories TO authenticated;
GRANT ALL ON public.challenge_categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_challenges TO authenticated;
GRANT ALL ON public.daily_challenges TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_sessions TO authenticated;
GRANT ALL ON public.practice_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_daily_progress TO authenticated;
GRANT ALL ON public.user_daily_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_learning_items TO authenticated;
GRANT ALL ON public.user_learning_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;

-- ---------- 8. ROW LEVEL SECURITY ----------
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users delete own announcement reads" ON public.announcement_reads;
CREATE POLICY "Users delete own announcement reads" ON public.announcement_reads
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users insert own announcement reads" ON public.announcement_reads;
CREATE POLICY "Users insert own announcement reads" ON public.announcement_reads
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own announcement reads" ON public.announcement_reads;
CREATE POLICY "Users view own announcement reads" ON public.announcement_reads
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read visible announcements" ON public.announcements;
CREATE POLICY "Authenticated read visible announcements" ON public.announcements
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((status = 'published'::announcement_status) AND ((published_at IS NULL) OR (published_at <= now())) AND ((expires_at IS NULL) OR (expires_at > now())) AND ((audience IS NULL) OR has_role(auth.uid(), audience)) AND ((target_departments IS NULL) OR (array_length(target_departments, 1) IS NULL) OR (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.department = ANY (announcements.target_departments))))))));

DROP POLICY IF EXISTS "Admins manage app settings" ON public.app_settings;
CREATE POLICY "Admins manage app settings" ON public.app_settings
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read app settings" ON public.app_settings;
CREATE POLICY "Authenticated read app settings" ON public.app_settings
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can delete categories" ON public.challenge_categories;
CREATE POLICY "Admins can delete categories" ON public.challenge_categories
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert categories" ON public.challenge_categories;
CREATE POLICY "Admins can insert categories" ON public.challenge_categories
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update categories" ON public.challenge_categories;
CREATE POLICY "Admins can update categories" ON public.challenge_categories
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated can view categories" ON public.challenge_categories;
CREATE POLICY "Authenticated can view categories" ON public.challenge_categories
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can delete challenges" ON public.daily_challenges;
CREATE POLICY "Admins can delete challenges" ON public.daily_challenges
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert challenges" ON public.daily_challenges;
CREATE POLICY "Admins can insert challenges" ON public.daily_challenges
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update challenges" ON public.daily_challenges;
CREATE POLICY "Admins can update challenges" ON public.daily_challenges
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated can view active challenges" ON public.daily_challenges;
CREATE POLICY "Authenticated can view active challenges" ON public.daily_challenges
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((is_active OR has_role(auth.uid(), 'admin'::app_role)));

DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users insert own sessions" ON public.practice_sessions;
CREATE POLICY "Users insert own sessions" ON public.practice_sessions
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own sessions" ON public.practice_sessions;
CREATE POLICY "Users view own sessions" ON public.practice_sessions
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = id))
  WITH CHECK ((auth.uid() = id));

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = id));

DROP POLICY IF EXISTS "Admins manage roles" ON public.roles;
CREATE POLICY "Admins manage roles" ON public.roles
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read roles" ON public.roles;
CREATE POLICY "Authenticated read roles" ON public.roles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users insert own achievements" ON public.user_achievements;
CREATE POLICY "Users insert own achievements" ON public.user_achievements
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own achievements" ON public.user_achievements;
CREATE POLICY "Users view own achievements" ON public.user_achievements
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));

DROP POLICY IF EXISTS "Users delete own progress" ON public.user_daily_progress;
CREATE POLICY "Users delete own progress" ON public.user_daily_progress
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users insert own progress" ON public.user_daily_progress;
CREATE POLICY "Users insert own progress" ON public.user_daily_progress
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users update own progress" ON public.user_daily_progress;
CREATE POLICY "Users update own progress" ON public.user_daily_progress
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own progress" ON public.user_daily_progress;
CREATE POLICY "Users view own progress" ON public.user_daily_progress
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));

DROP POLICY IF EXISTS "Users delete own learning items" ON public.user_learning_items;
CREATE POLICY "Users delete own learning items" ON public.user_learning_items
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users insert own learning items" ON public.user_learning_items;
CREATE POLICY "Users insert own learning items" ON public.user_learning_items
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own learning items" ON public.user_learning_items;
CREATE POLICY "Users view own learning items" ON public.user_learning_items
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Admins manage role assignments" ON public.user_roles;
CREATE POLICY "Admins manage role assignments" ON public.user_roles
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins view all role assignments" ON public.user_roles;
CREATE POLICY "Admins view all role assignments" ON public.user_roles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users view own role assignments" ON public.user_roles;
CREATE POLICY "Users view own role assignments" ON public.user_roles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users insert own settings" ON public.user_settings;
CREATE POLICY "Users insert own settings" ON public.user_settings
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users update own settings" ON public.user_settings;
CREATE POLICY "Users update own settings" ON public.user_settings
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own settings" ON public.user_settings;
CREATE POLICY "Users view own settings" ON public.user_settings
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users insert own stats" ON public.user_stats;
CREATE POLICY "Users insert own stats" ON public.user_stats
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users update own stats" ON public.user_stats;
CREATE POLICY "Users update own stats" ON public.user_stats
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users view own stats" ON public.user_stats;
CREATE POLICY "Users view own stats" ON public.user_stats
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));

