/**
 * Pure practice scoring / achievement logic.
 *
 * No imports on purpose: this module is shared by the browser (display) and
 * the server (authoritative stat writes).
 */

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
