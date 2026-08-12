import { useMemo, useState } from "react";
import { ArrowUpDown, Users as UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLE_LABEL, formatRelative } from "@/data/admin-users";
import type { AppRole } from "@/types/auth";

export interface TeacherRow {
  id: string;
  name: string;
  loginId: string;
  department: string;
  role: string;
  level: string;
  xp: number;
  streak: number;
  practiceMinutes: number;
  sessions: number;
  avgScore: number | null;
  lastPracticeAt: string | null;
}

type SortKey =
  | "name"
  | "loginId"
  | "department"
  | "role"
  | "level"
  | "xp"
  | "streak"
  | "practiceMinutes"
  | "sessions"
  | "avgScore"
  | "lastPracticeAt";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "loginId", label: "User ID" },
  { key: "department", label: "Department" },
  { key: "role", label: "Role" },
  { key: "level", label: "Current Level" },
  { key: "xp", label: "XP", numeric: true },
  { key: "streak", label: "Streak", numeric: true },
  { key: "practiceMinutes", label: "Practice Min.", numeric: true },
  { key: "sessions", label: "Sessions", numeric: true },
  { key: "avgScore", label: "Avg. AI Score", numeric: true },
  { key: "lastPracticeAt", label: "Last Practice" },
];

export function TeacherPerformanceTable({
  rows,
  isLoading,
}: {
  rows: TeacherRow[];
  isLoading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "xp",
    dir: "desc",
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) =>
          [r.name, r.loginId, r.department, r.role, r.level].join(" ").toLowerCase().includes(q),
        )
      : rows;

    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      let cmp: number;
      if (sort.key === "lastPracticeAt") {
        cmp =
          (av ? new Date(av as string).getTime() : 0) - (bv ? new Date(bv as string).getTime() : 0);
      } else if (typeof av === "number" || typeof bv === "number") {
        cmp = ((av as number) ?? -1) - ((bv as number) ?? -1);
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, query, sort]);

  const toggle = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Teacher Performance</CardTitle>
        <SearchBox value={query} onChange={setQuery} placeholder="Search staff…" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={rows.length === 0 ? "No Data Yet" : "No matching staff"}
            description={
              rows.length === 0
                ? "Performance appears once staff accounts exist."
                : "Try a different search term."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((c) => (
                    <TableHead key={c.key} className={c.numeric ? "text-right" : undefined}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 h-7 gap-1 px-2 text-xs font-medium"
                        onClick={() => toggle(c.key)}
                      >
                        {c.label}
                        <ArrowUpDown className="h-3 w-3 opacity-60" />
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.loginId}</TableCell>
                    <TableCell>{r.department || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABEL[r.role as AppRole] ?? r.role}</Badge>
                    </TableCell>
                    <TableCell>{r.level}</TableCell>
                    <TableCell className="text-right">{r.xp}</TableCell>
                    <TableCell className="text-right">{r.streak}</TableCell>
                    <TableCell className="text-right">{r.practiceMinutes}</TableCell>
                    <TableCell className="text-right">{r.sessions}</TableCell>
                    <TableCell className="text-right">
                      {r.avgScore !== null ? r.avgScore : "No Data Yet"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(r.lastPracticeAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
