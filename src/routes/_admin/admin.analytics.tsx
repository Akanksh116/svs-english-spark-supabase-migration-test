import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  CalendarDays,
  CalendarRange,
  MessageSquare,
  Clock,
  Timer,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChartView,
  BarChartView,
  ChartCard,
  LineChartView,
  NoData,
} from "@/components/admin/analytics/AnalyticsCharts";
import { TeacherPerformanceTable } from "@/components/admin/analytics/TeacherPerformanceTable";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";

const NO_DATA = "No Data Yet";

function AnalyticsPage() {
  const { data, isLoading } = useAdminAnalytics();
  const o = data?.overview;
  const practice = data?.practice;
  const usage = data?.usage;
  const hasPractice = practice?.hasData ?? false;

  const overviewCards = [
    { label: "Total Users", value: o?.totalUsers ?? 0, icon: Users },
    { label: "Active Today", value: o?.activeToday ?? 0, icon: UserCheck },
    { label: "Active This Week", value: o?.activeThisWeek ?? 0, icon: CalendarDays },
    { label: "Active This Month", value: o?.activeThisMonth ?? 0, icon: CalendarRange },
    { label: "Total Practice Sessions", value: o?.totalSessions ?? 0, icon: MessageSquare },
    { label: "Total Practice Minutes", value: o?.totalMinutes ?? 0, icon: Clock },
    {
      label: "Avg. Session Duration",
      value: o?.avgSessionMinutes != null ? `${o.avgSessionMinutes} min` : NO_DATA,
      icon: Timer,
    },
    { label: "Average XP", value: o?.avgXp != null ? o.avgXp : NO_DATA, icon: Sparkles },
    {
      label: "Average Growth Score",
      value: o?.avgGrowthScore != null ? `${o.avgGrowthScore} / 100` : NO_DATA,
      icon: TrendingUp,
    },
  ];

  const insightRows: { label: string; value: string | null }[] = [
    { label: "Most Active Department", value: data?.insights.mostActiveDepartment ?? null },
    { label: "Least Active Department", value: data?.insights.leastActiveDepartment ?? null },
    { label: "Most Popular Practice Mode", value: data?.insights.mostPopularMode ?? null },
    { label: "Least Used Practice Mode", value: data?.insights.leastUsedMode ?? null },
    { label: "Highest Performing Teacher", value: data?.insights.topTeacher ?? null },
    { label: "Biggest Improvement", value: data?.insights.biggestImprovement ?? null },
    { label: "Lowest Engagement", value: data?.insights.lowestEngagement ?? null },
    {
      label: "Average Weekly Growth",
      value:
        data?.insights.avgWeeklyGrowth != null
          ? `${data.insights.avgWeeklyGrowth > 0 ? "+" : ""}${data.insights.avgWeeklyGrowth} min / week`
          : null,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="Engagement, practice and progress across the school — all figures come from live data."
      />

      {/* Section 1 — School Overview */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">School Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overviewCards.map((c) => (
            <StatCard
              key={c.label}
              label={c.label}
              icon={c.icon}
              value={isLoading ? "—" : c.value}
              className={isLoading ? "opacity-70" : undefined}
            />
          ))}
        </div>
      </section>

      {/* Section 2 — Practice Analytics */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Practice Analytics</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Daily Practice Sessions (30 days)"
            isLoading={isLoading}
            hasData={hasPractice}
          >
            <AreaChartView data={practice?.dailySessions ?? []} name="Sessions" />
          </ChartCard>
          <ChartCard title="Weekly Practice Minutes" isLoading={isLoading} hasData={hasPractice}>
            <BarChartView data={practice?.weeklyMinutes ?? []} name="Minutes" />
          </ChartCard>
          <ChartCard title="Monthly Practice Minutes" isLoading={isLoading} hasData={hasPractice}>
            <BarChartView data={practice?.monthlyMinutes ?? []} name="Minutes" />
          </ChartCard>
          <ChartCard
            title="Practice Mode Distribution"
            isLoading={isLoading}
            hasData={(practice?.modeDistribution.length ?? 0) > 0}
          >
            <BarChartView data={practice?.modeDistribution ?? []} name="Sessions" horizontal />
          </ChartCard>
          <ChartCard
            title="Average Session Duration Trend"
            isLoading={isLoading}
            hasData={hasPractice}
          >
            <LineChartView data={practice?.avgDurationTrend ?? []} name="Avg. minutes" />
          </ChartCard>
        </div>
      </section>

      {/* Section 3 — English Skills */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">English Skills</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {(
            data?.skills ??
            [
              { key: "grammar", label: "Grammar" },
              { key: "vocabulary", label: "Vocabulary" },
              { key: "fluency", label: "Fluency" },
              { key: "confidence", label: "Confidence" },
            ].map((s) => ({
              ...s,
              current: null,
              highest: null,
              lowest: null,
              monthlyImprovement: null,
              series: [],
            }))
          ).map((s) => (
            <Card key={s.key} className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{s.label} Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Current Avg.", value: s.current },
                    { label: "Highest", value: s.highest },
                    { label: "Lowest", value: s.lowest },
                    { label: "Monthly Δ", value: s.monthlyImprovement },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border bg-background/60 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {m.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {isLoading
                          ? "—"
                          : m.value == null
                            ? NO_DATA
                            : m.label === "Monthly Δ" && m.value > 0
                              ? `+${m.value}`
                              : m.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-48">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : s.current == null ? (
                    <NoData />
                  ) : (
                    <LineChartView data={s.series} name={s.label} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 4 — Teacher Performance */}
      <section className="mb-10">
        <TeacherPerformanceTable rows={data?.teachers ?? []} isLoading={isLoading} />
      </section>

      {/* Section 5 — Learning Insights */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Learning Insights</h2>
        <Card className="shadow-soft">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {insightRows.map((r) => (
              <div key={r.label} className="rounded-lg border bg-background/60 p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {r.label}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {isLoading ? "—" : (r.value ?? NO_DATA)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Section 6 — Usage */}
      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Usage</h2>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              {(["daily", "weekly", "monthly"] as const).map((k) => (
                <TabsContent key={k} value={k} className="h-64">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : !usage?.hasData ? (
                    <NoData />
                  ) : (
                    <BarChartView data={usage[k]} name="Active users" />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}

export const Route = createFileRoute("/_admin/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Admin · SVS English Coach" },
      {
        name: "description",
        content:
          "Live school analytics: practice activity, English skill progress, teacher performance and usage.",
      },
      { property: "og:title", content: "Analytics · Admin · SVS English Coach" },
      {
        property: "og:description",
        content: "Live school-wide practice, skills and engagement analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});
