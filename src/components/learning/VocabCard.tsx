import { Card, CardContent } from "@/components/ui/card";
import { ActionButtons } from "./ActionButtons";
import { DifficultyBadge } from "./DifficultyBadge";
import { useLearningBucket } from "@/lib/learning-store";
import type { VocabItem } from "@/data/learning/vocabulary";

interface Props {
  item: VocabItem;
  namespace: string;
}

export function VocabCard({ item, namespace }: Props) {
  const fav = useLearningBucket("favorite", namespace);
  const learned = useLearningBucket("learned", namespace);
  const practice = useLearningBucket("practice", namespace);

  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{item.word}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.english}</p>
          </div>
          <DifficultyBadge level={item.difficulty} />
        </div>

        <div className="grid gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Telugu
            </p>
            <p className="mt-0.5 text-sm text-foreground">{item.telugu}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Hindi
            </p>
            <p className="mt-0.5 text-sm text-foreground">{item.hindi}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Example
          </p>
          <p className="mt-0.5 text-sm italic text-muted-foreground">"{item.example}"</p>
        </div>

        <div className="border-t pt-3">
          <ActionButtons
            favorited={fav.has(item.id)}
            learned={learned.has(item.id)}
            practice={practice.has(item.id)}
            onToggleFavorite={() => fav.toggle(item.id)}
            onToggleLearned={() => learned.toggle(item.id)}
            onTogglePractice={() => practice.toggle(item.id)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
