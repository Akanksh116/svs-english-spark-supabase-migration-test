import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Sparkles, Megaphone, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminInsights } from "@/hooks/use-admin-insights";
import { formatRelative } from "@/data/admin-users";

const iconFor: Record<string, LucideIcon> = {
  session: Sparkles,
  challenge: CheckCircle2,
  announcement: Megaphone,
  account: UserPlus,
};

const toneFor: Record<string, string> = {
  session: "bg-primary/10 text-primary",
  challenge: "bg-accent/10 text-accent",
  announcement: "bg-muted text-muted-foreground",
  account: "bg-primary/10 text-primary",
};

export function AdminRecentActivity() {
  const { data, isLoading } = useAdminInsights();
  const items = data?.recentActivity ?? [];

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Data Yet</p>
        ) : (
          <ul className="space-y-4">
            {items.map((a) => {
              const Icon = iconFor[a.kind] ?? Sparkles;
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      toneFor[a.kind] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(a.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
