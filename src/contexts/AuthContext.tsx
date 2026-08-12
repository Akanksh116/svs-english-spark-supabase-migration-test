import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/auth.service";
import type { AppRole, AppSession, AppUser } from "@/types/auth";

interface AuthContextValue {
  session: AppSession | null;
  user: AppUser | null;
  roles: AppRole[];
  isAdmin: boolean;
  loading: boolean;
  signOut: (options?: { redirectTo?: string }) => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Only these events represent a real identity change that should refresh
// the router and re-fetch roles. TOKEN_REFRESHED / others are ignored to
// avoid unnecessary re-renders and role round-trips.
const IDENTITY_EVENTS = new Set(["INITIAL_SESSION", "SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"]);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const loadRoles = async (userId: string | undefined) => {
    if (!userId) {
      setRoles([]);
      return;
    }
    const next = await authService.fetchRoles(userId);
    setRoles(next);
  };

  useEffect(() => {
    let lastUserId: string | null | undefined;

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!IDENTITY_EVENTS.has(event)) return;

      setSession(next);
      const nextUserId = next?.user?.id ?? null;
      const identityChanged = nextUserId !== lastUserId;
      lastUserId = nextUserId;

      // Defer role fetch to avoid deadlocks inside the auth callback.
      setTimeout(() => {
        void loadRoles(next?.user?.id);
      }, 0);

      // Refresh route context so guards re-run with the new session.
      if (identityChanged) {
        void router.invalidate();
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      lastUserId = data.session?.user?.id ?? null;
      await loadRoles(data.session?.user?.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    roles,
    isAdmin: roles.includes("admin"),
    loading,
    signOut: async ({ redirectTo = "/login" }: { redirectTo?: string } = {}) => {
      // 1. Stop in-flight queries before the 401s land.
      await queryClient.cancelQueries();
      // 2. Drop cached protected data so back-nav can't restore it.
      queryClient.clear();
      // 3. Clear session.
      await authService.signOut();
      // 4. Replace history so the back button can't restore a protected page.
      router.navigate({ to: redirectTo, replace: true });
    },
    refreshRoles: async () => {
      await loadRoles(session?.user?.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
