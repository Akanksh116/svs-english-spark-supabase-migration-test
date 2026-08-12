import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminInsights } from "@/hooks/use-admin-insights";
import { ROLE_LABEL, formatRelative } from "@/data/admin-users";
import type { AppRole } from "@/types/auth";

export function RecentAnnouncements() {
  const { data, isLoading } = useAdminInsights();
  const items = data?.announcements ?? [];

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-primary" />
          Recent Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Data Yet — no announcements have been published.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((a) => (
              <li key={a.id} className="rounded-lg border bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {a.audience ? (ROLE_LABEL[a.audience as AppRole] ?? a.audience) : "All Staff"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {a.publishedAt ? formatRelative(a.publishedAt) : "Not published"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
