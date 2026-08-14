/**
 * Practice progress, XP, streaks and achievements.
 *
 * Backed by the authenticated user's own rows (`user_stats`,
 * `practice_sessions`, `user_achievements`). RLS keeps every user's data
 * fully isolated — nothing is stored in the browser any more.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Transcript turn as shown in the coach panel. */
export type SessionTurn = { role: "user" | "model"; text: string };

/**
 * Extra evaluation detail persisted alongside the numeric scores.
 * Stored as JSON in `practice_sessions.notes` so no schema change is needed.
 */
export type SessionDetails = {
  modeId?: string;
  challengeTitle?: string;
  startedAt?: string;
  completedAt?: string;
  transcript?: SessionTurn[];
  strengths?: string[];
  improvements?: string[];
  betterSentences?: string[];
  suggestedPractice?: string;
};

export type PracticeSessionResult = {
  modeTitle: string;
  durationMinutes: number;
  messages: number;
  overall: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  finishedAt: string;
  details?: SessionDetails;
};

export type PracticeStats = {
  xp: number;
  growthScore: number;
  practiceMinutes: number;
  conversationCount: number;
  dailyStreak: number;
  longestStreak: number;
  weeklyGoalMinutes: number;
  monthlyGoalMinutes: number;
  lastSessionDate: string | null;
  unlockedAchievements: string[];
};

export type PracticeSession = PracticeSessionResult & { id: string };

export const EMPTY_STATS: PracticeStats = {
  xp: 0,
  growthScore: 0,
  practiceMinutes: 0,
  conversationCount: 0,
  dailyStreak: 0,
  longestStreak: 0,
  weeklyGoalMinutes: 90,
  monthlyGoalMinutes: 400,
  lastSessionDate: null,
  unlockedAchievements: [],
};

export const ACHIEVEMENT_IDS = {
  firstConversation: "first-conversation",
  tenConversations: "ten-conversations",
  grammarStar: "grammar-star",
  vocabularyMaster: "vocabulary-master",
  fluencyHero: "fluency-hero",
} as const;

export const ACHIEVEMENT_LABELS: Record<string, string> = {
  [ACHIEVEMENT_IDS.firstConversation]: "First Conversation",
  [ACHIEVEMENT_IDS.tenConversations]: "10 Conversations",
  [ACHIEVEMENT_IDS.grammarStar]: "Grammar Star",
  [ACHIEVEMENT_IDS.vocabularyMaster]: "Vocabulary Master",
  [ACHIEVEMENT_IDS.fluencyHero]: "Fluency Hero",
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Pure stat/achievement calculation — no side effects. */
export function computeSessionUpdate(
  stats: PracticeStats,
  result: PracticeSessionResult,
): { stats: PracticeStats; newAchievements: string[] } {
  const today = dayKey(new Date(result.finishedAt));
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));

  const dailyStreak =
    stats.lastSessionDate === today
      ? Math.max(1, stats.dailyStreak)
      : stats.lastSessionDate === yesterday
        ? stats.dailyStreak + 1
        : 1;

  const xpGain = 20 + result.durationMinutes * 5 + Math.round(result.overall / 10);
  const conversationCount = stats.conversationCount + 1;

  const next: PracticeStats = {
    ...stats,
    xp: stats.xp + xpGain,
    growthScore: Math.round(
      (stats.growthScore * stats.conversationCount + result.overall) / conversationCount,
    ),
    practiceMinutes: stats.practiceMinutes + result.durationMinutes,
    conversationCount,
    dailyStreak,
    longestStreak: Math.max(stats.longestStreak, dailyStreak),
    lastSessionDate: today,
  };

  const unlocked = new Set(stats.unlockedAchievements);
  const newAchievements: string[] = [];
  const unlock = (id: string, condition: boolean) => {
    if (condition && !unlocked.has(id)) {
      unlocked.add(id);
      newAchievements.push(id);
    }
  };

  unlock(ACHIEVEMENT_IDS.firstConversation, conversationCount >= 1);
  unlock(ACHIEVEMENT_IDS.tenConversations, conversationCount >= 10);
  unlock(ACHIEVEMENT_IDS.grammarStar, result.grammar >= 85);
  unlock(ACHIEVEMENT_IDS.vocabularyMaster, result.vocabulary >= 85);
  unlock(ACHIEVEMENT_IDS.fluencyHero, result.fluency >= 85);

  next.unlockedAchievements = Array.from(unlocked);
  return { stats: next, newAchievements };
}

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

export async function recordPracticeSession(
  userId: string,
  result: PracticeSessionResult,
): Promise<{ stats: PracticeStats; newAchievements: string[] }> {
  const current = await fetchPracticeStats(userId);
  const { stats, newAchievements } = computeSessionUpdate(current, result);

  const { error: sessionError } = await supabase.from("practice_sessions").insert({
    user_id: userId,
    mode_title: result.modeTitle,
    duration_minutes: result.durationMinutes,
    message_count: result.messages,
    overall: result.overall,
    grammar: result.grammar,
    vocabulary: result.vocabulary,
    fluency: result.fluency,
    confidence: result.confidence,
  });
  if (sessionError) throw new Error(sessionError.message);

  const { error: statsError } = await supabase.from("user_stats").upsert(
    {
      user_id: userId,
      xp: stats.xp,
      growth_score: stats.growthScore,
      practice_minutes: stats.practiceMinutes,
      conversation_count: stats.conversationCount,
      daily_streak: stats.dailyStreak,
      longest_streak: stats.longestStreak,
      last_session_date: stats.lastSessionDate,
    },
    { onConflict: "user_id" },
  );
  if (statsError) throw new Error(statsError.message);

  if (newAchievements.length > 0) {
    await supabase.from("user_achievements").upsert(
      newAchievements.map((achievement_id) => ({ user_id: userId, achievement_id })),
      { onConflict: "user_id,achievement_id" },
    );
  }

  return { stats, newAchievements };
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

export function useRecordPracticeSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (result: PracticeSessionResult) => recordPracticeSession(user!.id, result),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["practice-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["practice-sessions"] });
    },
  });
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
