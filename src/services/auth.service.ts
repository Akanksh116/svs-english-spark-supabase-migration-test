import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserRoles } from "./auth.functions";
import { signInWithUserId } from "./users.functions";
import type { AppRole, SignInPayload } from "@/types/auth";

/**
 * Auth service — User ID + password sign in plus role helpers.
 *
 * Sign in is resolved on the server (User ID → account) and the returned
 * session is installed into the browser client, so RLS applies everywhere.
 */
export const authService = {
  getSession: () => supabase.auth.getSession(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (cb: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(cb),

  async signInWithUserId({ loginId, password }: SignInPayload) {
    const result = await signInWithUserId({ data: { loginId, password } });
    if (!result.ok || !result.session) {
      throw new Error(result.message ?? "Incorrect User ID or password.");
    }
    const { data, error } = await supabase.auth.setSession(result.session);
    if (error) throw error;
    return { user: data.user, userId: result.userId };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Fetch the roles assigned to the currently authenticated user.
   * The server verifies the bearer token and reads the matching role rows.
   */
  async fetchRoles(userId: string): Promise<AppRole[]> {
    if (!userId) return [];
    return getCurrentUserRoles();
  },

  async isAdmin(userId: string): Promise<boolean> {
    const roles = await this.fetchRoles(userId);
    return roles.includes("admin");
  },
};
