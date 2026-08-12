import { HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminInsights } from "@/hooks/use-admin-insights";
import { ROLE_LABEL, formatRelative } from "@/data/admin-users";
import type { AppRole } from "@/types/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EncouragementTable() {
  const { data, isLoading } = useAdminInsights();
  const rows = data?.encouragement ?? [];

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartHandshake className="h-4 w-4 text-accent" />
          Teachers Needing Encouragement
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Data Yet — every active staff member has practised recently.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Practice</TableHead>
                    <TableHead>Current Streak</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {initials(r.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ROLE_LABEL[r.role as AppRole] ?? r.role}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.lastPracticeAt ? formatRelative(r.lastPracticeAt) : "Never"}
                      </TableCell>
                      <TableCell>{r.streak} days</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-accent/40 bg-accent/10 text-accent"
                        >
                          Needs Encouragement
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              A friendly nudge or announcement can help these staff members get back on track.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
