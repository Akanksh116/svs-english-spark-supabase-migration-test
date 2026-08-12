import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChallengeDifficulty } from "@/services/challenges.service";

const difficultyStyles: Record<ChallengeDifficulty, string> = {
  beginner: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

export interface RecentActivityItem {
  id: string;
  title: string;
  completedAt: string | null;
  difficulty: ChallengeDifficulty | null;
}

interface RecentActivityProps {
  loading: boolean;
  items: RecentActivityItem[];
}

export function RecentActivity({ loading, items }: RecentActivityProps) {
  const isEmpty = !loading && items.length === 0;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isEmpty ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet — complete today's challenge to start your history.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : ""}
                  </p>
                </div>
                {r.difficulty && difficultyStyles[r.difficulty] ? (
                  <Badge variant="outline" className={difficultyStyles[r.difficulty]}>
                    {r.difficulty}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
