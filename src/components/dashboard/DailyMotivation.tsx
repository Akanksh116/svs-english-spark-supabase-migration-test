import { Quote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Motivation } from "@/data/dashboard-content";

interface DailyMotivationProps {
  motivation: Motivation;
}

export function DailyMotivation({ motivation }: DailyMotivationProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Quote className="h-4 w-4 text-accent" />
          Daily Motivation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 border-accent pl-4 text-sm italic text-muted-foreground md:text-base">
          "{motivation.quote}"
        </blockquote>
        {motivation.author ? (
          <p className="mt-2 pl-4 text-xs text-muted-foreground">— {motivation.author}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
