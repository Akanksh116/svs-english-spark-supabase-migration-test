import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ActionButtons } from "@/components/learning/ActionButtons";
import { useLearningBucket } from "@/lib/learning-store";
import { PARENT_TOPICS } from "@/data/learning/parent-meetings";

const NS = "parent-meetings";

export function ParentMeetingsSection() {
  const [topicId, setTopicId] = useState(PARENT_TOPICS[0].id);
  const topic = useMemo(() => PARENT_TOPICS.find((t) => t.id === topicId)!, [topicId]);

  const fav = useLearningBucket("favorite", NS);
  const practice = useLearningBucket("practice", NS);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {PARENT_TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTopicId(t.id)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition " +
              (t.id === topicId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted")
            }
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {topic.emoji} {topic.name}
        </h3>
        <p className="text-sm text-muted-foreground">{topic.description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {topic.examples.map((ex) => (
          <Card key={ex.id} className="shadow-soft">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Scenario
                </p>
                <p className="mt-1 text-sm text-foreground">{ex.scenario}</p>
              </div>

              <div className="rounded-lg border bg-primary/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  English
                </p>
                <p className="mt-1 text-base font-medium text-foreground">{ex.english}</p>
              </div>

              <div className="grid gap-3 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Telugu
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{ex.telugu}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Hindi
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{ex.hindi}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Key vocabulary
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ex.keyVocab.map((v) => (
                    <Badge key={v} variant="secondary">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                  <Lightbulb className="h-3.5 w-3.5" /> Speaking tips
                </p>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {ex.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-3">
                <ActionButtons
                  favorited={fav.has(ex.id)}
                  practice={practice.has(ex.id)}
                  onToggleFavorite={() => fav.toggle(ex.id)}
                  onTogglePractice={() => practice.toggle(ex.id)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
