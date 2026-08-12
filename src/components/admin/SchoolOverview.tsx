import { Users, UserCheck, GraduationCap, Target, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StatCard } from "@/components/common/StatCard";
import { adminSchoolOverview } from "@/services/admin-stats.functions";

const NO_DATA = "No Data Yet";

export function SchoolOverview() {
  const fetchOverview = useServerFn(adminSchoolOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "school-overview"],
    queryFn: () => fetchOverview({ data: undefined }),
  });

  const pct = (part: number, total: number) =>
    total > 0 ? `${Math.round((part / total) * 100)}% of staff` : "No staff yet";

  const stats = [
    {
      label: "Total Registered Users",
      value: data?.totalUsers ?? 0,
      icon: Users,
      trend: "Active accounts",
    },
    {
      label: "Today's Active Users",
      value: data?.activeToday ?? 0,
      icon: UserCheck,
      trend: data ? pct(data.activeToday, data.totalUsers) : undefined,
    },
    {
      label: "Teachers Practiced Today",
      value: data?.practicedToday ?? 0,
      icon: GraduationCap,
      trend: data ? `${data.practisedYesterday} yesterday` : undefined,
    },
    {
      label: "Total Challenges Completed",
      value: data?.challengesCompleted ?? 0,
      icon: Target,
      trend: "All-time",
    },
    {
      label: "Avg. Daily Practice",
      value:
        data?.avgDailyPracticeMinutes != null ? `${data.avgDailyPracticeMinutes} min` : NO_DATA,
      icon: Clock,
      trend: "Per user who practised today",
    },
    {
      label: "English Growth Score",
      value: data?.growthScore != null ? `${data.growthScore} / 100` : NO_DATA,
      icon: TrendingUp,
      trend: "Average of scored practice sessions",
    },
  ];

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">School Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            {...s}
            value={isLoading ? "—" : s.value}
            className={isLoading ? "opacity-70" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
