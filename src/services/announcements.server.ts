/**
 * Server-only announcement management.
 *
 * Admin reads/writes use the service-role client; staff reads are filtered
 * to exactly what that account is allowed to see (audience role, department,
 * publish window, expiry) so no cross-audience data ever leaves the server.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AppRole } from "@/types/auth";
import type {
  AnnouncementPriority,
  AnnouncementStatus,
  EffectiveStatus,
} from "@/data/announcements";

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  category: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  effectiveStatus: EffectiveStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  isPinned: boolean;
  audience: AppRole | null;
  targetDepartments: string[];
  authorId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  category: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  isPinned: boolean;
  audience: AppRole | null;
  targetDepartments: string[];
}

type Row = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  published_at: string | null;
  expires_at: string | null;
  is_pinned: boolean;
  audience: AppRole | null;
  target_departments: string[] | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

const SELECT =
  "id, title, body, category, priority, status, published_at, expires_at, is_pinned, audience, target_departments, author_id, created_at, updated_at";

export function effectiveStatus(row: {
  status: AnnouncementStatus;
  published_at: string | null;
  expires_at: string | null;
}): EffectiveStatus {
  if (row.status === "draft") return "draft";
  const now = Date.now();
  if (row.expires_at && new Date(row.expires_at).getTime() <= now) return "expired";
  if (row.published_at && new Date(row.published_at).getTime() > now) return "scheduled";
  if (row.status === "scheduled") return "scheduled";
  return "published";
}

function mapRow(row: Row, authors: Map<string, string>): AnnouncementRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    priority: row.priority,
    status: row.status,
    effectiveStatus: effectiveStatus(row),
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    isPinned: row.is_pinned,
    audience: row.audience,
    targetDepartments: row.target_departments ?? [],
    authorId: row.author_id,
    createdBy: (row.author_id && authors.get(row.author_id)) || "System",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function authorNames(rows: Row[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.author_id).filter(Boolean))] as string[];
  if (ids.length === 0) return new Map();
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, login_id")
    .in("id", ids);
  return new Map((data ?? []).map((p) => [p.id, p.full_name || p.login_id]));
}

/** Everything, for the admin console. */
export async function listAnnouncements(): Promise<AnnouncementRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select(SELECT)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const authors = await authorNames(rows);
  return rows.map((r) => mapRow(r, authors));
}

function toColumns(input: AnnouncementInput) {
  const publishedAt =
    input.status === "draft" ? null : (input.publishedAt ?? new Date().toISOString());
  return {
    title: input.title,
    body: input.body,
    category: input.category,
    priority: input.priority,
    status: input.status,
    published_at: publishedAt,
    expires_at: input.expiresAt,
    is_pinned: input.isPinned,
    audience: input.audience,
    target_departments: input.targetDepartments.length ? input.targetDepartments : null,
    is_published: input.status === "published",
  };
}

export async function createAnnouncement(input: AnnouncementInput, authorId: string) {
  const { error } = await supabaseAdmin
    .from("announcements")
    .insert({ ...toColumns(input), author_id: authorId });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const { error } = await supabaseAdmin.from("announcements").update(toColumns(input)).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setAnnouncementStatus(id: string, status: AnnouncementStatus) {
  let publishedAt: string | undefined;
  if (status === "published") {
    const { data } = await supabaseAdmin
      .from("announcements")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!data?.published_at) publishedAt = new Date().toISOString();
  }
  const { error } = await supabaseAdmin
    .from("announcements")
    .update({
      status,
      is_published: status === "published",
      ...(publishedAt ? { published_at: publishedAt } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setAnnouncementPinned(id: string, pinned: boolean) {
  const { error } = await supabaseAdmin
    .from("announcements")
    .update({ is_pinned: pinned })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export interface StaffAnnouncement {
  id: string;
  title: string;
  body: string;
  category: string | null;
  priority: AnnouncementPriority;
  publishedAt: string | null;
  expiresAt: string | null;
  isPinned: boolean;
  isRead: boolean;
}

/** Announcements a specific signed-in account is allowed to see, right now. */
export async function listAnnouncementsForUser(userId: string): Promise<StaffAnnouncement[]> {
  const nowIso = new Date().toISOString();

  const [{ data: rows }, { data: profile }, { data: roleRows }, { data: reads }] =
    await Promise.all([
      supabaseAdmin
        .from("announcements")
        .select(SELECT)
        .eq("status", "published")
        .lte("published_at", nowIso)
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false }),
      supabaseAdmin.from("profiles").select("department").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("announcement_reads").select("announcement_id").eq("user_id", userId),
    ]);

  const roles = new Set((roleRows ?? []).map((r) => r.role));
  const department = profile?.department ?? null;
  const readSet = new Set((reads ?? []).map((r) => r.announcement_id));

  return ((rows ?? []) as Row[])
    .filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > Date.now())
    .filter((r) => !r.audience || roles.has(r.audience))
    .filter(
      (r) =>
        !r.target_departments ||
        r.target_departments.length === 0 ||
        (department !== null && r.target_departments.includes(department)),
    )
    .map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      category: r.category,
      priority: r.priority,
      publishedAt: r.published_at,
      expiresAt: r.expires_at,
      isPinned: r.is_pinned,
      isRead: readSet.has(r.id),
    }));
}

export async function markAnnouncementRead(userId: string, announcementId: string) {
  const { error } = await supabaseAdmin
    .from("announcement_reads")
    .upsert(
      { user_id: userId, announcement_id: announcementId },
      { onConflict: "announcement_id,user_id" },
    );
  if (error) throw new Error(error.message);
  return { ok: true };
}
