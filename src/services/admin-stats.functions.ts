import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin-only: live School Overview numbers for the admin dashboard. */
export const adminSchoolOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { getSchoolOverview, getPractisedYesterday } = await import("./admin-stats.server");
    const [stats, practisedYesterday] = await Promise.all([
      getSchoolOverview(),
      getPractisedYesterday(),
    ]);
    return { ...stats, practisedYesterday };
  });

/** Admin-only: every remaining dashboard widget, aggregated from real rows. */
export const adminDashboardInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const {
      getActivitySeries,
      getSchoolHealth,
      getStaffNeedingEncouragement,
      getAdminRecentActivity,
      getRecentAnnouncements,
      getWeeklyChallenge,
    } = await import("./admin-stats.server");

    const [activity, health, encouragement, recentActivity, announcements, weeklyChallenge] =
      await Promise.all([
        getActivitySeries(),
        getSchoolHealth(),
        getStaffNeedingEncouragement(),
        getAdminRecentActivity(),
        getRecentAnnouncements(),
        getWeeklyChallenge(),
      ]);

    return { activity, health, encouragement, recentActivity, announcements, weeklyChallenge };
  });

/** Admin-only: recent real activity for one staff member. */
export const adminStaffActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { getStaffActivity } = await import("./admin-stats.server");
    return getStaffActivity(data.userId);
  });

/** Admin-only: full Analytics page dataset, aggregated from real rows. */
export const adminAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { getAdminAnalytics } = await import("./admin-stats.server");
    return getAdminAnalytics();
  });
