import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/types/auth";
import type { Database } from "@/integrations/supabase/types";

/**
 * Read the roles of the currently authenticated user using the request-scoped
 * Supabase client provided by `requireSupabaseAuth`. RLS applies as that user;
 * the admin/service-role client is intentionally not used here.
 */
export async function readUserRoles(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.role as AppRole);
}
