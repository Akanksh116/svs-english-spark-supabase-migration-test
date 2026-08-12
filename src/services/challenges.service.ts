import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ChallengeCategory = Database["public"]["Tables"]["challenge_categories"]["Row"];
export type DailyChallenge = Database["public"]["Tables"]["daily_challenges"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_daily_progress"]["Row"];
export type ChallengeDifficulty = Database["public"]["Enums"]["challenge_difficulty"];

export type DailyChallengeWithCategory = DailyChallenge & {
  category: Pick<ChallengeCategory, "id" | "name" | "slug"> | null;
};

export const challengesService = {
  async listCategories(): Promise<ChallengeCategory[]> {
    const { data, error } = await supabase
      .from("challenge_categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async listChallenges(opts?: { onlyActive?: boolean }): Promise<DailyChallengeWithCategory[]> {
    let q = supabase
      .from("daily_challenges")
      .select("*, category:challenge_categories(id,name,slug)")
      .order("display_order", { ascending: true });
    if (opts?.onlyActive) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data as DailyChallengeWithCategory[]) ?? [];
  },

  async createCategory(name: string): Promise<ChallengeCategory> {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const { data, error } = await supabase
      .from("challenge_categories")
      .insert({ name: name.trim(), slug, display_order: 99, is_active: true })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createChallenge(input: Database["public"]["Tables"]["daily_challenges"]["Insert"]) {
    const { data, error } = await supabase.from("daily_challenges").insert(input).select().single();
    if (error) throw error;
    return data;
  },

  async updateChallenge(
    id: string,
    input: Database["public"]["Tables"]["daily_challenges"]["Update"],
  ) {
    const { data, error } = await supabase
      .from("daily_challenges")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteChallenge(id: string) {
    const { error } = await supabase.from("daily_challenges").delete().eq("id", id);
    if (error) throw error;
  },

  async setActive(id: string, is_active: boolean) {
    return this.updateChallenge(id, { is_active });
  },

  /** Deterministic "today's challenge" pick from active challenges. */
  pickToday<T extends { id: string }>(list: T[], date = new Date()): T | null {
    if (list.length === 0) return null;
    const dayNumber = Math.floor(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000,
    );
    return list[dayNumber % list.length];
  },

  async getTodayProgress(userId: string, challengeId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("user_daily_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("challenge_date", today)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listRecentCompleted(userId: string, limit = 5) {
    const { data, error } = await supabase
      .from("user_daily_progress")
      .select("*, challenge:daily_challenges(id,title,difficulty,estimated_duration_minutes)")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async countCompleted(userId: string) {
    const { count, error } = await supabase
      .from("user_daily_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);
    if (error) throw error;
    return count ?? 0;
  },
};
