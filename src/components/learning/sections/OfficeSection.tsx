import { useMemo, useState } from "react";
import { SearchBox } from "@/components/common/SearchBox";
import { Badge } from "@/components/ui/badge";
import { PhraseCard } from "@/components/learning/PhraseCard";
import { EmptyState } from "@/components/common/EmptyState";
import { OFFICE_SECTIONS } from "@/data/learning/office";

const NS = "office";

export function OfficeSection() {
  const [sectionId, setSectionId] = useState(OFFICE_SECTIONS[0].id);
  const [query, setQuery] = useState("");

  const section = useMemo(() => OFFICE_SECTIONS.find((s) => s.id === sectionId)!, [sectionId]);

  const phrases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return section.phrases;
    return section.phrases.filter(
      (p) =>
        p.english.toLowerCase().includes(q) ||
        p.telugu.includes(q) ||
        p.hindi.includes(q) ||
        p.usage.toLowerCase().includes(q),
    );
  }, [section, query]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {OFFICE_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSectionId(s.id)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition " +
              (s.id === sectionId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted")
            }
          >
            <span>{s.emoji}</span>
            <span>{s.name}</span>
            <Badge
              variant="secondary"
              className={
                s.id === sectionId ? "bg-primary-foreground/20 text-primary-foreground" : ""
              }
            >
              {s.phrases.length}
            </Badge>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {section.emoji} {section.name}
          </h3>
          <p className="text-sm text-muted-foreground">{section.description}</p>
        </div>
        <SearchBox value={query} onChange={setQuery} placeholder="Search phrases…" />
      </div>

      {phrases.length === 0 ? (
        <EmptyState
          title="No phrases match your search"
          description="Try different keywords or another section."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {phrases.map((p) => (
            <PhraseCard
              key={p.id}
              id={p.id}
              namespace={NS}
              english={p.english}
              telugu={p.telugu}
              hindi={p.hindi}
              usage={p.usage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
