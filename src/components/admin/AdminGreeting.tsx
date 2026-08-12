import { ShieldCheck, School } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export function AdminGreeting() {
  const { user } = useAuth();
  const name =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? "Administrator";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden border-primary/20 shadow-soft">
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge
              variant="secondary"
              className="mb-3 gap-1 border-accent/40 bg-accent/10 text-accent"
            >
              <ShieldCheck className="h-3 w-3" /> Administrator
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, {name} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">{today}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm shadow-sm backdrop-blur">
              <School className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Sri Vijaya Sai High School</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
