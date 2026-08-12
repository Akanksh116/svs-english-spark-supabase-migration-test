/**
 * Server-only staff account management.
 *
 * All privileged work (creating auth accounts, resolving a User ID to its
 * login email, setting passwords) happens here with the service-role client.
 * Never import this module from client code — only from a server function
 * handler via `await import(...)`.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import type { AppRole } from "@/types/auth";

/**
 * Staff sign in with a User ID, not an email address. Accounts created by an
 * administrator get a deterministic internal address derived from the User ID;
 * accounts that existed before the migration keep their original address.
 */
const INTERNAL_EMAIL_DOMAIN = "svs.local";

export function internalEmailFor(loginId: string): string {
  return `${loginId.trim().toLowerCase()}@${INTERNAL_EMAIL_DOMAIN}`;
}

function isOpaqueKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function publishableClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const GENERIC_SIGNIN_ERROR = "Incorrect User ID or password.";

export interface SignInResult {
  ok: boolean;
  message?: string;
  userId?: string;
  session?: { access_token: string; refresh_token: string };
}

export async function signInWithLoginId(loginId: string, password: string): Promise<SignInResult> {
  const normalized = loginId.trim().toLowerCase();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, email, status")
    .eq("login_id", normalized)
    .maybeSingle();

  if (!profile) return { ok: false, message: GENERIC_SIGNIN_ERROR };
  if (profile.status !== "active") {
    return {
      ok: false,
      message: "This account is not active. Please contact your administrator.",
    };
  }

  const supabase = publishableClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (error || !data.session) return { ok: false, message: GENERIC_SIGNIN_ERROR };

  await supabaseAdmin
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", profile.id);

  return {
    ok: true,
    userId: profile.id,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  };
}

/** Throws unless the caller holds the admin role (checked as that user). */
export async function assertAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden: administrator access required.");
}

export interface StaffRow {
  id: string;
  loginId: string;
  name: string;
  phone: string;
  department: string;
  role: AppRole;
  status: "active" | "inactive" | "suspended";
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  xp: number;
  growthScore: number;
  practiceMinutes: number;
  dailyStreak: number;
  conversationCount: number;
}

export async function listStaff(): Promise<StaffRow[]> {
  const [{ data: profiles }, { data: roles }, { data: stats }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select(
        "id, login_id, full_name, phone, department, status, avatar_url, last_login_at, created_at",
      )
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("user_roles").select("user_id, role"),
    supabaseAdmin
      .from("user_stats")
      .select("user_id, xp, growth_score, practice_minutes, daily_streak, conversation_count"),
  ]);

  const roleFor = new Map<string, AppRole>();
  for (const r of roles ?? []) roleFor.set(r.user_id, r.role as AppRole);
  const statFor = new Map((stats ?? []).map((s) => [s.user_id, s]));

  return (profiles ?? []).map((p) => {
    const s = statFor.get(p.id);
    return {
      id: p.id,
      loginId: p.login_id,
      name: p.full_name ?? p.login_id,
      phone: p.phone ?? "",
      department: p.department ?? "",
      role: roleFor.get(p.id) ?? "teacher",
      status: (p.status as StaffRow["status"]) ?? "active",
      avatarUrl: p.avatar_url,
      lastLoginAt: p.last_login_at,
      createdAt: p.created_at,
      xp: s?.xp ?? 0,
      growthScore: s?.growth_score ?? 0,
      practiceMinutes: s?.practice_minutes ?? 0,
      dailyStreak: s?.daily_streak ?? 0,
      conversationCount: s?.conversation_count ?? 0,
    };
  });
}

export interface CreateStaffInput {
  loginId: string;
  password: string;
  name: string;
  phone: string;
  department: string;
  role: AppRole;
  status: "active" | "inactive";
}

export async function createStaff(input: CreateStaffInput): Promise<{ id: string }> {
  const loginId = input.loginId.trim().toLowerCase();

  const { data: taken } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("login_id", loginId)
    .maybeSingle();
  if (taken) throw new Error(`The User ID "${loginId}" is already taken.`);

  const email = internalEmailFor(loginId);
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.name, login_id: loginId },
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Could not create the account.");
  }

  const id = created.user.id;

  // The auth trigger is not installed on this project, so every dependent row
  // is created explicitly here. Without this the account could sign in but had
  // no profile, role, or starter data.
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id,
      email,
      login_id: loginId,
      full_name: input.name,
      phone: input.phone || null,
      department: input.department || null,
      status: input.status,
    },
    { onConflict: "id" },
  );
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(id);
    throw new Error(profileError.message);
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: id, role: input.role }, { onConflict: "user_id,role" });
  if (roleError) throw new Error(roleError.message);

  await supabaseAdmin.from("user_stats").upsert({ user_id: id }, { onConflict: "user_id" });
  await supabaseAdmin.from("user_settings").upsert({ user_id: id }, { onConflict: "user_id" });

  return { id };
}

export interface UpdateStaffInput {
  id: string;
  name: string;
  phone: string;
  department: string;
  role: AppRole;
  status: "active" | "inactive";
}

export async function updateStaff(input: UpdateStaffInput): Promise<void> {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: input.name,
      phone: input.phone || null,
      department: input.department || null,
      status: input.status,
    })
    .eq("id", input.id);
  if (error) throw new Error(error.message);

  if (input.status === "inactive") {
    await supabaseAdmin.auth.admin.signOut(input.id, "global").catch(() => undefined);
  }

  await supabaseAdmin.from("user_roles").delete().eq("user_id", input.id);
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: input.id, role: input.role });
  if (roleError) throw new Error(roleError.message);
}

export async function setStaffStatus(id: string, status: "active" | "inactive"): Promise<void> {
  const { error } = await supabaseAdmin.from("profiles").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  // Deactivating must also end any session the user already holds, otherwise
  // they keep browsing until their token expires.
  if (status === "inactive") {
    await supabaseAdmin.auth.admin.signOut(id, "global").catch(() => undefined);
  }
}

export async function setStaffPassword(id: string, password: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
  if (error) throw new Error(error.message);
}
