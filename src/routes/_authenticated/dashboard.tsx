import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import {
  challengesService,
  type ChallengeDifficulty,
  type DailyChallengeWithCategory,
} from "@/services/challenges.service";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { TodayChallengeCard } from "@/components/dashboard/TodayChallengeCard";
import { TodayWordCard } from "@/components/dashboard/TodayWordCard";
import { QuickProgress } from "@/components/dashboard/QuickProgress";
import { RecentActivity, type RecentActivityItem } from "@/components/dashboard/RecentActivity";
import { DailyMotivation } from "@/components/dashboard/DailyMotivation";
import { LearningJourney } from "@/components/dashboard/LearningJourney";
import { UpcomingFeatures } from "@/components/dashboard/UpcomingFeatures";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import {
  MOTIVATIONS,
  WORDS_OF_THE_DAY,
  pickForToday,
  type JourneyLevel,
} from "@/data/dashboard-content";
import { levelForXp, usePracticeStats } from "@/lib/practice-progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · SVS English Coach" },
      {
        name: "description",
        content: "Your daily English practice, word of the day, progress, and learning journey.",
      },
    ],
  }),
  component: DashboardPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatName(raw: string): string {
  const first = raw.split(" ")[0] ?? raw;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<DailyChallengeWithCategory | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [recent, setRecent] = useState<RecentActivityItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const word = useMemo(() => pickForToday(WORDS_OF_THE_DAY)!, []);
  const motivation = useMemo(() => pickForToday(MOTIVATIONS)!, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await challengesService.listChallenges({ onlyActive: true });
        const pick = challengesService.pickToday(list);
        if (cancelled) return;
        setToday(pick);

        if (user) {
          const [progress, history, total] = await Promise.all([
            pick ? challengesService.getTodayProgress(user.id, pick.id) : null,
            challengesService.listRecentCompleted(user.id, 5),
            challengesService.countCompleted(user.id),
          ]);
          if (cancelled) return;
          setCompletedToday(!!progress?.completed);
          setCompletedCount(total);
          setRecent(
            (
              history as Array<{
                id: string;
                completed_at: string | null;
                challenge: { title: string; difficulty: ChallengeDifficulty } | null;
              }>
            ).map((r) => ({
              id: r.id,
              title: r.challenge?.title ?? "Challenge",
              completedAt: r.completed_at,
              difficulty: r.challenge?.difficulty ?? null,
            })),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const { stats } = usePracticeStats();
  const journeyLevelKey = levelForXp(stats.xp).key as JourneyLevel["key"];

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "there";
  const displayName = formatName(fullName);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Section: Greeting */}
        <GreetingCard name={displayName} greeting={greeting()} />

        {/* Sections 1 & 2: Today's Challenge + Today's Word */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodayChallengeCard loading={loading} challenge={today} completed={completedToday} />
          </div>
          <TodayWordCard word={word} />
        </div>

        {/* Section 3: Quick Progress */}
        <QuickProgress completed={completedCount} />

        {/* Sections 4 & 5: Recent Activity + Daily Motivation */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity loading={loading} items={recent} />
          </div>
          <DailyMotivation motivation={motivation} />
        </div>

        {/* Announcements aimed at this account */}
        <AnnouncementsCard />

        {/* Section 6: Learning Journey */}
        <LearningJourney currentLevelKey={journeyLevelKey} />

        {/* Section 7: Upcoming Features */}
        <UpcomingFeatures />
      </div>
    </PageContainer>
  );
}
