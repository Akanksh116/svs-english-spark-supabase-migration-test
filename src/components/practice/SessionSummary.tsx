import {
  Clock,
  MessageSquare,
  Sparkles,
  BookOpen,
  AudioLines,
  GraduationCap,
  ThumbsUp,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface SessionSummaryData {
  topic: string;
  durationMinutes: number;
  wordsSpoken: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  homework: string;
  /** Optional AI evaluation extras */
  confidence?: number;
  overall?: number;
  strengths?: string[];
  improvements?: string[];
  betterSentences?: string[];
  aiGenerated?: boolean;
}

interface Props {
  data: SessionSummaryData;
}

const rows: Array<{ key: keyof SessionSummaryData; label: string; icon: typeof Sparkles }> = [
  { key: "fluency", label: "Estimated Fluency", icon: Sparkles },
  { key: "grammar", label: "Grammar Score", icon: MessageSquare },
  { key: "vocabulary", label: "Vocabulary Score", icon: BookOpen },
  { key: "pronunciation", label: "Confidence", icon: AudioLines },
];

export function SessionSummary({ data }: Props) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" />
          Session Summary
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {data.aiGenerated ? "AI Coach" : "Preview"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Topic
            </p>
            <p className="mt-1 text-sm font-medium">{data.topic}</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Duration
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium">
              <Clock className="h-3.5 w-3.5" />
              {data.durationMinutes} min
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {data.overall != null ? "Overall Rating" : "Words Spoken"}
            </p>
            <p className="mt-1 text-sm font-medium">
              {data.overall != null ? `${data.overall}%` : data.wordsSpoken}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((r) => {
            const value = data[r.key] as number;
            return (
              <div key={r.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <r.icon className="h-3.5 w-3.5" />
                    {r.label}
                  </span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            );
          })}
        </div>

        {data.strengths?.length || data.improvements?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.strengths?.length ? (
              <div className="rounded-lg border bg-accent/5 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" /> Strengths
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {data.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.improvements?.length ? (
              <div className="rounded-lg border bg-primary/5 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Target className="h-3 w-3" /> Areas to Improve
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {data.improvements.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {data.betterSentences?.length ? (
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Better Sentence Examples
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.betterSentences.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-lg border border-dashed bg-muted/30 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested Practice
          </p>
          <p className="mt-1 text-sm">{data.homework}</p>
        </div>
      </CardContent>
    </Card>
  );
}
