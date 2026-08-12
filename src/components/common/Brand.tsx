import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandProps {
  compact?: boolean;
  className?: string;
}

export function Brand({ compact, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-foreground">SVS English Coach</span>
          <span className="text-[11px] text-muted-foreground">Sri Vijaya Sai High School</span>
        </div>
      )}
    </div>
  );
}
