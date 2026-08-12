import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/layouts/UserLayout";
import { safeRedirect } from "@/lib/safe-redirect";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: safeRedirect(location.href, "/dashboard") } as never,
      });
    }
    return { user: data.user };
  },
  component: AuthenticatedShell,
});

function AuthenticatedShell() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}
