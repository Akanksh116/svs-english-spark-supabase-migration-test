import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/common/PageContainer";
import { AdminGreeting } from "@/components/admin/AdminGreeting";
import { SchoolOverview } from "@/components/admin/SchoolOverview";
import { QuickActions } from "@/components/admin/QuickActions";
import { ActivityOverview } from "@/components/admin/ActivityOverview";
import { EncouragementTable } from "@/components/admin/EncouragementTable";
import { RecentAnnouncements } from "@/components/admin/RecentAnnouncements";
import { WeeklyChallengeCard } from "@/components/admin/WeeklyChallengeCard";
import { SchoolHealthCard } from "@/components/admin/SchoolHealthCard";
import { AdminRecentActivity } from "@/components/admin/AdminRecentActivity";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard · SVS English Coach" },
      {
        name: "description",
        content:
          "Monitor usage, encourage teachers, and manage the English learning program at Sri Vijaya Sai High School.",
      },
      { property: "og:title", content: "Admin Dashboard · SVS English Coach" },
      {
        property: "og:description",
        content:
          "School-wide overview of engagement, challenges, announcements, and English health.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <AdminGreeting />
        <SchoolOverview />
        <QuickActions />
        <ActivityOverview />
        <EncouragementTable />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentAnnouncements />
          </div>
          <AdminRecentActivity />
        </div>
        <WeeklyChallengeCard />
        <SchoolHealthCard />
      </div>
    </PageContainer>
  );
}
