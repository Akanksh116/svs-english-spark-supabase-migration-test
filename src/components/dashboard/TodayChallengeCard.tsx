import { Clock, Sparkles, Target } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ChallengeDifficulty,
  DailyChallengeWithCategory,
} from "@/services/challenges.service";

const difficultyStyles: Record<ChallengeDifficulty, string> = {
  beginner: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

interface TodayChallengeCardProps {
  loading: boolean;
  challenge: DailyChallengeWithCategory | null;
  completed: boolean;
}

export function TodayChallengeCard({ loading, challenge, completed }: TodayChallengeCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 shadow-soft">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-10 w-56" />
          </div>
        ) : challenge ? (
          <>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Target className="h-4 w-4" />
              {completed ? "Completed today" : "Today's Challenge"}
            </div>

            <h2 className="text-2xl font-bold leading-tight md:text-3xl">{challenge.title}</h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {challenge.category?.name ? (
                <Badge variant="secondary">{challenge.category.name}</Badge>
              ) : null}
              <Badge variant="outline" className={difficultyStyles[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {challenge.estimated_duration_minutes} min
              </Badge>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {challenge.description}
            </p>

            {completed ? (
              <div className="mt-6 rounded-lg border bg-background/60 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  🎉 Great job! Come back tomorrow for a new challenge.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/practice" search={{ start: "1", challenge: challenge.id }}>
                    <Sparkles className="h-4 w-4" />
                    Start AI Practice
                  </Link>
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Practice with your AI English Coach using voice or text.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No challenges available yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
