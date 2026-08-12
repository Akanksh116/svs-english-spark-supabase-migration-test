import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone, Pin, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, PRIORITY_STYLE, formatDate } from "@/data/announcements";
import { markAnnouncementRead, myAnnouncements } from "@/services/announcements.functions";

/** Announcements aimed at the signed-in account, newest first, pinned on top. */
export function AnnouncementsCard() {
  const listMine = useServerFn(myAnnouncements);
  const markRead = useServerFn(markAnnouncementRead);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-announcements"],
    queryFn: () => listMine({ data: undefined }),
  });

  const mark = useMutation({
    mutationFn: (id: string) => markRead({ data: { announcementId: id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-announcements"] }),
  });

  const items = data ?? [];
  const unread = items.filter((a) => !a.isRead).length;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-primary" />
          Announcements
          {unread > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {unread} new
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements available.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "rounded-lg border p-4",
                  a.isRead ? "bg-background/60" : "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {a.isPinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : null}
                    {a.title}
                    {!a.isRead ? (
                      <span className="ml-1 h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                    ) : null}
                  </p>
                  <Badge variant="outline" className={PRIORITY_STYLE[a.priority]}>
                    {PRIORITY_LABEL[a.priority]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {a.category ? `${a.category} · ` : ""}
                    {formatDate(a.publishedAt)}
                  </p>
                  {!a.isRead ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={mark.isPending}
                      onClick={() => mark.mutate(a.id)}
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" /> Mark as read
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
