import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { APP_ROLES } from "@/types/auth";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #2563eb");

const settingsSchema = z.object({
  school: z.object({
    name: z.string().trim().max(120),
    logoUrl: z.string().trim().max(500),
    address: z.string().trim().max(300),
    contactNumber: z.string().trim().max(30),
    academicYear: z.string().trim().max(20),
    principalName: z.string().trim().max(120),
    timeZone: z.string().trim().max(60),
  }),
  practice: z.object({
    defaultDurationMinutes: z.number().int().min(1).max(180),
    dailyXpGoal: z.number().int().min(0).max(10000),
    weeklyGoalMinutes: z.number().int().min(0).max(10000),
    aiDifficulty: z.enum(["beginner", "intermediate", "advanced"]),
    defaultMode: z.string().trim().max(60),
  }),
  users: z.object({
    defaultRole: z.enum(APP_ROLES),
    defaultDepartment: z.string().trim().max(60),
    allowNewUsers: z.boolean(),
    defaultEmailNotifications: z.boolean(),
    defaultInAppNotifications: z.boolean(),
  }),
  notifications: z.object({
    emailEnabled: z.boolean(),
    inAppEnabled: z.boolean(),
    dailyReminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
    weeklySummary: z.boolean(),
    achievementNotifications: z.boolean(),
  }),
  security: z.object({
    sessionTimeoutMinutes: z.number().int().min(5).max(1440),
    passwordMinLength: z.number().int().min(6).max(72),
    forcePasswordReset: z.boolean(),
    loginAttemptLimit: z.number().int().min(1).max(20),
  }),
  ai: z.object({
    coachEnabled: z.boolean(),
    voicePracticeEnabled: z.boolean(),
    feedbackLevel: z.enum(["brief", "balanced", "detailed"]),
    model: z.string().trim().min(1).max(120),
  }),
  appearance: z.object({
    themeName: z.string().trim().max(60),
    primaryColor: hex,
    accentColor: hex,
    colorMode: z.enum(["light", "dark", "system"]),
  }),
});

/** Any signed-in account may read school settings (theme, goals, AI flags). */
export const getAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { getSchoolSettings } = await import("./settings.server");
    return getSchoolSettings();
  });

/** Admin-only: persist every settings section. */
export const adminSaveAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => settingsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { saveSchoolSettings } = await import("./settings.server");
    return saveSchoolSettings(data, context.userId);
  });
