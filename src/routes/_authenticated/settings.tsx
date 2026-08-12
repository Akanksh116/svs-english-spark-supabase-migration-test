import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Lock,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  Target,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { applyTheme, useUserSettings, type UserSettings } from "@/lib/user-settings";

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="pr-4">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { settings, update, reset } = useUserSettings();
  const { user } = useAuth();

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const set = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    update(key, value);
    toast.success("Setting saved");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage notifications, practice preferences, appearance, and privacy."
        actions={
          <ConfirmDialog
            trigger={
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset to defaults
              </Button>
            }
            title="Reset all settings?"
            description="Your preferences will return to the recommended defaults."
            confirmLabel="Reset"
            onConfirm={() => {
              reset();
              toast.success("Settings reset to defaults");
            }}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" /> Notifications &amp; reminders
            </CardTitle>
            <CardDescription>Choose what SVS English Coach tells you about.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row title="School announcements" description="Emails about new school announcements.">
              <Switch
                checked={settings.emailAnnouncements}
                onCheckedChange={(v) => set("emailAnnouncements", v)}
              />
            </Row>
            <Row title="Daily practice reminder" description="A gentle nudge to practice English.">
              <Switch
                checked={settings.practiceReminders}
                onCheckedChange={(v) => set("practiceReminders", v)}
              />
            </Row>
            <Row title="Reminder time" description="When your daily reminder appears.">
              <Input
                type="time"
                className="w-32"
                value={settings.reminderTime}
                onChange={(e) => update("reminderTime", e.target.value)}
                disabled={!settings.practiceReminders}
              />
            </Row>
            <Row title="Achievement alerts" description="Celebrate badges and streak milestones.">
              <Switch
                checked={settings.achievementAlerts}
                onCheckedChange={(v) => set("achievementAlerts", v)}
              />
            </Row>
            <Row title="Weekly progress summary" description="A short recap every Sunday.">
              <Switch
                checked={settings.weeklySummary}
                onCheckedChange={(v) => set("weeklySummary", v)}
              />
            </Row>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Volume2 className="h-4 w-4 text-primary" /> Sound &amp; pronunciation
            </CardTitle>
            <CardDescription>Audio behaviour across learning and practice.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row title="Sound effects" description="Feedback sounds for correct answers and XP.">
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(v) => set("soundEffects", v)}
              />
            </Row>
            <Row title="Auto-play pronunciation" description="Play word audio when a card opens.">
              <Switch
                checked={settings.autoPlayPronunciation}
                onCheckedChange={(v) => set("autoPlayPronunciation", v)}
              />
            </Row>
            <Row title="Voice speed" description="Speed of spoken examples.">
              <Select
                value={settings.voiceSpeed}
                onValueChange={(v) => set("voiceSpeed", v as UserSettings["voiceSpeed"])}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" /> Practice preferences
            </CardTitle>
            <CardDescription>Defaults used when you start a practice session.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <Row title="Default practice mode">
              <Select
                value={settings.defaultPracticeMode}
                onValueChange={(v) => set("defaultPracticeMode", v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Classroom Teaching</SelectItem>
                  <SelectItem value="parent">Parent Meeting</SelectItem>
                  <SelectItem value="office">Office Communication</SelectItem>
                  <SelectItem value="telephone">Telephone Conversation</SelectItem>
                  <SelectItem value="assembly">Assembly Speech</SelectItem>
                  <SelectItem value="general">General Spoken English</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row title="Difficulty level">
              <Select
                value={settings.difficulty}
                onValueChange={(v) => set("difficulty", v as UserSettings["difficulty"])}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <div className="py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Session length</p>
                <span className="text-sm text-muted-foreground">{settings.sessionLength} min</span>
              </div>
              <Slider
                value={[settings.sessionLength]}
                min={5}
                max={45}
                step={5}
                onValueChange={([v]) => update("sessionLength", v)}
              />
            </div>
            <div className="py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Daily goal</p>
                <span className="text-sm text-muted-foreground">
                  {settings.dailyGoalMinutes} min / day
                </span>
              </div>
              <Slider
                value={[settings.dailyGoalMinutes]}
                min={5}
                max={60}
                step={5}
                onValueChange={([v]) => update("dailyGoalMinutes", v)}
              />
            </div>
            <Row
              title="Show Telugu / Hindi translations"
              description="Helpful while you build confidence."
            >
              <Switch
                checked={settings.showTranslations}
                onCheckedChange={(v) => set("showTranslations", v)}
              />
            </Row>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" /> Appearance
              </CardTitle>
              <CardDescription>Theme used across the portal.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <Row title="Theme">
                <Select
                  value={settings.theme}
                  onValueChange={(v) => set("theme", v as UserSettings["theme"])}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row title="Interface language" description="Support language for explanations.">
                <Select
                  value={settings.preferredLanguage}
                  onValueChange={(v) =>
                    set("preferredLanguage", v as UserSettings["preferredLanguage"])
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="telugu">Telugu</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-primary" /> Privacy &amp; account
              </CardTitle>
              <CardDescription>Control how your progress is shared.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <Row
                title="Show me on the leaderboard"
                description="Your name appears in the friendly staff ranking."
              >
                <Switch
                  checked={settings.showOnLeaderboard}
                  onCheckedChange={(v) => set("showOnLeaderboard", v)}
                />
              </Row>
              <Row
                title="Share progress with administrators"
                description="Helps the school support your learning."
              >
                <Switch
                  checked={settings.shareProgressWithAdmin}
                  onCheckedChange={(v) => set("shareProgressWithAdmin", v)}
                />
              </Row>
              <div className="pt-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Signed in as
                </Label>
                <p className="mt-1 text-sm text-foreground">{user?.email ?? "—"}</p>
                <Separator className="my-3" />
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <SettingsIcon className="h-3.5 w-3.5" />
                  Preferences are saved on this device and will sync to your account later.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings · SVS English Coach" },
      {
        name: "description",
        content:
          "Manage notifications, reminders, sound, practice preferences, theme, and privacy in SVS English Coach.",
      },
      { property: "og:title", content: "Settings · SVS English Coach" },
      {
        property: "og:description",
        content: "Personalise reminders, practice defaults, appearance, and privacy options.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});
