/**
 * TEMPORARY ADMIN PASSWORD RESET ENDPOINT — REMOVE AFTER USE.
 *
 * This route exists ONLY to recover access to the migrated administrator
 * account on this test copy. It is intentionally narrow:
 *   - POST only
 *   - requires the `x-admin-reset-secret` header to match TEMP_ADMIN_RESET_SECRET
 *   - can only ever target the one hard-coded user UUID below
 *   - reads the new password from TEMP_ADMIN_RESET_PASSWORD (server-only env)
 *   - returns generic JSON only, never secrets or provider payloads
 *
 * !!! DELETE THIS FILE AND UNSET TEMP_ADMIN_RESET_SECRET /
 * !!! TEMP_ADMIN_RESET_PASSWORD ONCE THE PASSWORD HAS BEEN RESET.
 */
import { createFileRoute } from "@tanstack/react-router";

// The ONLY account this endpoint may ever modify.
const TARGET_USER_ID = "5ca75a45-1424-4cd6-9c63-bf2c6ca116b6";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/temp-admin-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedSecret = process.env["TEMP_ADMIN_RESET_SECRET"];
        const newPassword = process.env["TEMP_ADMIN_RESET_PASSWORD"];

        if (!expectedSecret || !newPassword) {
          // Endpoint is inert unless both server-only env vars are configured.
          return Response.json({ ok: false, error: "not_configured" }, { status: 404 });
        }

        const provided = request.headers.get("x-admin-reset-secret") ?? "";
        if (!timingSafeEqual(provided, expectedSecret)) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }

        // Loaded inside the handler so the service-role client never enters a
        // client-reachable bundle.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { error } = await supabaseAdmin.auth.admin.updateUserById(TARGET_USER_ID, {
          password: newPassword,
          email_confirm: true,
        });

        if (error) {
          console.error("[temp-admin-reset] update failed:", error.message);
          return Response.json({ ok: false, error: "reset_failed" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
