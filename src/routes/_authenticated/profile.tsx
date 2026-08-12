import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  CalendarDays,
  Flame,
  GraduationCap,
  Loader2,
  IdCard,
  MessageSquare,
  Pencil,
  Phone,
  Star,
  Timer,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ACHIEVEMENT_LABELS, usePracticeStats } from "@/lib/practice-progress";

const SCHOOL_NAME = "Sri Vijaya Sai High School";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  receptionist: "Receptionist",
  office_staff: "Office Staff",
  support_staff: "Support Staff",
};

interface ProfileRow {
  id: string;
  full_name: string | null;
  login_id: string;
  phone: string | null;
  department: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

function levelFor(xp: number) {
  const levels = [
    { name: "Beginner", min: 0, max: 200 },
    { name: "Explorer", min: 200, max: 600 },
    { name: "Confident", min: 600, max: 1200 },
    { name: "Advanced", min: 1200, max: 2000 },
    { name: "Master", min: 2000, max: 3000 },
  ];
  const current = levels.find((l) => xp < l.max) ?? levels[levels.length - 1];
  const pct = Math.min(100, Math.round(((xp - current.min) / (current.max - current.min)) * 100));
  return { ...current, pct };
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProfilePage() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const { stats } = usePracticeStats();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", department: "", avatar_url: "" });

  const userId = user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, login_id, phone, department, avatar_url, status, created_at, last_login_at",
        )
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileRow | null;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name.trim() || null,
          phone: values.phone.trim() || null,
          department: values.department.trim() || null,
          avatar_url: values.avatar_url.trim() || null,
        })
        .eq("id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not update profile"),
  });

  const openEdit = () => {
    setForm({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      department: profile?.department ?? "",
      avatar_url: profile?.avatar_url ?? "",
    });
    setEditOpen(true);
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Teacher";
  const initials = displayName.slice(0, 2).toUpperCase();
  const level = useMemo(() => levelFor(stats.xp), [stats.xp]);
  const unlocked = stats.unlockedAchievements ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description="Your account details, learning statistics, and achievements."
        actions={
          <Button onClick={openEdit} disabled={!profile}>
            <Pencil className="mr-2 h-4 w-4" /> Edit profile
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                {roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {ROLE_LABELS[role] ?? role}
                  </Badge>
                ))}
                {profile?.status ? <Badge variant="outline">{profile.status}</Badge> : null}
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" /> {SCHOOL_NAME}
                {profile?.department ? ` · ${profile.department}` : ""}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <IdCard className="h-4 w-4" /> {profile?.login_id ?? user?.email?.split("@")[0]}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {profile?.phone || "Not added"}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Joined {formatDate(profile?.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Streak" value={`${stats.dailyStreak} days`} icon={Flame} />
        <StatCard label="XP Earned" value={stats.xp} icon={Star} />
        <StatCard label="Practice Minutes" value={stats.practiceMinutes} icon={Timer} />
        <StatCard label="Conversations" value={stats.conversationCount} icon={MessageSquare} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Progress overview
            </CardTitle>
            <CardDescription>Your journey towards the next English level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Level · {level.name}</span>
                <span className="text-muted-foreground">
                  {stats.xp} / {level.max} XP
                </span>
              </div>
              <Progress value={level.pct} />
            </div>
            <Separator />
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Growth score</span>
                <span className="text-muted-foreground">{stats.growthScore}%</span>
              </div>
              <Progress value={stats.growthScore} />
            </div>
            <p className="text-xs text-muted-foreground">
              Last practice session:{" "}
              {stats.lastSessionDate ? formatDate(stats.lastSessionDate) : "Not yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-accent" /> Achievements
            </CardTitle>
            <CardDescription>
              {unlocked.length} of {Object.keys(ACHIEVEMENT_LABELS).length} unlocked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(ACHIEVEMENT_LABELS).map(([id, label]) => {
              const isUnlocked = unlocked.includes(id);
              return (
                <div
                  key={id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    isUnlocked ? "border-accent/40 bg-accent/5" : "opacity-60"
                  }`}
                >
                  <span className="text-foreground">{label}</span>
                  <Badge variant={isUnlocked ? "default" : "outline"}>
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your details. Your User ID and role are managed by the school administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Lakshmi Rao"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar image URL</Label>
              <Input
                id="avatar_url"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile · SVS English Coach" },
      {
        name: "description",
        content:
          "View and edit your SVS English Coach profile, practice statistics, streak, and achievements.",
      },
      { property: "og:title", content: "Profile · SVS English Coach" },
      {
        property: "og:description",
        content: "Your teacher profile, learning statistics, and achievement summary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});
