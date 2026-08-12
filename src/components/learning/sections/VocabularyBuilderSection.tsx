import { useMemo, useState } from "react";
import { SearchBox } from "@/components/common/SearchBox";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { VocabCard } from "@/components/learning/VocabCard";
import { VOCAB_CATEGORIES } from "@/data/learning/vocabulary";
import { useLearningBucket } from "@/lib/learning-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NS = "vocab";
type Filter = "all" | "favorites" | "learned" | "practice" | "recent";

export function VocabularyBuilderSection() {
  const [category, setCategory] = useState<string>(VOCAB_CATEGORIES[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const fav = useLearningBucket("favorite", NS);
  const learned = useLearningBucket("learned", NS);
  const practice = useLearningBucket("practice", NS);

  const current = useMemo(() => VOCAB_CATEGORIES.find((c) => c.id === category)!, [category]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = current.items;
    if (filter === "favorites") list = list.filter((i) => fav.has(i.id));
    else if (filter === "learned") list = list.filter((i) => learned.has(i.id));
    else if (filter === "practice") list = list.filter((i) => practice.has(i.id));
    else if (filter === "recent") list = list.slice(-5);
    if (q) {
      list = list.filter(
        (i) =>
          i.word.toLowerCase().includes(q) ||
          i.english.toLowerCase().includes(q) ||
          i.telugu.includes(q) ||
          i.hindi.includes(q),
      );
    }
    return list;
  }, [current, filter, query, fav.ids, learned.ids, practice.ids]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {VOCAB_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition " +
              (c.id === category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted")
            }
          >
            <span>{c.emoji}</span>
            <span>{c.name}</span>
            <Badge
              variant="secondary"
              className={
                c.id === category ? "bg-primary-foreground/20 text-primary-foreground" : ""
              }
            >
              {c.items.length}
            </Badge>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {current.emoji} {current.name}
          </h3>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBox value={query} onChange={setQuery} placeholder="Search words, meanings…" />
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All words</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="learned">Recently learned</SelectItem>
              <SelectItem value="practice">Practice later</SelectItem>
              <SelectItem value="recent">Newest 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No words match your filters"
          description="Try clearing the search or switching to All words."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <VocabCard key={item.id} item={item} namespace={NS} />
          ))}
        </div>
      )}
    </div>
  );
}
