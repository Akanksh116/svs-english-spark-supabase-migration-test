import type { AppRole } from "@/types/auth";

export type UserStatus = "active" | "inactive";

export interface AdminUser {
  id: string;
  name: string;
  loginId: string;
  phone: string;
  department: string;
  role: AppRole;
  status: UserStatus;
  photoUrl?: string | null;
  lastLoginAt: string | null;
  // Live learning stats, read from user_stats for this account.
  currentLevel: string;
  currentStreak: number;
  xp: number;
  growthScore: number;
  practiceMinutes: number;
  challengesCompleted: number;
}

export const DEPARTMENTS = [
  "Primary",
  "Middle School",
  "High School",
  "Administration",
  "Reception",
  "Support",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  receptionist: "Receptionist",
  office_staff: "Office Staff",
  support_staff: "Support Staff",
};

export function formatRelative(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}
