/**
 * School-wide administration settings. Values are stored in the
 * `app_settings` row (`id = 'school'`); the shapes below describe each
 * section and supply the defaults used when a field has never been set.
 */
import { APP_ROLES, type AppRole } from "@/types/auth";
import { DEPARTMENTS } from "@/data/admin-users";

export interface SchoolSection {
  name: string;
  logoUrl: string;
  address: string;
  contactNumber: string;
  academicYear: string;
  principalName: string;
  timeZone: string;
}

export interface PracticeSection {
  defaultDurationMinutes: number;
  dailyXpGoal: number;
  weeklyGoalMinutes: number;
  aiDifficulty: "beginner" | "intermediate" | "advanced";
  defaultMode: string;
}

export interface UsersSection {
  defaultRole: AppRole;
  defaultDepartment: string;
  allowNewUsers: boolean;
  defaultEmailNotifications: boolean;
  defaultInAppNotifications: boolean;
}

export interface NotificationsSection {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  dailyReminderTime: string;
  weeklySummary: boolean;
  achievementNotifications: boolean;
}

export interface SecuritySection {
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  forcePasswordReset: boolean;
  loginAttemptLimit: number;
}

export interface AiSection {
  coachEnabled: boolean;
  voicePracticeEnabled: boolean;
  feedbackLevel: "brief" | "balanced" | "detailed";
  model: string;
}

export interface AppearanceSection {
  themeName: string;
  primaryColor: string;
  accentColor: string;
  colorMode: "light" | "dark" | "system";
}

export interface SchoolSettings {
  school: SchoolSection;
  practice: PracticeSection;
  users: UsersSection;
  notifications: NotificationsSection;
  security: SecuritySection;
  ai: AiSection;
  appearance: AppearanceSection;
}

export const PRACTICE_MODES = ["classroom", "office", "parent_meetings", "vocabulary"] as const;

export const AI_MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-pro",
] as const;

export const TIME_ZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "UTC",
] as const;

export const ROLE_OPTIONS = APP_ROLES;
export const DEPARTMENT_OPTIONS = DEPARTMENTS;

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  school: {
    name: "",
    logoUrl: "",
    address: "",
    contactNumber: "",
    academicYear: "",
    principalName: "",
    timeZone: "Asia/Kolkata",
  },
  practice: {
    defaultDurationMinutes: 10,
    dailyXpGoal: 50,
    weeklyGoalMinutes: 120,
    aiDifficulty: "beginner",
    defaultMode: "classroom",
  },
  users: {
    defaultRole: "teacher",
    defaultDepartment: "",
    allowNewUsers: true,
    defaultEmailNotifications: false,
    defaultInAppNotifications: true,
  },
  notifications: {
    emailEnabled: false,
    inAppEnabled: true,
    dailyReminderTime: "18:00",
    weeklySummary: false,
    achievementNotifications: true,
  },
  security: {
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    forcePasswordReset: false,
    loginAttemptLimit: 5,
  },
  ai: {
    coachEnabled: true,
    voicePracticeEnabled: false,
    feedbackLevel: "balanced",
    model: "google/gemini-2.5-flash",
  },
  appearance: {
    themeName: "SVS Default",
    primaryColor: "#2563eb",
    accentColor: "#16a34a",
    colorMode: "system",
  },
};

export type SettingsSectionKey = keyof SchoolSettings;
