import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Building2, Target, Users, Bell, Lock, Bot, Palette, Save } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AI_MODELS,
  DEFAULT_SCHOOL_SETTINGS,
  DEPARTMENT_OPTIONS,
  PRACTICE_MODES,
  ROLE_OPTIONS,
  TIME_ZONES,
  type SchoolSettings,
} from "@/data/school-settings";
import { ROLE_LABEL } from "@/data/admin-users";
import { adminSaveAppSettings, getAppSettings } from "@/services/settings.functions";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Admin · SVS English Coach" },
      { name: "description", content: "School-wide settings and configuration." },
    ],
  }),
  component: AdminSettingsPage,
});

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
      <div className="w-full shrink-0 sm:w-auto">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y">{children}</CardContent>
    </Card>
  );
}

function AdminSettingsPage() {
  const load = useServerFn(getAppSettings);
  const save = useServerFn(adminSaveAppSettings);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => load({ data: undefined }),
  });

  const [form, setForm] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (next: SchoolSettings) => save({ data: next }),
    onSuccess: (next) => {
      queryClient.setQueryData(["app-settings"], next);
      toast.success("Settings saved");
    },
    onError: (e) =>
      toast.error(e instanceof Error && e.message ? e.message : "Could not save settings"),
  });

  function set<S extends keyof SchoolSettings, K extends keyof SchoolSettings[S]>(
    section: S,
    key: K,
    value: SchoolSettings[S][K],
  ) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  function validate(next: SchoolSettings) {
    const e: Record<string, string> = {};
    const hex = /^#[0-9a-fA-F]{6}$/;
    if (next.school.contactNumber && !/^[0-9+\-\s()]{6,20}$/.test(next.school.contactNumber))
      e["contactNumber"] = "Enter a valid contact number";
    if (next.practice.defaultDurationMinutes < 1)
      e["duration"] = "Duration must be at least 1 minute";
    if (next.security.passwordMinLength < 6)
      e["passwordMinLength"] = "Minimum length must be at least 6";
    if (next.security.sessionTimeoutMinutes < 5)
      e["sessionTimeout"] = "Timeout must be at least 5 minutes";
    if (!hex.test(next.appearance.primaryColor)) e["primaryColor"] = "Use a hex colour";
    if (!hex.test(next.appearance.accentColor)) e["accentColor"] = "Use a hex colour";
    if (!/^\d{2}:\d{2}$/.test(next.notifications.dailyReminderTime))
      e["reminderTime"] = "Use HH:MM";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Admin Settings" description="School-wide configuration." />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Admin Settings"
        description="School-wide configuration and administrator preferences."
        actions={
          <Button
            disabled={saveMutation.isPending}
            onClick={() => {
              if (validate(form)) saveMutation.mutate(form);
              else toast.error("Please fix the highlighted fields");
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="School" description="Identity and contact details." icon={Building2}>
          <Row title="School name">
            <Input
              className="sm:w-64"
              value={form.school.name}
              onChange={(e) => set("school", "name", e.target.value)}
            />
          </Row>
          <Row title="School logo URL">
            <Input
              className="sm:w-64"
              value={form.school.logoUrl}
              placeholder="https://…"
              onChange={(e) => set("school", "logoUrl", e.target.value)}
            />
          </Row>
          <Row title="Address">
            <Textarea
              className="sm:w-64"
              rows={2}
              value={form.school.address}
              onChange={(e) => set("school", "address", e.target.value)}
            />
          </Row>
          <Row title="Contact number" description={errors["contactNumber"]}>
            <Input
              className="sm:w-64"
              value={form.school.contactNumber}
              onChange={(e) => set("school", "contactNumber", e.target.value)}
            />
          </Row>
          <Row title="Academic year">
            <Input
              className="sm:w-64"
              placeholder="2026-2027"
              value={form.school.academicYear}
              onChange={(e) => set("school", "academicYear", e.target.value)}
            />
          </Row>
          <Row title="Principal name">
            <Input
              className="sm:w-64"
              value={form.school.principalName}
              onChange={(e) => set("school", "principalName", e.target.value)}
            />
          </Row>
          <Row title="Time zone">
            <Select
              value={form.school.timeZone}
              onValueChange={(v) => set("school", "timeZone", v)}
            >
              <SelectTrigger className="sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_ZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </SectionCard>

        <SectionCard title="Practice" description="Defaults for daily practice." icon={Target}>
          <Row title="Default practice duration (minutes)" description={errors["duration"]}>
            <Input
              type="number"
              min={1}
              max={180}
              className="sm:w-32"
              value={form.practice.defaultDurationMinutes}
              onChange={(e) =>
                set("practice", "defaultDurationMinutes", Number(e.target.value) || 0)
              }
            />
          </Row>
          <Row title="Daily XP goal">
            <Input
              type="number"
              min={0}
              className="sm:w-32"
              value={form.practice.dailyXpGoal}
              onChange={(e) => set("practice", "dailyXpGoal", Number(e.target.value) || 0)}
            />
          </Row>
          <Row title="Weekly goal (minutes)">
            <Input
              type="number"
              min={0}
              className="sm:w-32"
              value={form.practice.weeklyGoalMinutes}
              onChange={(e) => set("practice", "weeklyGoalMinutes", Number(e.target.value) || 0)}
            />
          </Row>
          <Row title="AI difficulty">
            <Select
              value={form.practice.aiDifficulty}
              onValueChange={(v) =>
                set("practice", "aiDifficulty", v as SchoolSettings["practice"]["aiDifficulty"])
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row title="Default practice mode">
            <Select
              value={form.practice.defaultMode}
              onValueChange={(v) => set("practice", "defaultMode", v)}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRACTICE_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </SectionCard>

        <SectionCard title="Users" description="Defaults applied to new accounts." icon={Users}>
          <Row title="Default role">
            <Select
              value={form.users.defaultRole}
              onValueChange={(v) =>
                set("users", "defaultRole", v as SchoolSettings["users"]["defaultRole"])
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row title="Default department">
            <Select
              value={form.users.defaultDepartment || "none"}
              onValueChange={(v) => set("users", "defaultDepartment", v === "none" ? "" : v)}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default</SelectItem>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row title="Allow new users" description="Administrators can create new accounts.">
            <Switch
              checked={form.users.allowNewUsers}
              onCheckedChange={(v) => set("users", "allowNewUsers", v)}
            />
          </Row>
          <Row title="Default email notifications">
            <Switch
              checked={form.users.defaultEmailNotifications}
              onCheckedChange={(v) => set("users", "defaultEmailNotifications", v)}
            />
          </Row>
          <Row title="Default in-app notifications">
            <Switch
              checked={form.users.defaultInAppNotifications}
              onCheckedChange={(v) => set("users", "defaultInAppNotifications", v)}
            />
          </Row>
        </SectionCard>

        <SectionCard
          title="Notifications"
          description="How the school communicates with staff."
          icon={Bell}
        >
          <Row title="Email notifications" description="Reserved for upcoming email delivery.">
            <Switch
              checked={form.notifications.emailEnabled}
              onCheckedChange={(v) => set("notifications", "emailEnabled", v)}
            />
          </Row>
          <Row title="In-app notifications">
            <Switch
              checked={form.notifications.inAppEnabled}
              onCheckedChange={(v) => set("notifications", "inAppEnabled", v)}
            />
          </Row>
          <Row title="Daily reminder time" description={errors["reminderTime"]}>
            <Input
              type="time"
              className="sm:w-40"
              value={form.notifications.dailyReminderTime}
              onChange={(e) => set("notifications", "dailyReminderTime", e.target.value)}
            />
          </Row>
          <Row title="Weekly summary">
            <Switch
              checked={form.notifications.weeklySummary}
              onCheckedChange={(v) => set("notifications", "weeklySummary", v)}
            />
          </Row>
          <Row title="Achievement notifications">
            <Switch
              checked={form.notifications.achievementNotifications}
              onCheckedChange={(v) => set("notifications", "achievementNotifications", v)}
            />
          </Row>
        </SectionCard>

        <SectionCard title="Security" description="Access and password policy." icon={Lock}>
          <Row title="Session timeout (minutes)" description={errors["sessionTimeout"]}>
            <Input
              type="number"
              min={5}
              max={1440}
              className="sm:w-32"
              value={form.security.sessionTimeoutMinutes}
              onChange={(e) =>
                set("security", "sessionTimeoutMinutes", Number(e.target.value) || 0)
              }
            />
          </Row>
          <Row title="Password minimum length" description={errors["passwordMinLength"]}>
            <Input
              type="number"
              min={6}
              max={72}
              className="sm:w-32"
              value={form.security.passwordMinLength}
              onChange={(e) => set("security", "passwordMinLength", Number(e.target.value) || 0)}
            />
          </Row>
          <Row
            title="Force password reset"
            description="Administrators must set a new password for every account."
          >
            <Switch
              checked={form.security.forcePasswordReset}
              onCheckedChange={(v) => set("security", "forcePasswordReset", v)}
            />
          </Row>
          <Row title="Login attempt limit">
            <Input
              type="number"
              min={1}
              max={20}
              className="sm:w-32"
              value={form.security.loginAttemptLimit}
              onChange={(e) => set("security", "loginAttemptLimit", Number(e.target.value) || 0)}
            />
          </Row>
        </SectionCard>

        <SectionCard title="AI" description="Coaching engine configuration." icon={Bot}>
          <Row title="AI coach enabled">
            <Switch
              checked={form.ai.coachEnabled}
              onCheckedChange={(v) => set("ai", "coachEnabled", v)}
            />
          </Row>
          <Row title="Voice practice enabled">
            <Switch
              checked={form.ai.voicePracticeEnabled}
              onCheckedChange={(v) => set("ai", "voicePracticeEnabled", v)}
            />
          </Row>
          <Row title="AI feedback level">
            <Select
              value={form.ai.feedbackLevel}
              onValueChange={(v) =>
                set("ai", "feedbackLevel", v as SchoolSettings["ai"]["feedbackLevel"])
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row title="AI model" description="Configurable — used by future coaching updates.">
            <Select value={form.ai.model} onValueChange={(v) => set("ai", "model", v)}>
              <SelectTrigger className="sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </SectionCard>

        <SectionCard title="Appearance" description="School branding and theme." icon={Palette}>
          <Row title="School theme name">
            <Input
              className="sm:w-64"
              value={form.appearance.themeName}
              onChange={(e) => set("appearance", "themeName", e.target.value)}
            />
          </Row>
          <Row title="Primary colour" description={errors["primaryColor"]}>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                className="h-9 w-14 p-1"
                value={form.appearance.primaryColor}
                onChange={(e) => set("appearance", "primaryColor", e.target.value)}
              />
              <Input
                className="w-32"
                value={form.appearance.primaryColor}
                onChange={(e) => set("appearance", "primaryColor", e.target.value)}
              />
            </div>
          </Row>
          <Row title="Accent colour" description={errors["accentColor"]}>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                className="h-9 w-14 p-1"
                value={form.appearance.accentColor}
                onChange={(e) => set("appearance", "accentColor", e.target.value)}
              />
              <Input
                className="w-32"
                value={form.appearance.accentColor}
                onChange={(e) => set("appearance", "accentColor", e.target.value)}
              />
            </div>
          </Row>
          <Row title="Light / Dark / System">
            <Select
              value={form.appearance.colorMode}
              onValueChange={(v) =>
                set("appearance", "colorMode", v as SchoolSettings["appearance"]["colorMode"])
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </SectionCard>
      </div>

      <Separator className="my-8" />
      <p className="text-xs text-muted-foreground">
        Settings are stored for the whole school and apply to every account.
      </p>
    </PageContainer>
  );
}
