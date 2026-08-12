/**
 * Server-only school settings storage. A single `app_settings` row holds
 * every section; missing keys fall back to the documented defaults.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { DEFAULT_SCHOOL_SETTINGS, type SchoolSettings } from "@/data/school-settings";

const ROW_ID = "school";

export async function getSchoolSettings(): Promise<SchoolSettings> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("school, practice, users, notifications, security, ai, appearance")
    .eq("id", ROW_ID)
    .maybeSingle();

  const d = DEFAULT_SCHOOL_SETTINGS;
  const part = <K extends keyof SchoolSettings>(key: K): SchoolSettings[K] => ({
    ...d[key],
    ...(((data?.[key] as Partial<SchoolSettings[K]>) ?? {}) as object),
  });

  return {
    school: part("school"),
    practice: part("practice"),
    users: part("users"),
    notifications: part("notifications"),
    security: part("security"),
    ai: part("ai"),
    appearance: part("appearance"),
  };
}

export async function saveSchoolSettings(
  settings: SchoolSettings,
  userId: string,
): Promise<SchoolSettings> {
  const { error } = await supabaseAdmin.from("app_settings").upsert(
    {
      id: ROW_ID,
      school: settings.school as unknown as Json,
      practice: settings.practice as unknown as Json,
      users: settings.users as unknown as Json,
      notifications: settings.notifications as unknown as Json,
      security: settings.security as unknown as Json,
      ai: settings.ai as unknown as Json,
      appearance: settings.appearance as unknown as Json,
      updated_by: userId,
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
  return getSchoolSettings();
}
