import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  bullets?: string[];
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon = Sparkles,
  bullets,
}: PlaceholderPageProps) {
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="secondary">Coming soon</Badge>}
      />

      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">This section is being crafted</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            We're preparing this experience for Sri Vijaya Sai High School staff. Check back soon —
            it will appear here without any setup on your side.
          </p>

          {bullets && bullets.length > 0 ? (
            <ul className="mt-2 grid gap-2 text-left text-sm text-muted-foreground sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
