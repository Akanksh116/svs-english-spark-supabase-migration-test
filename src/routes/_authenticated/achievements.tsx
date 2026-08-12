import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Trophy,
  Flame,
  Star,
  TrendingUp,
  Award,
  Medal,
  Lock,
  Sparkles,
  Calendar,
  Download,
  Eye,
  Share2,
  Crown,
  Target,
  MessageCircle,
  BookOpen,
  Mic,
  Building2,
  GraduationCap,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACHIEVEMENT_IDS,
  levelForXp,
  practisedDayKeys,
  usePracticeSessions,
  usePracticeStats,
  type PracticeStats,
} from "@/lib/practice-progress";
import { useLearningTotals } from "@/lib/learning-store";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · SVS English Coach" },
      {
        name: "description",
        content:
          "Your badges, levels, streaks, certificates and motivating milestones — celebrate steady progress.",
      },
    ],
  }),
  component: AchievementsPage,
});

// ---------- Level + badge definitions (static config, not user data) ----------

const LEVELS = [
  { key: "beginner", title: "Beginner", xp: 0, icon: Sparkles },
  { key: "elementary", title: "Elementary", xp: 200, icon: BookOpen },
  { key: "intermediate", title: "Intermediate", xp: 600, icon: TrendingUp },
  { key: "advanced", title: "Advanced", xp: 1200, icon: Medal },
  { key: "master", title: "Master Teacher", xp: 2000, icon: Crown },
] as const;

interface BadgeItem {
  key: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  unlocked: boolean;
  progress?: number; // 0-100 for locked
}

interface BadgeDef {
  key: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  /** Progress towards unlocking, derived from the signed-in user's own stats. */
  progress: (ctx: BadgeContext) => number;
}

interface BadgeContext {
  stats: PracticeStats;
  learnedWords: number;
  sessions: number;
}

const BADGE_DEFS: BadgeDef[] = [
  {
    key: ACHIEVEMENT_IDS.firstConversation,
    title: "First Conversation",
    description: "Complete your first practice session.",
    icon: MessageCircle,
    progress: (c) => pct(c.sessions, 1),
  },
  {
    key: ACHIEVEMENT_IDS.tenConversations,
    title: "10 Conversations",
    description: "Complete ten practice sessions.",
    icon: TrendingUp,
    progress: (c) => pct(c.sessions, 10),
  },
  {
    key: ACHIEVEMENT_IDS.grammarStar,
    title: "Grammar Star",
    description: "Score 85%+ on grammar in a session.",
    icon: Star,
    progress: (c) => pct(c.stats.growthScore, 85),
  },
  {
    key: ACHIEVEMENT_IDS.vocabularyMaster,
    title: "Vocabulary Master",
    description: "Score 85%+ on vocabulary in a session.",
    icon: BookOpen,
    progress: (c) => pct(c.learnedWords, 100),
  },
  {
    key: ACHIEVEMENT_IDS.fluencyHero,
    title: "Fluency Hero",
    description: "Score 85%+ on fluency in a session.",
    icon: Zap,
    progress: (c) => pct(c.stats.practiceMinutes, 60),
  },
  {
    key: "streak-7",
    title: "7-Day Streak",
    description: "Practise every day for a week.",
    icon: Flame,
    progress: (c) => pct(c.stats.longestStreak, 7),
  },
  {
    key: "streak-30",
    title: "30-Day Streak",
    description: "One month of daily practice.",
    icon: Flame,
    progress: (c) => pct(c.stats.longestStreak, 30),
  },
  {
    key: "confident-speaker",
    title: "Confident Speaker",
    description: "Complete 20 speaking sessions.",
    icon: Mic,
    progress: (c) => pct(c.sessions, 20),
  },
];

function pct(value: number, target: number) {
  return Math.min(100, Math.round((value / target) * 100));
}

// ---------- Page ----------

function AchievementsPage() {
  const { user } = useAuth();
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "Teacher";

  const { stats } = usePracticeStats();
  const { sessions } = usePracticeSessions(200);
  const totals = useLearningTotals();

  const [certPreview, setCertPreview] = useState<null | Certificate>(null);

  const level = levelForXp(stats.xp);
  const xpPct = level.pct;
  const xpRemaining = Math.max(0, level.max - stats.xp);
  const currentLevelIndex = LEVELS.findIndex((l) => l.title === level.name);
  const nextLevelName = LEVELS[Math.min(LEVELS.length - 1, currentLevelIndex + 1)].title;

  const badges: BadgeItem[] = useMemo(() => {
    const ctx: BadgeContext = {
      stats,
      learnedWords: totals.learned,
      sessions: stats.conversationCount,
    };
    return BADGE_DEFS.map((def) => {
      const unlocked = stats.unlockedAchievements.includes(def.key);
      const progress = def.progress(ctx);
      return {
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlocked: unlocked || progress >= 100,
        progress,
      };
    });
  }, [stats, totals.learned]);

  const timeline = useMemo(
    () =>
      sessions.slice(0, 6).map((session) => ({
        id: session.id,
        title: `Practised ${session.modeTitle} · scored ${session.overall}%`,
        date: new Date(session.finishedAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        icon: Mic,
      })),
    [sessions],
  );

  const certificates: Certificate[] = useMemo(
    () => [
      {
        key: "first-steps",
        title: "First Steps Certificate",
        subtitle: "Completed your first 5 practice sessions",
        earned: stats.conversationCount >= 5,
      },
      {
        key: "consistency",
        title: "Consistency Certificate",
        subtitle: "Reached a 7-day practice streak",
        earned: stats.longestStreak >= 7,
      },
      {
        key: "excellence",
        title: "Excellence Certificate",
        subtitle: "Earned 1000 XP of English practice",
        earned: stats.xp >= 1000,
      },
    ],
    [stats.conversationCount, stats.longestStreak, stats.xp],
  );

  const motivations = useMemo(() => {
    const list: string[] = [];
    list.push(`You are ${xpRemaining} XP away from ${nextLevelName}.`);
    list.push(
      stats.dailyStreak > 0
        ? `Practise today to keep your ${stats.dailyStreak}-day streak alive.`
        : "Complete one session today to start a new streak.",
    );
    list.push(
      totals.learned > 0
        ? `You have marked ${totals.learned} word${totals.learned === 1 ? "" : "s"} as learned.`
        : "Mark words as learned in the Learning Center to grow your vocabulary.",
    );
    return list;
  }, [xpRemaining, nextLevelName, stats.dailyStreak, totals.learned]);

  const practisedDays = useMemo(() => practisedDayKeys(sessions), [sessions]);
  const calendar = useMemo(() => buildStreakMonth(practisedDays), [practisedDays]);

  const weeklyConsistency = useMemo(() => {
    let practised = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (practisedDays.has(key)) practised++;
    }
    return Math.round((practised / 7) * 100);
  }, [practisedDays]);

  return (
    <PageContainer>
      <PageHeader
        title="Achievements"
        description="Every small step counts — here's your journey so far."
      />

      {/* SECTION 1 — Profile summary hero */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-soft">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="mr-1 h-3.5 w-3.5" /> {level.name}
              </Badge>
              <Badge variant="secondary">
                Level {level.step} of {level.total}
              </Badge>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Keep going, {firstName} 👏
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground md:text-base">
              You're building a strong daily habit. Consistency matters more than perfection.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MiniStat label="Current XP" value={stats.xp} icon={Star} />
              <MiniStat label="Growth Score" value={`${stats.growthScore}%`} icon={TrendingUp} />
              <MiniStat label="Current Streak" value={`${stats.dailyStreak}d`} icon={Flame} />
              <MiniStat label="Longest Streak" value={`${stats.longestStreak}d`} icon={Flame} />
              <MiniStat label="Sessions" value={stats.conversationCount} icon={Medal} />
              <MiniStat label="Level" value={level.name} icon={Crown} />
            </div>
          </div>
          <div className="hidden aspect-square w-40 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg md:grid">
            <Trophy className="h-20 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2 — XP Progress */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" /> XP Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                {stats.xp} / {level.max} XP
              </span>
              <span className="text-sm font-semibold">{xpPct}%</span>
            </div>
            <Progress value={xpPct} className="h-3 transition-all duration-700" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{xpRemaining} XP</span> to reach{" "}
              <span className="font-medium text-foreground">{nextLevelName}</span>.
            </p>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-medium">Suggested next step</p>
              <p className="text-muted-foreground">
                Finish 2 speaking sessions today (~80 XP) and review 10 vocabulary words (~60 XP).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 9 — Motivation */}
        <Card className="border-accent/30 bg-accent/5 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-accent" /> Daily Motivation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {motivations.map((m) => (
              <p key={m} className="text-sm text-foreground/90">
                • {m}
              </p>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">
              AI-personalized motivation coming soon.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3 — Levels */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> Your Level Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((lvl, i) => {
              const isCurrent = i === currentLevelIndex;
              const isPast = i < currentLevelIndex;
              const isLocked = i > currentLevelIndex;
              const Icon = lvl.icon;
              return (
                <div
                  key={lvl.key}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 transition-all",
                    isCurrent && "border-primary bg-primary/5 shadow-soft",
                    isPast && "border-accent/40 bg-accent/5",
                    isLocked && "opacity-70",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      isCurrent && "bg-primary text-primary-foreground",
                      isPast && "bg-accent text-accent-foreground",
                      isLocked && "bg-muted text-muted-foreground",
                    )}
                  >
                    {isLocked ? <Lock className="h-4 w-4" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{lvl.title}</p>
                      {isCurrent && (
                        <Badge className="bg-primary text-primary-foreground">Now</Badge>
                      )}
                      {isPast && <Badge variant="secondary">Cleared</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{lvl.xp} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4 — Badges */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-primary" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {badges.map((b) => (
              <BadgeCard key={b.key} badge={b} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 5 — Streak Calendar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" /> Streak Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-muted-foreground">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendar.map((d, i) => (
                <div
                  key={i}
                  title={d.label}
                  className={cn(
                    "aspect-square rounded-md text-[10px] font-medium",
                    "flex items-center justify-center",
                    d.empty && "bg-transparent",
                    !d.empty && !d.practiced && "bg-muted text-muted-foreground",
                    d.practiced && "bg-primary text-primary-foreground shadow-sm",
                    d.today && "ring-2 ring-accent ring-offset-2",
                  )}
                >
                  {d.day || ""}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Blue squares are days you practiced. Today is outlined.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <StatCard label="Current Streak" value={`${stats.dailyStreak} days`} icon={Flame} />
          <StatCard label="Longest Streak" value={`${stats.longestStreak} days`} icon={Trophy} />
          <StatCard
            label="Weekly Consistency"
            value={`${weeklyConsistency}%`}
            icon={CheckCircle2}
          />
        </div>
      </div>

      {/* SECTION 6 — Timeline */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" /> Achievements Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l border-border pl-6">
            {timeline.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No milestones yet — your first practice session will appear here.
              </li>
            ) : null}
            {timeline.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[30px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* SECTION 7 — Certificates */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Medal className="h-4 w-4 text-primary" /> Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {certificates.map((c) => (
              <div
                key={c.key}
                className={cn(
                  "flex flex-col rounded-xl border p-5 shadow-soft",
                  c.earned ? "bg-gradient-to-br from-primary/10 to-accent/10" : "opacity-70",
                )}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {c.earned ? <Medal className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!c.earned}
                    onClick={() => setCertPreview(c)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button size="sm" variant="outline" disabled={!c.earned}>
                    <Download className="mr-1 h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" disabled={!c.earned}>
                    <Share2 className="mr-1 h-3.5 w-3.5" /> Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate preview dialog */}
      <Dialog open={!!certPreview} onOpenChange={(v) => !v && setCertPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{certPreview?.title}</DialogTitle>
            <DialogDescription>{certPreview?.subtitle}</DialogDescription>
          </DialogHeader>
          <div className="aspect-[4/3] rounded-xl border-4 border-double border-primary/40 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Sri Vijaya Sai High School
            </p>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Certificate of Achievement</h3>
            <p className="mt-4 text-sm text-muted-foreground">Presented to</p>
            <p className="mt-1 text-xl font-semibold">{firstName}</p>
            <p className="mt-4 text-sm">
              For consistent English practice and outstanding progress.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">{certPreview?.subtitle}</p>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// ---------- helpers ----------

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Trophy;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function BadgeCard({ badge }: { badge: BadgeItem }) {
  const Icon = badge.icon;
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border p-4 transition-all",
        badge.unlocked
          ? "bg-gradient-to-br from-primary/5 to-accent/10 shadow-soft hover:-translate-y-0.5"
          : "opacity-80",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            badge.unlocked
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
        {badge.unlocked ? (
          <Badge className="bg-accent text-accent-foreground">Unlocked</Badge>
        ) : (
          <Badge variant="secondary">Locked</Badge>
        )}
      </div>
      <p className="mt-3 font-semibold">{badge.title}</p>
      <p className="text-xs text-muted-foreground">{badge.description}</p>
      {badge.unlocked ? (
        <p className="mt-3 text-[11px] text-muted-foreground">Earned</p>
      ) : (
        <div className="mt-3 space-y-1">
          <Progress value={badge.progress ?? 0} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground">{badge.progress ?? 0}% progress</p>
        </div>
      )}
    </div>
  );
}

function buildStreakMonth(practised: Set<string>) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: {
    day: number | null;
    empty: boolean;
    practiced: boolean;
    today: boolean;
    label: string;
  }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: null, empty: true, practiced: false, today: false, label: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      empty: false,
      practiced: practised.has(key),
      today: d === today.getDate(),
      label: `${d}/${month + 1}`,
    });
  }
  return cells;
}

interface Certificate {
  key: string;
  title: string;
  subtitle: string;
  earned: boolean;
}
