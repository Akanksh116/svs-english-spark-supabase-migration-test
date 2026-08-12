import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminInsights } from "@/hooks/use-admin-insights";

function tier(score: number): { label: string; className: string; dot: string } {
  if (score >= 80)
    return {
      label: "Excellent",
      className: "border-accent/40 bg-accent/10 text-accent",
      dot: "bg-accent",
    };
  if (score >= 60)
    return {
      label: "Good",
      className: "border-primary/40 bg-primary/10 text-primary",
      dot: "bg-primary",
    };
  return {
    label: "Needs Improvement",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700",
    dot: "bg-amber-500",
  };
}

export function SchoolHealthCard() {
  const { data, isLoading } = useAdminInsights();
  const health = data?.health;
  const overall = health?.overall ?? null;
  const metrics = health?.metrics ?? [];
  const t = overall !== null ? tier(overall) : null;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          School English Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Overall Health Score
                </p>
                {overall !== null ? (
                  <p className="mt-1 text-4xl font-bold">
                    {overall}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-bold text-muted-foreground">No Data Yet</p>
                )}
              </div>
              {t ? (
                <Badge variant="outline" className={`gap-1.5 ${t.className}`}>
                  <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                  {t.label}
                </Badge>
              ) : null}
            </div>

            {metrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Scores will appear here once staff complete practice sessions.
              </p>
            ) : (
              <ul className="space-y-4">
                {metrics.map((m) => (
                  <li key={m.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-foreground">{m.label}</span>
                      <span className="font-semibold text-muted-foreground">{m.value}%</span>
                    </div>
                    <Progress value={m.value} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
