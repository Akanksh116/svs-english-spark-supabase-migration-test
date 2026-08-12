import { Heart, CheckCircle2, Bookmark, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  favorited?: boolean;
  learned?: boolean;
  practice?: boolean;
  onToggleFavorite?: () => void;
  onToggleLearned?: () => void;
  onTogglePractice?: () => void;
  showAudio?: boolean;
  compact?: boolean;
}

export function ActionButtons({
  favorited,
  learned,
  practice,
  onToggleFavorite,
  onToggleLearned,
  onTogglePractice,
  showAudio = true,
  compact = false,
}: Props) {
  const size = compact ? "sm" : "sm";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onToggleFavorite ? (
        <Button
          type="button"
          size={size}
          variant={favorited ? "default" : "outline"}
          onClick={onToggleFavorite}
          className={cn(favorited && "bg-primary text-primary-foreground")}
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
          <span className="hidden sm:inline">{favorited ? "Favorited" : "Favorite"}</span>
        </Button>
      ) : null}

      {onToggleLearned ? (
        <Button
          type="button"
          size={size}
          variant={learned ? "default" : "outline"}
          onClick={onToggleLearned}
          className={cn(learned && "bg-accent text-accent-foreground hover:bg-accent/90")}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">{learned ? "Learned" : "Mark learned"}</span>
        </Button>
      ) : null}

      {onTogglePractice ? (
        <Button
          type="button"
          size={size}
          variant={practice ? "secondary" : "outline"}
          onClick={onTogglePractice}
        >
          <Bookmark className={cn("h-4 w-4", practice && "fill-current")} />
          <span className="hidden sm:inline">{practice ? "Saved" : "Practice later"}</span>
        </Button>
      ) : null}

      {showAudio ? (
        <Button type="button" size={size} variant="ghost" disabled title="Audio coming soon">
          <Volume2 className="h-4 w-4" />
          <span className="hidden sm:inline">Listen</span>
        </Button>
      ) : null}
    </div>
  );
}
