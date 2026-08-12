import type { Session, User } from "@supabase/supabase-js";

export type AppUser = User;
export type AppSession = Session;

/**
 * Role architecture — mirrors the `public.app_role` Postgres enum.
 * Keep this list in sync with the database enum.
 */
export const APP_ROLES = [
  "admin",
  "teacher",
  "receptionist",
  "office_staff",
  "support_staff",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export interface AuthState {
  session: AppSession | null;
  user: AppUser | null;
  roles: AppRole[];
  isAdmin: boolean;
  loading: boolean;
}

export interface SignInPayload {
  /** Unique staff User ID issued by the administrator (not an email). */
  loginId: string;
  password: string;
  rememberMe?: boolean;
}
