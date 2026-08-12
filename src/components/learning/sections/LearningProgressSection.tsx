import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Heart, Bookmark, CalendarDays, Target, Trophy, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/common/StatCard";
import { Progress } from "@/components/ui/progress";
import { useLearningTotals } from "@/lib/learning-store";
import { practisedDayKeys, usePracticeSessions, usePracticeStats } from "@/lib/practice-progress";

const WEEKLY_GOAL = 25;
const MONTHLY_GOAL = 100;

export function LearningProgressSection() {
  const totals = useLearningTotals();
  const { stats } = usePracticeStats();
  const { sessions } = usePracticeSessions(200);

  const weekPct = Math.min(100, Math.round((totals.learned / WEEKLY_GOAL) * 100));
  const monthPct = Math.min(100, Math.round((totals.learned / MONTHLY_GOAL) * 100));

  const days = useMemo(() => buildCalendar(practisedDayKeys(sessions)), [sessions]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vocabulary learned" value={totals.learned} icon={BookOpen} />
        <StatCard label="Favorites" value={totals.favorites} icon={Heart} />
        <StatCard label="Practice later" value={totals.practice} icon={Bookmark} />
        <StatCard label="Best streak" value={`${stats.longestStreak} days`} icon={Trophy} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" /> Weekly goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {totals.learned} of {WEEKLY_GOAL} words
              </span>
              <span className="text-sm font-semibold text-foreground">{weekPct}%</span>
            </div>
            <Progress value={weekPct} />
            <p className="text-xs text-muted-foreground">
              Learn {Math.max(0, WEEKLY_GOAL - totals.learned)} more words this week to hit your
              goal.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-accent" /> Monthly goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {totals.learned} of {MONTHLY_GOAL} words
              </span>
              <span className="text-sm font-semibold text-foreground">{monthPct}%</span>
            </div>
            <Progress value={monthPct} />
            <p className="text-xs text-muted-foreground">
              Consistent daily practice will get you there — small steps add up.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-primary" /> Learning calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d, i) => (
              <div
                key={i}
                title={d.label}
                className={
                  "aspect-square rounded-md " +
                  (d.level === 0
                    ? "bg-muted"
                    : d.level === 1
                      ? "bg-primary/20"
                      : d.level === 2
                        ? "bg-primary/50"
                        : "bg-primary")
                }
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Last 4 weeks · brighter squares mean more learning activity.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Full analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Skill trends, session reports, and detailed charts live on your Progress page — these
            marks feed straight into it.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/progress">
              Open Progress <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Last 28 days of the signed-in user's own practice activity. */
function buildCalendar(practised: Set<string>) {
  const days: { label: string; level: 0 | 1 | 2 | 3 }[] = [];
  for (let i = 27; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    days.push({
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      level: practised.has(key) ? 3 : 0,
    });
  }
  return days;
}
