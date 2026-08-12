/**
 * User preferences — persisted per authenticated user in `user_settings`
 * (a single JSON column), so settings follow the account, not the browser.
 */
import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export interface UserSettings {
  // Notifications
  emailAnnouncements: boolean;
  practiceReminders: boolean;
  achievementAlerts: boolean;
  weeklySummary: boolean;
  reminderTime: string;
  // Sound
  soundEffects: boolean;
  autoPlayPronunciation: boolean;
  voiceSpeed: "slow" | "normal" | "fast";
  // Practice preferences
  defaultPracticeMode: string;
  sessionLength: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  dailyGoalMinutes: number;
  showTranslations: boolean;
  // Appearance
  theme: "light" | "dark" | "system";
  // Privacy
  showOnLeaderboard: boolean;
  shareProgressWithAdmin: boolean;
  // Account
  preferredLanguage: "english" | "telugu" | "hindi";
}

export const DEFAULT_SETTINGS: UserSettings = {
  emailAnnouncements: true,
  practiceReminders: true,
  achievementAlerts: true,
  weeklySummary: false,
  reminderTime: "18:00",
  soundEffects: true,
  autoPlayPronunciation: false,
  voiceSpeed: "normal",
  defaultPracticeMode: "classroom",
  sessionLength: 10,
  difficulty: "beginner",
  dailyGoalMinutes: 15,
  showTranslations: true,
  theme: "system",
  showOnLeaderboard: true,
  shareProgressWithAdmin: true,
  preferredLanguage: "english",
};

export function applyTheme(theme: UserSettings["theme"]) {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", Boolean(dark));
}

export async function fetchSettings(userId: string): Promise<UserSettings> {
  const { data } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    await supabase.from("user_settings").insert({ user_id: userId });
    return DEFAULT_SETTINGS;
  }

  return { ...DEFAULT_SETTINGS, ...((data.settings as Partial<UserSettings>) ?? {}) };
}

export function useUserSettings() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-settings", userId],
    queryFn: () => fetchSettings(userId!),
    enabled: Boolean(userId),
  });

  const settings = query.data ?? DEFAULT_SETTINGS;

  useEffect(() => {
    if (query.data) applyTheme(query.data.theme);
  }, [query.data]);

  const save = useMutation({
    mutationFn: async (next: UserSettings) => {
      if (!userId) return next;
      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: userId, settings: next as unknown as Json }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
      return next;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(["user-settings", userId], next);
    },
  });

  const update = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      const next = { ...settings, [key]: value };
      queryClient.setQueryData(["user-settings", userId], next);
      if (key === "theme") applyTheme(next.theme);
      save.mutate(next);
    },
    [settings, queryClient, userId, save],
  );

  const reset = useCallback(() => {
    queryClient.setQueryData(["user-settings", userId], DEFAULT_SETTINGS);
    applyTheme(DEFAULT_SETTINGS.theme);
    save.mutate(DEFAULT_SETTINGS);
  }, [queryClient, userId, save]);

  return { settings, update, reset, loading: query.isLoading, saving: save.isPending };
}
