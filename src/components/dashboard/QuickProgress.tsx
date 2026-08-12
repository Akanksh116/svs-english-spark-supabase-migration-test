import { Flame, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { levelForXp, usePracticeStats } from "@/lib/practice-progress";

/**
 * Live metrics for the signed-in user only — read from `user_stats`
 * (RLS-isolated). No shared or placeholder values.
 */
export function QuickProgress({ completed = 0 }: { completed?: number }) {
  const { stats } = usePracticeStats();
  const level = levelForXp(stats.xp);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Current Streak" value={`${stats.dailyStreak} days`} icon={Flame} />
      <StatCard label="XP" value={stats.xp} icon={Star} />
      <StatCard label="Current Level" value={level.name} icon={TrendingUp} />
      <StatCard label="Challenges Completed" value={completed} icon={CheckCircle2} />
    </div>
  );
}
