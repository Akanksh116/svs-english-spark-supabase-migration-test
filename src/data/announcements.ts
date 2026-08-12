import type { AppRole } from "@/types/auth";

export const ANNOUNCEMENT_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];

export const PRIORITY_LABEL: Record<AnnouncementPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_STYLE: Record<AnnouncementPriority, string> = {
  low: "border-muted-foreground/30 bg-muted text-muted-foreground",
  normal: "border-primary/30 bg-primary/10 text-primary",
  high: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  urgent: "border-destructive/40 bg-destructive/10 text-destructive",
};

/** Stored status. `expired` is derived at read time from the expiry date. */
export const ANNOUNCEMENT_STATUSES = ["draft", "published", "scheduled"] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export type EffectiveStatus = AnnouncementStatus | "expired";

export const STATUS_LABEL: Record<EffectiveStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  expired: "Expired",
};

export const STATUS_STYLE: Record<EffectiveStatus, string> = {
  draft: "border-muted-foreground/30 bg-muted text-muted-foreground",
  published: "border-accent/40 bg-accent/10 text-accent",
  scheduled: "border-primary/30 bg-primary/10 text-primary",
  expired: "border-destructive/30 bg-destructive/10 text-destructive",
};

export const ANNOUNCEMENT_CATEGORIES = [
  "General",
  "Academic",
  "Event",
  "Policy",
  "Training",
  "Reminder",
] as const;

/** `null` audience means everyone. */
export type AnnouncementAudience = AppRole | null;

export const AUDIENCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "everyone", label: "Everyone" },
  { value: "teacher", label: "Teachers" },
  { value: "admin", label: "Administrators" },
  { value: "office_staff", label: "Office Staff" },
  { value: "receptionist", label: "Reception" },
  { value: "support_staff", label: "Support Staff" },
];

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** `datetime-local` input value from an ISO string. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
