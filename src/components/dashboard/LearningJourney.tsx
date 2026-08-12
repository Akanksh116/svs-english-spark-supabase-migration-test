import { Check, Circle, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { JOURNEY_LEVELS, type JourneyLevel } from "@/data/dashboard-content";

interface LearningJourneyProps {
  currentLevelKey?: JourneyLevel["key"];
}

export function LearningJourney({ currentLevelKey = "beginner" }: LearningJourneyProps) {
  const currentIndex = JOURNEY_LEVELS.findIndex((l) => l.key === currentLevelKey);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" />
          Learning Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY_LEVELS.map((level, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <li
                key={level.key}
                className={cn(
                  "relative rounded-xl border p-4 transition-colors",
                  isCurrent && "border-primary bg-primary/5 shadow-soft",
                  isCompleted && "border-accent/40 bg-accent/5",
                  !isCurrent && !isCompleted && "bg-muted/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      isCurrent ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    Step {i + 1}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-accent bg-accent text-accent-foreground",
                      !isCurrent &&
                        !isCompleted &&
                        "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-2 w-2 fill-current" />
                    )}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-3 text-sm font-semibold",
                    isCurrent ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {level.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {level.description}
                </p>
                {isCurrent ? (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    You are here
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
