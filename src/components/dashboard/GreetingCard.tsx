import { Sparkles, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GreetingCardProps {
  name: string;
  greeting: string;
  goal?: string;
}

export function GreetingCard({
  name,
  greeting,
  goal = "Complete your Daily English Practice.",
}: GreetingCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 shadow-soft">
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="absolute right-6 top-6 hidden h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary md:flex">
          <Sparkles className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {greeting}, {name} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Welcome back to SVS English Coach.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm shadow-sm backdrop-blur">
          <Target className="h-4 w-4 text-accent" />
          <span className="font-medium text-foreground">Today's goal:</span>
          <span className="text-muted-foreground">{goal}</span>
        </div>
      </div>
    </Card>
  );
}
