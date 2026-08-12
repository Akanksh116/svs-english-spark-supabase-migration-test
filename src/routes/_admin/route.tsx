import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/layouts/AdminLayout";
import { authService } from "@/services/auth.service";
import { safeRedirect } from "@/lib/safe-redirect";

/**
 * Admin gate. Requires a session AND the `admin` role assignment in
 * `public.user_roles`. Non-admins are redirected — never forcibly signed out.
 */
export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/admin/login",
        search: { redirect: safeRedirect(location.href, "/admin/dashboard") } as never,
      });
    }

    const isAdmin = await authService.isAdmin(data.user.id);
    if (!isAdmin) {
      // Signed in but not an admin — send them to their portal, keep session.
      throw redirect({ to: "/dashboard" });
    }

    return { user: data.user };
  },
  component: AdminShell,
});

function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
