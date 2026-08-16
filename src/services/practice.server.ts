/**
 * Server-only, authoritative practice-session persistence.
 *
 * Scores come from the AI evaluation computed on the server for the
 * authenticated user; XP/streak/growth are derived here. The browser can no
 * longer write `practice_sessions`, `user_stats` or `user_achievements`.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  computeSessionUpdate,
  EMPTY_STATS,
  type PracticeSessionResult,
  type PracticeStats,
} from "@/lib/practice-scoring";

async function loadStats(userId: string): Promise<PracticeStats> {
  const [{ data: row }, { data: achievements }] = await Promise.all([
    supabaseAdmin.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);

  const unlockedAchievements = (achievements ?? []).map((a) => a.achievement_id);
  if (!row) return { ...EMPTY_STATS, unlockedAchievements };

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

export async function persistCompletedSession(
  userId: string,
  result: PracticeSessionResult,
): Promise<{ newAchievements: string[] }> {
  const current = await loadStats(userId);
  const { stats, newAchievements } = computeSessionUpdate(current, result);

  const { error: sessionError } = await supabaseAdmin.from("practice_sessions").insert({
    user_id: userId,
    mode_title: result.modeTitle,
    duration_minutes: result.durationMinutes,
    message_count: result.messages,
    overall: result.overall,
    grammar: result.grammar,
    vocabulary: result.vocabulary,
    fluency: result.fluency,
    confidence: result.confidence,
    notes: result.details ? JSON.stringify(result.details) : null,
  });
  if (sessionError) throw new Error(sessionError.message);

  const { error: statsError } = await supabaseAdmin.from("user_stats").upsert(
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
    await supabaseAdmin.from("user_achievements").upsert(
      newAchievements.map((achievement_id) => ({ user_id: userId, achievement_id })),
      { onConflict: "user_id,achievement_id" },
    );
  }

  return { newAchievements };
}
