import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/learning/DifficultyBadge";

export interface PracticeMode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  icon: LucideIcon;
}

interface Props {
  mode: PracticeMode;
  onStart: (mode: PracticeMode) => void;
}

export function PracticeModeCard({ mode, onStart }: Props) {
  const Icon = mode.icon;
  const lastFired = useRef(0);

  // One handler for the whole card; guards against double taps on touch devices.
  const start = () => {
    const now = Date.now();
    if (now - lastFired.current < 800) return;
    lastFired.current = now;
    onStart(mode);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Start ${mode.title} practice`}
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col shadow-soft transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-90"
    >
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <DifficultyBadge level={mode.difficulty} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">{mode.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {mode.duration}
          </span>
          <Button
            type="button"
            className="h-11 gap-1.5 px-4"
            onClick={(e) => {
              // The card already handles the tap; stop it running twice.
              e.stopPropagation();
              start();
            }}
          >
            <Play className="h-4 w-4" />
            Start Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
