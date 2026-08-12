import { IdCard, Phone, Building2, Flame, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { adminStaffActivity } from "@/services/admin-stats.functions";
import { ROLE_LABEL, formatRelative, type AdminUser } from "@/data/admin-users";

/** Recent real activity (sessions + completed challenges) for one staff member. */
function StaffActivity({ userId }: { userId: string }) {
  const fetchActivity = useServerFn(adminStaffActivity);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "staff-activity", userId],
    queryFn: () => fetchActivity({ data: { userId } }),
  });

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  const items = data ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-start justify-between gap-3 rounded-lg border bg-background/60 p-3"
        >
          <p className="text-sm">{a.text}</p>
          <p className="shrink-0 text-xs text-muted-foreground">{formatRelative(a.at)}</p>
        </li>
      ))}
    </ul>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface StatProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

function Stat({ label, value, icon: Icon }: StatProps) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export interface UserProfilePanelProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function UserProfilePanel({ user, onClose }: UserProfilePanelProps) {
  return (
    <Sheet open={!!user} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-md">
        {user ? (
          <>
            <SheetHeader className="p-0 text-left">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {user.photoUrl ? <AvatarImage src={user.photoUrl} alt={user.name} /> : null}
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-xl">{user.name}</SheetTitle>
                  <SheetDescription className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "active"
                          ? "border-accent/40 bg-accent/10 capitalize text-accent"
                          : "border-muted-foreground/30 bg-muted capitalize text-muted-foreground"
                      }
                    >
                      {user.status}
                    </Badge>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <Separator className="my-5" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{user.department}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IdCard className="h-4 w-4" />
                <span className="truncate">{user.loginId}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last login {formatRelative(user.lastLoginAt)}</span>
              </div>
            </div>

            <Separator className="my-5" />

            <div>
              <h3 className="mb-3 text-sm font-semibold">Learning progress</h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Level" value={user.currentLevel} icon={Trophy} />
                <Stat label="Streak" value={`${user.currentStreak} days`} icon={Flame} />
                <Stat label="XP" value={user.xp.toLocaleString()} icon={TrendingUp} />
                <Stat label="Growth Score" value={`${user.growthScore} / 100`} icon={TrendingUp} />
                <Stat label="Practice Time" value={`${user.practiceMinutes} min`} icon={Clock} />
                <Stat label="Challenges" value={user.challengesCompleted} icon={Target} />
              </div>
            </div>

            <Separator className="my-5" />

            <div>
              <h3 className="mb-3 text-sm font-semibold">Recent activity</h3>
              <StaffActivity userId={user.id} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
