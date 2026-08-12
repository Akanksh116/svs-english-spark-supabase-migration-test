/**
 * Server-only aggregation for the Admin Dashboard "School Overview" cards.
 * Every number below is read from the database — no fallbacks, no demo values.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface SchoolOverviewStats {
  totalUsers: number;
  activeToday: number;
  practicedToday: number;
  challengesCompleted: number;
  avgDailyPracticeMinutes: number | null;
  growthScore: number | null;
}

function startOfUtcToday(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

export async function getSchoolOverview(): Promise<SchoolOverviewStats> {
  const since = startOfUtcToday();

  const [totalUsersRes, activeTodayRes, sessionsTodayRes, challengesRes, scoresRes] =
    await Promise.all([
      // 1. all accounts that are not disabled
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      // 2. accounts whose last login happened today (UTC)
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_login_at", since),
      // 3 + 5. practice sessions recorded today
      supabaseAdmin
        .from("practice_sessions")
        .select("user_id, duration_minutes")
        .gte("created_at", since),
      // 4. completed daily challenges (all time)
      supabaseAdmin
        .from("user_daily_progress")
        .select("id", { count: "exact", head: true })
        .eq("completed", true),
      // 6. real AI scoring results
      supabaseAdmin.from("practice_sessions").select("overall"),
    ]);

  const sessionsToday = sessionsTodayRes.data ?? [];
  const practisers = new Set(sessionsToday.map((s) => s.user_id));
  const minutesToday = sessionsToday.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);

  const scores = (scoresRes.data ?? [])
    .map((s) => s.overall)
    .filter((n): n is number => typeof n === "number" && n > 0);

  return {
    totalUsers: totalUsersRes.count ?? 0,
    activeToday: activeTodayRes.count ?? 0,
    practicedToday: practisers.size,
    challengesCompleted: challengesRes.count ?? 0,
    avgDailyPracticeMinutes:
      practisers.size > 0 ? Math.round(minutesToday / practisers.size) : null,
    growthScore:
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
  };
}

/** Yesterday's practising-user count, so the card can show a real comparison. */
export async function getPractisedYesterday(): Promise<number> {
  const now = new Date();
  const startToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startYesterday = new Date(startToday - 86400000).toISOString();
  const { data } = await supabaseAdmin
    .from("practice_sessions")
    .select("user_id")
    .gte("created_at", startYesterday)
    .lt("created_at", new Date(startToday).toISOString());
  return new Set((data ?? []).map((s) => s.user_id)).size;
}

/* ------------------------------------------------------------------ *
 * Dashboard insights — every series below is aggregated from real
 * rows. When a query returns nothing, the shape stays empty so the UI
 * can render an empty state instead of a fabricated number.
 * ------------------------------------------------------------------ */

export interface Point {
  label: string;
  value: number;
}

export interface ActivitySeries {
  daily: Point[];
  weekly: Point[];
  monthly: Point[];
  hasData: boolean;
}

const DAY = 86400000;

function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Practice sessions per day (7d), per week (4w) and average score per month (6m). */
export async function getActivitySeries(): Promise<ActivitySeries> {
  const today = utcMidnight(new Date());
  const monthsBack = new Date(today);
  monthsBack.setUTCMonth(monthsBack.getUTCMonth() - 5);
  monthsBack.setUTCDate(1);

  const { data } = await supabaseAdmin
    .from("practice_sessions")
    .select("created_at, overall")
    .gte("created_at", monthsBack.toISOString());

  const rows = data ?? [];

  const daily: Point[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = today - i * DAY;
    const end = start + DAY;
    daily.push({
      label: new Date(start).toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }),
      value: rows.filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t >= start && t < end;
      }).length,
    });
  }

  const weekly: Point[] = [];
  for (let i = 3; i >= 0; i--) {
    const start = today - (i * 7 + 6) * DAY;
    const end = today - i * 7 * DAY + DAY;
    weekly.push({
      label: `W${4 - i}`,
      value: rows.filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t >= start && t < end;
      }).length,
    });
  }

  const monthly: Point[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCMonth(d.getUTCMonth() - i, 1);
    const start = d.getTime();
    const next = new Date(start);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const scores = rows
      .filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t >= start && t < next.getTime();
      })
      .map((r) => r.overall)
      .filter((n): n is number => typeof n === "number" && n > 0);
    monthly.push({
      label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      value: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    });
  }

  return { daily, weekly, monthly, hasData: rows.length > 0 };
}

export interface SchoolHealth {
  metrics: { label: string; value: number }[];
  overall: number | null;
  sessionCount: number;
}

/** Averages of the stored AI scores plus the share of staff practising weekly. */
export async function getSchoolHealth(): Promise<SchoolHealth> {
  const weekAgo = new Date(utcMidnight(new Date()) - 6 * DAY).toISOString();

  const [sessionsRes, activeRes, weekRes] = await Promise.all([
    supabaseAdmin
      .from("practice_sessions")
      .select("grammar, vocabulary, fluency, confidence, overall"),
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabaseAdmin.from("practice_sessions").select("user_id").gte("created_at", weekAgo),
  ]);

  const sessions = sessionsRes.data ?? [];
  const avg = (key: "grammar" | "vocabulary" | "fluency" | "confidence" | "overall") => {
    const values = sessions
      .map((s) => s[key])
      .filter((n): n is number => typeof n === "number" && n > 0);
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  };

  const metrics: { label: string; value: number }[] = [];
  const push = (label: string, value: number | null) => {
    if (value !== null) metrics.push({ label, value });
  };
  push("Average Grammar", avg("grammar"));
  push("Average Vocabulary", avg("vocabulary"));
  push("Average Fluency", avg("fluency"));
  push("Average Confidence", avg("confidence"));

  const activeStaff = activeRes.count ?? 0;
  const practisingThisWeek = new Set((weekRes.data ?? []).map((s) => s.user_id)).size;
  if (activeStaff > 0) {
    metrics.push({
      label: "Staff Practising This Week",
      value: Math.round((practisingThisWeek / activeStaff) * 100),
    });
  }

  return { metrics, overall: avg("overall"), sessionCount: sessions.length };
}

export interface EncouragementRow {
  id: string;
  name: string;
  role: string;
  lastPracticeAt: string | null;
  streak: number;
}

/** Active staff with no practice session in the last 3 days. */
export async function getStaffNeedingEncouragement(limit = 8): Promise<EncouragementRow[]> {
  const cutoff = utcMidnight(new Date()) - 3 * DAY;

  const [profilesRes, rolesRes, statsRes, sessionsRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, login_id").eq("status", "active"),
    supabaseAdmin.from("user_roles").select("user_id, role"),
    supabaseAdmin.from("user_stats").select("user_id, daily_streak"),
    supabaseAdmin
      .from("practice_sessions")
      .select("user_id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const roleFor = new Map((rolesRes.data ?? []).map((r) => [r.user_id, r.role]));
  const streakFor = new Map((statsRes.data ?? []).map((s) => [s.user_id, s.daily_streak ?? 0]));
  const lastFor = new Map<string, string>();
  for (const s of sessionsRes.data ?? []) {
    if (!lastFor.has(s.user_id)) lastFor.set(s.user_id, s.created_at);
  }

  return (profilesRes.data ?? [])
    .filter((p) => roleFor.get(p.id) !== "admin")
    .map((p) => ({
      id: p.id,
      name: p.full_name ?? p.login_id,
      role: roleFor.get(p.id) ?? "teacher",
      lastPracticeAt: lastFor.get(p.id) ?? null,
      streak: streakFor.get(p.id) ?? 0,
    }))
    .filter((r) => r.lastPracticeAt === null || new Date(r.lastPracticeAt).getTime() < cutoff)
    .sort((a, b) => {
      const at = a.lastPracticeAt ? new Date(a.lastPracticeAt).getTime() : 0;
      const bt = b.lastPracticeAt ? new Date(b.lastPracticeAt).getTime() : 0;
      return at - bt;
    })
    .slice(0, limit);
}

export interface AdminActivityItem {
  id: string;
  kind: "session" | "challenge" | "announcement" | "account";
  text: string;
  at: string;
}

/** Recent real events across the school: sessions, challenge completions, announcements, new accounts. */
export async function getAdminRecentActivity(limit = 8): Promise<AdminActivityItem[]> {
  const [sessionsRes, progressRes, announcementsRes, profilesRes] = await Promise.all([
    supabaseAdmin
      .from("practice_sessions")
      .select("id, user_id, mode_title, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("user_daily_progress")
      .select("id, user_id, completed_at, challenge:daily_challenges(title)")
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("announcements")
      .select("id, title, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit),
    supabaseAdmin.from("profiles").select("id, full_name, login_id, created_at"),
  ]);

  const nameFor = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name ?? p.login_id]));

  const items: AdminActivityItem[] = [];

  for (const s of sessionsRes.data ?? []) {
    items.push({
      id: `s-${s.id}`,
      kind: "session",
      text: `${nameFor.get(s.user_id) ?? "A staff member"} completed a practice session: ${s.mode_title}.`,
      at: s.created_at,
    });
  }
  for (const p of progressRes.data ?? []) {
    if (!p.completed_at) continue;
    const title =
      (p as unknown as { challenge: { title: string } | null }).challenge?.title ??
      "a daily challenge";
    items.push({
      id: `c-${p.id}`,
      kind: "challenge",
      text: `${nameFor.get(p.user_id) ?? "A staff member"} completed ${title}.`,
      at: p.completed_at,
    });
  }
  for (const a of announcementsRes.data ?? []) {
    if (!a.published_at) continue;
    items.push({
      id: `a-${a.id}`,
      kind: "announcement",
      text: `Announcement "${a.title}" was published.`,
      at: a.published_at,
    });
  }
  for (const p of profilesRes.data ?? []) {
    items.push({
      id: `u-${p.id}`,
      kind: "account",
      text: `${p.full_name ?? p.login_id} was added to the school.`,
      at: p.created_at,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: string | null;
  publishedAt: string | null;
}

export async function getRecentAnnouncements(limit = 5): Promise<AnnouncementItem[]> {
  const { data } = await supabaseAdmin
    .from("announcements")
    .select("id, title, body, audience, published_at")
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    audience: a.audience,
    publishedAt: a.published_at,
  }));
}

export interface FeaturedChallenge {
  id: string;
  title: string;
  description: string;
  category: string | null;
  difficulty: string;
  completedBy: number;
  activeStaff: number;
  completionPct: number | null;
}

/** This week's featured challenge: the active challenge completed by most staff in the last 7 days. */
export async function getWeeklyChallenge(): Promise<FeaturedChallenge | null> {
  const weekStart = new Date(utcMidnight(new Date()) - 6 * DAY).toISOString();

  const [challengesRes, progressRes, activeRes] = await Promise.all([
    supabaseAdmin
      .from("daily_challenges")
      .select(
        "id, title, description, difficulty, display_order, category:challenge_categories(name)",
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabaseAdmin
      .from("user_daily_progress")
      .select("challenge_id, user_id")
      .eq("completed", true)
      .gte("challenge_date", weekStart.slice(0, 10)),
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const challenges = challengesRes.data ?? [];
  if (challenges.length === 0) return null;

  const byChallenge = new Map<string, Set<string>>();
  for (const p of progressRes.data ?? []) {
    const set = byChallenge.get(p.challenge_id) ?? new Set<string>();
    set.add(p.user_id);
    byChallenge.set(p.challenge_id, set);
  }

  const featured =
    [...challenges].sort(
      (a, b) => (byChallenge.get(b.id)?.size ?? 0) - (byChallenge.get(a.id)?.size ?? 0),
    )[0] ?? challenges[0];

  const activeStaff = activeRes.count ?? 0;
  const completedBy = byChallenge.get(featured.id)?.size ?? 0;

  return {
    id: featured.id,
    title: featured.title,
    description: featured.description,
    category: (featured as unknown as { category: { name: string } | null }).category?.name ?? null,
    difficulty: featured.difficulty,
    completedBy,
    activeStaff,
    completionPct: activeStaff > 0 ? Math.round((completedBy / activeStaff) * 100) : null,
  };
}

export interface StaffActivityItem {
  id: string;
  text: string;
  at: string;
}

/** Recent real activity for a single staff member (used by the profile panel). */
export async function getStaffActivity(userId: string, limit = 5): Promise<StaffActivityItem[]> {
  const [sessionsRes, progressRes] = await Promise.all([
    supabaseAdmin
      .from("practice_sessions")
      .select("id, mode_title, duration_minutes, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("user_daily_progress")
      .select("id, completed_at, challenge:daily_challenges(title)")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(limit),
  ]);

  const items: StaffActivityItem[] = [];
  for (const s of sessionsRes.data ?? []) {
    items.push({
      id: `s-${s.id}`,
      text: `Practice session: ${s.mode_title} (${s.duration_minutes} min)`,
      at: s.created_at,
    });
  }
  for (const p of progressRes.data ?? []) {
    if (!p.completed_at) continue;
    const title =
      (p as unknown as { challenge: { title: string } | null }).challenge?.title ??
      "Daily challenge";
    items.push({ id: `c-${p.id}`, text: `Completed ${title}`, at: p.completed_at });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}

/* ------------------------------------------------------------------ *
 * Admin → Analytics. One aggregation pass over the same tables used by
 * the dashboard; every value is derived from real rows.
 * ------------------------------------------------------------------ */

export interface AnalyticsOverview {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  totalSessions: number;
  totalMinutes: number;
  avgSessionMinutes: number | null;
  avgXp: number | null;
  avgGrowthScore: number | null;
}

export interface SkillSummary {
  key: "grammar" | "vocabulary" | "fluency" | "confidence";
  label: string;
  current: number | null;
  highest: number | null;
  lowest: number | null;
  monthlyImprovement: number | null;
  series: Point[];
}

export interface TeacherRow {
  id: string;
  name: string;
  loginId: string;
  department: string;
  role: string;
  level: string;
  xp: number;
  streak: number;
  practiceMinutes: number;
  sessions: number;
  avgScore: number | null;
  lastPracticeAt: string | null;
}

export interface LearningInsights {
  mostActiveDepartment: string | null;
  leastActiveDepartment: string | null;
  mostPopularMode: string | null;
  leastUsedMode: string | null;
  topTeacher: string | null;
  biggestImprovement: string | null;
  lowestEngagement: string | null;
  avgWeeklyGrowth: number | null;
}

export interface AdminAnalytics {
  overview: AnalyticsOverview;
  practice: {
    dailySessions: Point[];
    weeklyMinutes: Point[];
    monthlyMinutes: Point[];
    modeDistribution: Point[];
    avgDurationTrend: Point[];
    hasData: boolean;
  };
  skills: SkillSummary[];
  teachers: TeacherRow[];
  insights: LearningInsights;
  usage: { daily: Point[]; weekly: Point[]; monthly: Point[]; hasData: boolean };
}

const LEVELS: { name: string; min: number }[] = [
  { name: "Beginner", min: 0 },
  { name: "Elementary", min: 300 },
  { name: "Intermediate", min: 800 },
  { name: "Advanced", min: 1600 },
  { name: "Expert", min: 3000 },
];

function levelName(xp: number): string {
  let name = LEVELS[0].name;
  for (const l of LEVELS) if (xp >= l.min) name = l.name;
  return name;
}

const avgOf = (values: number[]): number | null =>
  values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const today = utcMidnight(new Date());
  const monthsBack = new Date(today);
  monthsBack.setUTCMonth(monthsBack.getUTCMonth() - 5);
  monthsBack.setUTCDate(1);

  const [profilesRes, rolesRes, statsRes, sessionsRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, login_id, full_name, department, status, last_login_at")
      .eq("status", "active"),
    supabaseAdmin.from("user_roles").select("user_id, role"),
    supabaseAdmin
      .from("user_stats")
      .select("user_id, xp, growth_score, practice_minutes, daily_streak"),
    supabaseAdmin
      .from("practice_sessions")
      .select(
        "id, user_id, mode_title, duration_minutes, overall, grammar, vocabulary, fluency, confidence, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  const profiles = profilesRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const roleFor = new Map((rolesRes.data ?? []).map((r) => [r.user_id, r.role as string]));
  const statFor = new Map((statsRes.data ?? []).map((s) => [s.user_id, s]));

  /* ---- Section 1: overview ---- */
  const loginSince = (ms: number) =>
    profiles.filter((p) => p.last_login_at !== null && new Date(p.last_login_at).getTime() >= ms)
      .length;

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  const xpValues = profiles.map((p) => statFor.get(p.id)?.xp ?? 0);
  const growthValues = profiles
    .map((p) => statFor.get(p.id)?.growth_score ?? 0)
    .filter((n) => n > 0);

  const overview: AnalyticsOverview = {
    totalUsers: profiles.length,
    activeToday: loginSince(today),
    activeThisWeek: loginSince(today - 6 * DAY),
    activeThisMonth: loginSince(today - 29 * DAY),
    totalSessions: sessions.length,
    totalMinutes,
    avgSessionMinutes: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : null,
    avgXp: profiles.length > 0 ? avgOf(xpValues) : null,
    avgGrowthScore: avgOf(growthValues),
  };

  /* ---- Section 2: practice analytics ---- */
  const inRange = (iso: string, start: number, end: number) => {
    const t = new Date(iso).getTime();
    return t >= start && t < end;
  };

  const dailySessions: Point[] = [];
  const avgDurationTrend: Point[] = [];
  for (let i = 29; i >= 0; i--) {
    const start = today - i * DAY;
    const rows = sessions.filter((s) => inRange(s.created_at, start, start + DAY));
    const label = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    dailySessions.push({ label, value: rows.length });
    avgDurationTrend.push({
      label,
      value:
        rows.length > 0
          ? Math.round(rows.reduce((sum, r) => sum + (r.duration_minutes ?? 0), 0) / rows.length)
          : 0,
    });
  }

  const weeklyMinutes: Point[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = today - (i * 7 + 6) * DAY;
    const end = today - i * 7 * DAY + DAY;
    weeklyMinutes.push({
      label: `W${8 - i}`,
      value: sessions
        .filter((s) => inRange(s.created_at, start, end))
        .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0),
    });
  }

  const monthBuckets: { label: string; start: number; end: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCMonth(d.getUTCMonth() - i, 1);
    const next = new Date(d);
    next.setUTCMonth(next.getUTCMonth() + 1);
    monthBuckets.push({
      label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      start: d.getTime(),
      end: next.getTime(),
    });
  }

  const monthlyMinutes: Point[] = monthBuckets.map((b) => ({
    label: b.label,
    value: sessions
      .filter((s) => inRange(s.created_at, b.start, b.end))
      .reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0),
  }));

  const modeCounts = new Map<string, number>();
  for (const s of sessions) {
    modeCounts.set(s.mode_title, (modeCounts.get(s.mode_title) ?? 0) + 1);
  }
  const modeDistribution: Point[] = [...modeCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  /* ---- Section 3: English skills ---- */
  const skillDefs: { key: SkillSummary["key"]; label: string }[] = [
    { key: "grammar", label: "Grammar" },
    { key: "vocabulary", label: "Vocabulary" },
    { key: "fluency", label: "Fluency" },
    { key: "confidence", label: "Confidence" },
  ];

  const skills: SkillSummary[] = skillDefs.map(({ key, label }) => {
    const series: Point[] = monthBuckets.map((b) => ({
      label: b.label,
      value:
        avgOf(
          sessions
            .filter((s) => inRange(s.created_at, b.start, b.end))
            .map((s) => s[key])
            .filter((n): n is number => typeof n === "number" && n > 0),
        ) ?? 0,
    }));
    const all = sessions
      .map((s) => s[key])
      .filter((n): n is number => typeof n === "number" && n > 0);
    const scored = series.filter((p) => p.value > 0);
    const last = scored.at(-1)?.value ?? null;
    const prev = scored.at(-2)?.value ?? null;
    return {
      key,
      label,
      current: avgOf(all),
      highest: all.length > 0 ? Math.max(...all) : null,
      lowest: all.length > 0 ? Math.min(...all) : null,
      monthlyImprovement: last !== null && prev !== null ? last - prev : null,
      series,
    };
  });

  /* ---- Section 4: teacher performance ---- */
  const sessionsFor = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const list = sessionsFor.get(s.user_id) ?? [];
    list.push(s);
    sessionsFor.set(s.user_id, list);
  }

  const teachers: TeacherRow[] = profiles.map((p) => {
    const own = sessionsFor.get(p.id) ?? [];
    const stat = statFor.get(p.id);
    const xp = stat?.xp ?? 0;
    return {
      id: p.id,
      name: p.full_name ?? p.login_id,
      loginId: p.login_id,
      department: p.department ?? "—",
      role: roleFor.get(p.id) ?? "teacher",
      level: levelName(xp),
      xp,
      streak: stat?.daily_streak ?? 0,
      practiceMinutes: stat?.practice_minutes ?? 0,
      sessions: own.length,
      avgScore: avgOf(
        own.map((s) => s.overall).filter((n): n is number => typeof n === "number" && n > 0),
      ),
      lastPracticeAt: own[0]?.created_at ?? null,
    };
  });

  /* ---- Section 5: learning insights ---- */
  const deptMinutes = new Map<string, number>();
  for (const t of teachers) {
    if (!t.department || t.department === "—") continue;
    deptMinutes.set(t.department, (deptMinutes.get(t.department) ?? 0) + t.practiceMinutes);
  }
  const deptSorted = [...deptMinutes.entries()].sort((a, b) => b[1] - a[1]);

  const scoredTeachers = teachers.filter((t) => t.avgScore !== null);
  const topTeacher =
    scoredTeachers.length > 0
      ? [...scoredTeachers].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))[0].name
      : null;

  // Biggest improvement: change between a teacher's first and latest scored session.
  let biggestImprovement: string | null = null;
  let bestDelta = -Infinity;
  for (const t of teachers) {
    const own = (sessionsFor.get(t.id) ?? [])
      .filter((s) => typeof s.overall === "number" && s.overall > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (own.length < 2) continue;
    const delta = own[own.length - 1].overall - own[0].overall;
    if (delta > bestDelta) {
      bestDelta = delta;
      biggestImprovement = `${t.name} (+${delta})`;
    }
  }

  const engaged = teachers.filter((t) => t.role !== "admin");
  const lowestEngagement =
    engaged.length > 0
      ? [...engaged].sort((a, b) => a.practiceMinutes - b.practiceMinutes)[0].name
      : null;

  const weeklyGrowthDeltas = weeklyMinutes.slice(1).map((w, i) => w.value - weeklyMinutes[i].value);

  const insights: LearningInsights = {
    mostActiveDepartment: deptSorted[0]?.[0] ?? null,
    leastActiveDepartment: deptSorted.length > 1 ? deptSorted[deptSorted.length - 1][0] : null,
    mostPopularMode: modeDistribution[0]?.label ?? null,
    leastUsedMode:
      modeDistribution.length > 1 ? modeDistribution[modeDistribution.length - 1].label : null,
    topTeacher,
    biggestImprovement,
    lowestEngagement,
    avgWeeklyGrowth: sessions.length > 0 ? avgOf(weeklyGrowthDeltas) : null,
  };

  /* ---- Section 6: usage (distinct practising users per period) ---- */
  const distinct = (start: number, end: number) =>
    new Set(sessions.filter((s) => inRange(s.created_at, start, end)).map((s) => s.user_id)).size;

  const usageDaily: Point[] = [];
  for (let i = 13; i >= 0; i--) {
    const start = today - i * DAY;
    usageDaily.push({
      label: new Date(start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      value: distinct(start, start + DAY),
    });
  }

  const usageWeekly: Point[] = [];
  for (let i = 7; i >= 0; i--) {
    usageWeekly.push({
      label: `W${8 - i}`,
      value: distinct(today - (i * 7 + 6) * DAY, today - i * 7 * DAY + DAY),
    });
  }

  const usageMonthly: Point[] = monthBuckets.map((b) => ({
    label: b.label,
    value: distinct(b.start, b.end),
  }));

  return {
    overview,
    practice: {
      dailySessions,
      weeklyMinutes,
      monthlyMinutes,
      modeDistribution,
      avgDurationTrend,
      hasData: sessions.length > 0,
    },
    skills,
    teachers,
    insights,
    usage: {
      daily: usageDaily,
      weekly: usageWeekly,
      monthly: usageMonthly,
      hasData: sessions.length > 0,
    },
  };
}
