import { Card, CardContent } from "@/components/ui/card";
import { ActionButtons } from "./ActionButtons";
import { useLearningBucket } from "@/lib/learning-store";

interface Props {
  id: string;
  namespace: string;
  english: string;
  telugu?: string;
  hindi?: string;
  pronunciation?: string;
  usage?: string;
  extra?: React.ReactNode;
}

export function PhraseCard({
  id,
  namespace,
  english,
  telugu,
  hindi,
  pronunciation,
  usage,
  extra,
}: Props) {
  const fav = useLearningBucket("favorite", namespace);
  const practice = useLearningBucket("practice", namespace);

  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">{english}</p>
          {pronunciation ? (
            <p className="text-xs text-muted-foreground">/{pronunciation}/</p>
          ) : null}
        </div>

        {(telugu || hindi) && (
          <div className="grid gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
            {telugu ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Telugu
                </p>
                <p className="mt-0.5 text-sm text-foreground">{telugu}</p>
              </div>
            ) : null}
            {hindi ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Hindi
                </p>
                <p className="mt-0.5 text-sm text-foreground">{hindi}</p>
              </div>
            ) : null}
          </div>
        )}

        {usage ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Usage
            </p>
            <p className="mt-0.5 text-sm italic text-muted-foreground">"{usage}"</p>
          </div>
        ) : null}

        {extra}

        <div className="flex items-center justify-between border-t pt-3">
          <ActionButtons
            favorited={fav.has(id)}
            practice={practice.has(id)}
            onToggleFavorite={() => fav.toggle(id)}
            onTogglePractice={() => practice.toggle(id)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
