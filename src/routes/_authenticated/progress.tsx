import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Award,
  Brain,
  CalendarDays,
  Clock,
  Flame,
  Lightbulb,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ACHIEVEMENT_LABELS,
  usePracticeSessions,
  usePracticeStats,
  type PracticeSession,
} from "@/lib/practice-progress";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress · SVS English Coach" },
      {
        name: "description",
        content:
          "Your personal English learning analytics — trends, skill breakdown, goals, and session reports.",
      },
      { property: "og:title", content: "Progress · SVS English Coach" },
      {
        property: "og:description",
        content: "Track your English growth week by week with SVS English Coach.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgressPage,
});

const axis = { fontSize: 12, stroke: "var(--color-muted-foreground)" };

const LEVELS = [
  { name: "Beginner", min: 0, max: 200 },
  { name: "Explorer", min: 200, max: 600 },
  { name: "Confident", min: 600, max: 1200 },
  { name: "Advanced", min: 1200, max: 2000 },
  { name: "Master", min: 2000, max: 3000 },
];

function levelFor(xp: number) {
  const index = LEVELS.findIndex((l) => xp < l.max);
  const i = index === -1 ? LEVELS.length - 1 : index;
  return { ...LEVELS[i], step: i + 1, total: LEVELS.length };
}

function formatMinutes(total: number) {
  if (total < 60) return `${total}m`;
  return `${Math.floor(total / 60)}h ${total % 60}m`;
}

function weekLabel(offset: number) {
  return offset === 0 ? "This wk" : `−${offset} wk`;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function ProgressPage() {
  const { stats, loading: statsLoading } = usePracticeStats();
  const { sessions, loading: sessionsLoading } = usePracticeSessions(100);
  const [selected, setSelected] = useState<PracticeSession | null>(null);

  const loading = statsLoading || sessionsLoading;
  const hasSessions = sessions.length > 0;

  const trendData = useMemo(() => {
    const now = Date.now();
    const weeks = [5, 4, 3, 2, 1, 0].map((offset) => {
      const end = now - offset * 7 * 86_400_000;
      const start = end - 7 * 86_400_000;
      const inWeek = sessions.filter((s) => {
        const t = new Date(s.finishedAt).getTime();
        return t > start && t <= end;
      });
      return {
        label: weekLabel(offset),
        grammar: average(inWeek.map((s) => s.grammar)),
        vocabulary: average(inWeek.map((s) => s.vocabulary)),
        fluency: average(inWeek.map((s) => s.fluency)),
        confidence: average(inWeek.map((s) => s.confidence)),
        speaking: inWeek.reduce((n, s) => n + s.durationMinutes, 0),
      };
    });
    return weeks;
  }, [sessions]);

  const recent = sessions.slice(0, 5);
  const previous = sessions.slice(5, 10);

  const skills = useMemo(
    () =>
      (
        [
          ["Grammar", "grammar"],
          ["Vocabulary", "vocabulary"],
          ["Speaking Fluency", "fluency"],
          ["Confidence", "confidence"],
          ["Overall", "overall"],
        ] as const
      ).map(([name, key]) => ({
        name,
        current: average(recent.map((s) => s[key])),
        previous: average(previous.map((s) => s[key])),
      })),
    [recent, previous],
  );

  const radarData = skills
    .filter((s) => s.name !== "Overall")
    .map((s) => ({ skill: s.name, value: s.current }));

  const minutesSince = (days: number) => {
    const cutoff = Date.now() - days * 86_400_000;
    return sessions
      .filter((s) => new Date(s.finishedAt).getTime() >= cutoff)
      .reduce((n, s) => n + s.durationMinutes, 0);
  };

  const weeklyMinutes = minutesSince(7);
  const monthlyMinutes = minutesSince(30);
  const weeklyPct = Math.min(100, Math.round((weeklyMinutes / stats.weeklyGoalMinutes) * 100));
  const monthlyPct = Math.min(100, Math.round((monthlyMinutes / stats.monthlyGoalMinutes) * 100));

  const level = levelFor(stats.xp);

  const timeline = useMemo(() => {
    const items = sessions.slice(0, 4).map((s) => ({
      id: s.id,
      text: `Practised ${s.modeTitle} · scored ${s.overall}%`,
      time: new Date(s.finishedAt).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
      icon: Mic,
    }));
    const badges = stats.unlockedAchievements.slice(-2).map((id) => ({
      id: `ach-${id}`,
      text: `Unlocked "${ACHIEVEMENT_LABELS[id] ?? id}"`,
      time: "Achievement",
      icon: Award,
    }));
    return [...items, ...badges];
  }, [sessions, stats.unlockedAchievements]);

  const insights = useMemo(() => {
    if (!hasSessions) return [];
    const improved = [...skills]
      .filter((s) => s.previous > 0)
      .sort((a, b) => b.current - b.previous - (a.current - a.previous))[0];
    const weakest = [...skills]
      .filter((s) => s.name !== "Overall")
      .sort((a, b) => a.current - b.current)[0];
    const list: { icon: typeof TrendingUp; text: string }[] = [];
    if (improved && improved.current > improved.previous) {
      list.push({
        icon: TrendingUp,
        text: `${improved.name} is your fastest-improving skill — up ${improved.current - improved.previous} points.`,
      });
    }
    if (weakest) {
      list.push({
        icon: Mic,
        text: `${weakest.name} is at ${weakest.current}% — a few short sessions will lift it quickly.`,
      });
    }
    const topTopic = [...sessions].sort((a, b) => b.overall - a.overall)[0];
    if (topTopic) {
      list.push({
        icon: Sparkles,
        text: `${topTopic.modeTitle} is your strongest topic so far (${topTopic.overall}%).`,
      });
    }
    list.push({
      icon: Brain,
      text: `You have practised ${formatMinutes(stats.practiceMinutes)} across ${stats.conversationCount} conversation${stats.conversationCount === 1 ? "" : "s"}.`,
    });
    return list;
  }, [hasSessions, skills, sessions, stats.practiceMinutes, stats.conversationCount]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Progress" description="Your personal English learning analytics." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-80 rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Progress"
        description="Your personal English learning analytics — see how you're growing every week."
        actions={
          hasSessions ? (
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" /> {stats.dailyStreak}-day streak
            </Badge>
          ) : null
        }
      />

      {/* Section 1: Learning Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Current Level"
          value={level.name}
          icon={Award}
          trend={`Level ${level.step} of ${level.total}`}
        />
        <StatCard
          label="Growth Score"
          value={String(stats.growthScore)}
          icon={TrendingUp}
          trend="Average score"
        />
        <StatCard
          label="Current Streak"
          value={`${stats.dailyStreak} day${stats.dailyStreak === 1 ? "" : "s"}`}
          icon={Flame}
          trend={`Best ${stats.longestStreak}`}
        />
        <StatCard
          label="Practice Time"
          value={formatMinutes(stats.practiceMinutes)}
          icon={Clock}
          trend="All time"
        />
        <StatCard
          label="Weekly Goal"
          value={`${weeklyPct}%`}
          icon={Target}
          trend={`${weeklyMinutes} of ${stats.weeklyGoalMinutes} min`}
        />
        <StatCard
          label="Monthly Goal"
          value={`${monthlyPct}%`}
          icon={CalendarDays}
          trend={`${monthlyMinutes} of ${stats.monthlyGoalMinutes} min`}
        />
      </div>

      {!hasSessions ? (
        <Card className="mt-6 shadow-soft">
          <CardContent className="py-10">
            <EmptyState
              icon={Mic}
              title="No practice sessions yet"
              description="Finish your first AI practice session and your personal charts, skill breakdown and session reports will appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Section 2: Performance Trends */}
          <Card className="mt-6 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="mb-4 flex-wrap">
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="speaking">Speaking Time</TabsTrigger>
                  <TabsTrigger value="radar">Snapshot</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" {...axis} />
                      <YAxis {...axis} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="grammar"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="vocabulary"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="fluency"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="speaking" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="fillSpeaking" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" {...axis} />
                      <YAxis {...axis} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="speaking"
                        name="Minutes practised"
                        stroke="var(--color-primary)"
                        fill="url(#fillSpeaking)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="radar" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--color-border)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Current"
                        dataKey="value"
                        stroke="var(--color-primary)"
                        fill="var(--color-primary)"
                        fillOpacity={0.35}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Section 3: Learning Timeline */}
            <Card className="shadow-soft lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  Learning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-4 border-l pl-4">
                  {timeline.map((t) => (
                    <li key={t.id} className="relative">
                      <span className="absolute -left-[22px] flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <t.icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-medium">{t.text}</p>
                      <p className="text-xs text-muted-foreground">{t.time}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Section 4: Skill Breakdown */}
            <Card className="shadow-soft lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-primary" />
                  Skill Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Last {recent.length} session{recent.length === 1 ? "" : "s"} compared with the{" "}
                  {previous.length} before.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((s) => {
                  const diff = s.current - s.previous;
                  return (
                    <div key={s.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{s.name}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {s.previous > 0 ? <span>Prev {s.previous}%</span> : null}
                          <span className="font-semibold text-foreground">{s.current}%</span>
                          {s.previous > 0 && diff !== 0 ? (
                            <Badge
                              variant="outline"
                              className={
                                diff > 0
                                  ? "gap-0.5 border-accent/30 bg-accent/10 text-accent"
                                  : "gap-0.5 border-amber-500/20 bg-amber-500/10 text-amber-700"
                              }
                            >
                              <ArrowUpRight className="h-3 w-3" />
                              {diff > 0 ? "+" : ""}
                              {diff}%
                            </Badge>
                          ) : null}
                        </span>
                      </div>
                      <Progress value={s.current} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Section 5: Goals */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" /> Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {weeklyMinutes} of {stats.weeklyGoalMinutes} minutes
                  </span>
                  <span className="text-sm font-semibold">{weeklyPct}%</span>
                </div>
                <Progress value={weeklyPct} />
                <p className="text-xs text-muted-foreground">
                  {weeklyPct >= 100
                    ? "Weekly goal complete — wonderful work! 🌟"
                    : `${Math.max(0, stats.weeklyGoalMinutes - weeklyMinutes)} more minutes this week.`}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-accent" /> Monthly Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {monthlyMinutes} of {stats.monthlyGoalMinutes} minutes
                  </span>
                  <span className="text-sm font-semibold">{monthlyPct}%</span>
                </div>
                <Progress value={monthlyPct} />
                <p className="text-xs text-muted-foreground">
                  {monthlyPct >= 100
                    ? "Monthly goal reached. Keep the streak alive! 💪"
                    : `${Math.max(0, stats.monthlyGoalMinutes - monthlyMinutes)} more minutes this month.`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Section 6: Growth Insights */}
          <Card className="mt-6 overflow-hidden border-primary/20 shadow-soft">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Lightbulb className="h-4 w-4" />
                Growth Insights
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {insights.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border bg-background/70 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <i.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-relaxed">{i.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Section 7: Recent Session Reports */}
          <Card className="mt-6 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-accent" />
                Recent Session Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Topic</th>
                      <th className="px-4 py-3 text-left font-medium">Duration</th>
                      <th className="px-4 py-3 text-left font-medium">Grammar</th>
                      <th className="px-4 py-3 text-left font-medium">Vocabulary</th>
                      <th className="px-4 py-3 text-left font-medium">Fluency</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 10).map((r) => (
                      <tr key={r.id} className="border-t transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{r.modeTitle}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.durationMinutes} min</td>
                        <td className="px-4 py-3">{r.grammar}%</td>
                        <td className="px-4 py-3">{r.vocabulary}%</td>
                        <td className="px-4 py-3">{r.fluency}%</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(r.finishedAt).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Session details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.modeTitle}</DialogTitle>
            <DialogDescription>
              {selected
                ? `${new Date(selected.finishedAt).toLocaleString()} · ${selected.durationMinutes} min · ${selected.messages} messages`
                : null}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Overall", selected.overall],
                ["Grammar", selected.grammar],
                ["Vocabulary", selected.vocabulary],
                ["Fluency", selected.fluency],
                ["Confidence", selected.confidence],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold">{value}%</p>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
