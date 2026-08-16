/**
 * Practice progress, XP, streaks and achievements.
 *
 * Backed by the authenticated user's own rows (`user_stats`,
 * `practice_sessions`, `user_achievements`). RLS keeps every user's data
 * fully isolated — nothing is stored in the browser any more.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import {
  EMPTY_STATS,
  type PracticeSession,
  type PracticeStats,
} from "@/lib/practice-scoring";
export type {
  SessionTurn,
  SessionDetails,
  PracticeSessionResult,
  PracticeStats,
  PracticeSession,
} from "@/lib/practice-scoring";
export {
  EMPTY_STATS,
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_LABELS,
  computeSessionUpdate,
} from "@/lib/practice-scoring";

export async function fetchPracticeStats(userId: string): Promise<PracticeStats> {
  const [{ data: row }, { data: achievements }] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);

  const unlockedAchievements = (achievements ?? []).map((a) => a.achievement_id);

  if (!row) {
    await supabase.from("user_stats").insert({ user_id: userId });
    return { ...EMPTY_STATS, unlockedAchievements };
  }

  return {
    xp: row.xp,
    growthScore: row.growth_score,
    practiceMinutes: row.practice_minutes,
    conversationCount: row.conversation_count,
    dailyStreak: row.daily_streak,
    longestStreak: row.longest_streak,
    weeklyGoalMinutes: row.weekly_goal_minutes,
    monthlyGoalMinutes: row.monthly_goal_minutes,
    lastSessionDate: row.last_session_date,
    unlockedAchievements,
  };
}

export async function fetchPracticeSessions(
  userId: string,
  limit = 20,
): Promise<PracticeSession[]> {
  const { data } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    modeTitle: row.mode_title,
    durationMinutes: row.duration_minutes,
    messages: row.message_count,
    overall: row.overall,
    grammar: row.grammar,
    vocabulary: row.vocabulary,
    fluency: row.fluency,
    confidence: row.confidence,
    finishedAt: row.created_at,
    details: parseSessionDetails(row.notes),
  }));
}

/** `notes` holds a JSON blob of evaluation feedback + transcript; ignore anything else. */
function parseSessionDetails(notes: string | null): SessionDetails | undefined {
  if (!notes) return undefined;
  try {
    const parsed: unknown = JSON.parse(notes);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as SessionDetails;
    }
  } catch {
    /* legacy plain-text note */
  }
  return undefined;
}

export function usePracticeStats() {
  const { user } = useAuth();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["practice-stats", userId],
    queryFn: () => fetchPracticeStats(userId!),
    enabled: Boolean(userId),
  });
  return { stats: query.data ?? EMPTY_STATS, loading: query.isLoading, refetch: query.refetch };
}

export function usePracticeSessions(limit = 20) {
  const { user } = useAuth();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["practice-sessions", userId, limit],
    queryFn: () => fetchPracticeSessions(userId!, limit),
    enabled: Boolean(userId),
  });
  return { sessions: query.data ?? [], loading: query.isLoading };
}

/** Shared XP → level mapping so every page shows the same level for a user. */
export const XP_LEVELS = [
  { key: "beginner", name: "Beginner", min: 0, max: 200 },
  { key: "elementary", name: "Elementary", min: 200, max: 600 },
  { key: "intermediate", name: "Intermediate", min: 600, max: 1200 },
  { key: "advanced", name: "Advanced", min: 1200, max: 2000 },
  { key: "master", name: "Master Teacher", min: 2000, max: 3000 },
] as const;

export type XpLevel = (typeof XP_LEVELS)[number];

export function levelForXp(xp: number) {
  const index = XP_LEVELS.findIndex((l) => xp < l.max);
  const i = index === -1 ? XP_LEVELS.length - 1 : index;
  const level = XP_LEVELS[i];
  const pct = Math.min(100, Math.round(((xp - level.min) / (level.max - level.min)) * 100));
  return { ...level, step: i + 1, total: XP_LEVELS.length, pct };
}

/** Day keys (YYYY-MM-DD, local) on which the user practised. */
export function practisedDayKeys(sessions: PracticeSession[]): Set<string> {
  const keys = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.finishedAt);
    keys.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }
  return keys;
}
