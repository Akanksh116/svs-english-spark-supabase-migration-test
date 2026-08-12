import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  level: "easy" | "medium" | "hard";
  className?: string;
}

const styles: Record<Props["level"], string> = {
  easy: "bg-accent/15 text-accent border-accent/30",
  medium: "bg-primary/10 text-primary border-primary/25",
  hard: "bg-destructive/10 text-destructive border-destructive/25",
};

const labels: Record<Props["level"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function DifficultyBadge({ level, className }: Props) {
  return (
    <Badge variant="outline" className={cn(styles[level], "font-medium", className)}>
      {labels[level]}
    </Badge>
  );
}
