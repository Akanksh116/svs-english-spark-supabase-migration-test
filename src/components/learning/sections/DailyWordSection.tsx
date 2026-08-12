import { useMemo } from "react";
import { Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/learning/DifficultyBadge";
import { ActionButtons } from "@/components/learning/ActionButtons";
import { useLearningBucket } from "@/lib/learning-store";
import { pickDailyWord } from "@/data/learning/daily-words";

const NS = "daily-word";

export function DailyWordSection() {
  const word = useMemo(() => pickDailyWord(), []);
  const fav = useLearningBucket("favorite", NS);
  const learned = useLearningBucket("learned", NS);

  return (
    <div>
      <Card className="mb-6 border-0 shadow-elevated">
        <CardContent className="space-y-4 bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
            <span>Today's Word</span>
            <span className="opacity-60">·</span>
            <span>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</h2>
            <span className="inline-flex items-center gap-1 text-lg opacity-90">
              <Volume2 className="h-4 w-4" />
              {word.ipa}
            </span>
          </div>
          <p className="max-w-2xl text-base opacity-95">{word.english}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">{word.category}</Badge>
            <DifficultyBadge level={word.difficulty} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <SectionLabel>Telugu meaning</SectionLabel>
            <p className="text-lg text-foreground">{word.telugu}</p>
            <SectionLabel>Hindi meaning</SectionLabel>
            <p className="text-lg text-foreground">{word.hindi}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="space-y-4 p-6">
            <SectionLabel>Example sentence</SectionLabel>
            <p className="text-base italic text-muted-foreground">"{word.example}"</p>
            <SectionLabel>Classroom usage</SectionLabel>
            <p className="text-base italic text-muted-foreground">"{word.classroom}"</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="space-y-3 p-6">
            <SectionLabel>Synonyms</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.length > 0 ? (
                word.synonyms.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="space-y-3 p-6">
            <SectionLabel>Antonyms</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {word.antonyms.length > 0 ? (
                word.antonyms.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Track this word — mark it favorite or learned to add it to your progress.
        </p>
        <ActionButtons
          favorited={fav.has(word.id)}
          learned={learned.has(word.id)}
          onToggleFavorite={() => fav.toggle(word.id)}
          onToggleLearned={() => learned.toggle(word.id)}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
