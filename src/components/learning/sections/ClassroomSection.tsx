import { useMemo, useState } from "react";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { PhraseCard } from "@/components/learning/PhraseCard";
import { CLASSROOM_GROUPS } from "@/data/learning/classroom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const NS = "classroom";

export function ClassroomSection() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>([CLASSROOM_GROUPS[0].id]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLASSROOM_GROUPS.map((g) => ({
      ...g,
      phrases: !q
        ? g.phrases
        : g.phrases.filter(
            (p) =>
              p.english.toLowerCase().includes(q) ||
              p.telugu.includes(q) ||
              p.hindi.includes(q) ||
              p.usage.toLowerCase().includes(q),
          ),
    })).filter((g) => g.phrases.length > 0);
  }, [query]);

  const value = query.trim() ? groups.map((g) => g.id) : open;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Classroom English</h3>
          <p className="text-sm text-muted-foreground">
            Practical, everyday phrases teachers can use with confidence.
          </p>
        </div>
        <SearchBox value={query} onChange={setQuery} placeholder="Search phrases…" />
      </div>

      {groups.length === 0 ? (
        <EmptyState title="No phrases match your search" description="Try different keywords." />
      ) : (
        <Accordion type="multiple" value={value} onValueChange={setOpen} className="space-y-3">
          {groups.map((g) => (
            <AccordionItem
              key={g.id}
              value={g.id}
              className="rounded-xl border bg-card px-4 shadow-soft"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="flex flex-1 items-center gap-2 text-left">
                  <span>{g.emoji}</span>
                  <span className="font-semibold text-foreground">{g.name}</span>
                  <Badge variant="secondary">{g.phrases.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4 text-sm text-muted-foreground">{g.description}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {g.phrases.map((p) => (
                    <PhraseCard
                      key={p.id}
                      id={p.id}
                      namespace={NS}
                      english={p.english}
                      telugu={p.telugu}
                      hindi={p.hindi}
                      pronunciation={p.pronunciation}
                      usage={p.usage}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
