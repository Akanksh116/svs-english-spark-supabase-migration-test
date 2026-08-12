import { BookOpen, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WordOfTheDay } from "@/data/dashboard-content";

interface TodayWordCardProps {
  word: WordOfTheDay;
}

export function TodayWordCard({ word }: TodayWordCardProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          Today's Word
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{word.word}</h3>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Volume2 className="h-3.5 w-3.5" />
              {word.pronunciation}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Meaning
            </p>
            <p className="mt-1 text-foreground">{word.meaningEnglish}</p>
          </div>
          <div className="grid gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Telugu
              </p>
              <p className="mt-0.5 text-sm text-foreground">{word.meaningTelugu}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Hindi
              </p>
              <p className="mt-0.5 text-sm text-foreground">{word.meaningHindi}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Example
            </p>
            <p className="mt-1 italic text-muted-foreground">"{word.example}"</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Badge variant="secondary">Vocabulary</Badge>
          <Button size="sm" variant="outline" disabled>
            Quick Quiz · Coming Soon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
