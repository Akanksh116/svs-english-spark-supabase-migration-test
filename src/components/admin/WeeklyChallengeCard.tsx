import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminInsights } from "@/hooks/use-admin-insights";

export function WeeklyChallengeCard() {
  const { data, isLoading } = useAdminInsights();
  const challenge = data?.weeklyChallenge ?? null;

  return (
    <Card className="overflow-hidden border-primary/20 shadow-soft">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <Trophy className="h-4 w-4" />
          Weekly Challenge
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !challenge ? (
          <div>
            <h2 className="text-xl font-bold leading-tight">No Data Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No active challenge has been created yet.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link to="/admin/challenges">Manage Challenges</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold leading-tight md:text-3xl">{challenge.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{challenge.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {challenge.category ? (
                  <Badge variant="secondary">{challenge.category}</Badge>
                ) : null}
                <Badge variant="outline" className="capitalize">
                  {challenge.difficulty}
                </Badge>
              </div>

              <div className="mt-5 max-w-md">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">School completion (7 days)</span>
                  <span className="font-semibold">
                    {challenge.completionPct !== null
                      ? `${challenge.completionPct}%`
                      : "No Data Yet"}
                  </span>
                </div>
                <Progress value={challenge.completionPct ?? 0} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {challenge.completedBy} of {challenge.activeStaff} active staff completed it
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="gap-2">
                <Link to="/admin/challenges">View Details</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
