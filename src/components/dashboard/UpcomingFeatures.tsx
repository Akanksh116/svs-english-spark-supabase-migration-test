import type { LucideIcon } from "lucide-react";
import { Mic, SpellCheck, AudioLines, BookMarked, Award, Rocket, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FeatureStatus = "available" | "coming-soon";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  status: FeatureStatus;
  /** Route to navigate to when the feature is available. */
  to?: string;
}

const FEATURES: Feature[] = [
  {
    title: "AI Speaking Coach",
    description:
      "Start a live text conversation with your AI English coach for any school scenario.",
    icon: Mic,
    status: "available",
    to: "/practice",
  },
  {
    title: "Grammar Feedback",
    description: "See grammar scores and track improvement in your personal Progress reports.",
    icon: SpellCheck,
    status: "available",
    to: "/progress",
  },
  {
    title: "Voice Practice",
    description:
      "Record your voice, see a live transcript, and get an estimated pronunciation score.",
    icon: AudioLines,
    status: "available",
    to: "/practice",
  },
  {
    title: "Vocabulary Builder",
    description:
      "Learn daily words, mark vocabulary, and practise classroom, parent, and office phrases.",
    icon: BookMarked,
    status: "available",
    to: "/vocabulary",
  },
  {
    title: "Weekly Certificates",
    description:
      "Earn certificates for streaks, sessions, and XP milestones on your Achievements page.",
    icon: Award,
    status: "available",
    to: "/achievements",
  },
];

export function UpcomingFeatures() {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-4 w-4 text-primary" />
          Feature Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const CardWrapper = f.to ? Link : "div";
            return (
              <CardWrapper
                key={f.title}
                {...(f.to ? { to: f.to } : {})}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card p-4 transition-shadow",
                  f.to && "hover:shadow-soft cursor-pointer",
                  !f.to && "opacity-95",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  {f.status === "available" ? (
                    <Badge className="gap-1 text-[10px] bg-accent text-accent-foreground hover:bg-accent">
                      Ready
                      <ArrowUpRight className="h-3 w-3 opacity-70" />
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </CardWrapper>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
