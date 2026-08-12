import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { APP_ROLES } from "@/types/auth";

const loginIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "User ID must be at least 3 characters")
  .max(32, "User ID is too long")
  .regex(/^[a-z0-9._-]+$/, "User ID can only use letters, numbers, dot, dash and underscore");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

const signInSchema = z.object({
  loginId: loginIdSchema,
  password: z.string().min(1, "Password is required").max(72),
});

const staffFields = {
  name: z.string().trim().min(2, "Name is too short").max(100),
  phone: z.string().trim().max(20).default(""),
  department: z.string().trim().max(60).default(""),
  role: z.enum(APP_ROLES),
  status: z.enum(["active", "inactive"]),
};

const createSchema = z.object({
  loginId: loginIdSchema,
  password: passwordSchema,
  ...staffFields,
});

const updateSchema = z.object({ id: z.string().uuid(), ...staffFields });

/** Public: exchanges a User ID + password for a session. */
export const signInWithUserId = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signInSchema.parse(data))
  .handler(async ({ data }) => {
    const { signInWithLoginId } = await import("./users.server");
    return signInWithLoginId(data.loginId, data.password);
  });

export const adminListStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, listStaff } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    return listStaff();
  });

export const adminCreateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, createStaff } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    return createStaff(data);
  });

export const adminUpdateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, updateStaff } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    await updateStaff(data);
    return { ok: true };
  });

export const adminSetStaffStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "inactive"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, setStaffStatus } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    await setStaffStatus(data.id, data.status);
    return { ok: true };
  });

export const adminSetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), password: passwordSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, setStaffPassword } = await import("./users.server");
    await assertAdmin(context.supabase, context.userId);
    await setStaffPassword(data.id, data.password);
    return { ok: true };
  });
