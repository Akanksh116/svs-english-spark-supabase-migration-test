import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { APP_ROLES } from "@/types/auth";
import { ANNOUNCEMENT_PRIORITIES, ANNOUNCEMENT_STATUSES } from "@/data/announcements";

const isoOrNull = z.string().datetime().nullable().default(null);

const announcementSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(140),
  body: z.string().trim().min(3, "Description is too short").max(4000),
  category: z.string().trim().max(60).nullable().default(null),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES),
  status: z.enum(ANNOUNCEMENT_STATUSES),
  publishedAt: isoOrNull,
  expiresAt: isoOrNull,
  isPinned: z.boolean().default(false),
  audience: z.enum(APP_ROLES).nullable().default(null),
  targetDepartments: z.array(z.string().trim().max(60)).max(20).default([]),
});

const idSchema = z.object({ id: z.string().uuid() });

/** Admin-only: every announcement, newest first, pinned on top. */
export const adminListAnnouncements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { listAnnouncements } = await import("./announcements.server");
    return listAnnouncements();
  });

export const adminCreateAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => announcementSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { createAnnouncement } = await import("./announcements.server");
    return createAnnouncement(data, context.userId);
  });

export const adminUpdateAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    announcementSchema.extend({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { updateAnnouncement } = await import("./announcements.server");
    const { id, ...input } = data;
    return updateAnnouncement(id, input);
  });

export const adminDeleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { deleteAnnouncement } = await import("./announcements.server");
    return deleteAnnouncement(data.id);
  });

export const adminSetAnnouncementStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    idSchema.extend({ status: z.enum(ANNOUNCEMENT_STATUSES) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { setAnnouncementStatus } = await import("./announcements.server");
    return setAnnouncementStatus(data.id, data.status);
  });

export const adminSetAnnouncementPinned = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.extend({ pinned: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    const { setAnnouncementPinned } = await import("./announcements.server");
    return setAnnouncementPinned(data.id, data.pinned);
  });

/** Signed-in staff: only the announcements aimed at this account. */
export const myAnnouncements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listAnnouncementsForUser } = await import("./announcements.server");
    return listAnnouncementsForUser(context.userId);
  });

export const markAnnouncementRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ announcementId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { markAnnouncementRead: mark } = await import("./announcements.server");
    return mark(context.userId, data.announcementId);
  });
