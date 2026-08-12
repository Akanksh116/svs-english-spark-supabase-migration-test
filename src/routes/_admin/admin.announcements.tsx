import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Send,
  Undo2,
  MoreHorizontal,
} from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_PRIORITIES,
  AUDIENCE_OPTIONS,
  PRIORITY_LABEL,
  PRIORITY_STYLE,
  STATUS_LABEL,
  STATUS_STYLE,
  formatDate,
  fromLocalInput,
  toLocalInput,
  type AnnouncementPriority,
  type AnnouncementStatus,
  type EffectiveStatus,
} from "@/data/announcements";
import { DEPARTMENTS } from "@/data/admin-users";
import {
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminListAnnouncements,
  adminSetAnnouncementPinned,
  adminSetAnnouncementStatus,
  adminUpdateAnnouncement,
} from "@/services/announcements.functions";
import type { AppRole } from "@/types/auth";

export const Route = createFileRoute("/_admin/admin/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements · Admin · SVS English Coach" },
      { name: "description", content: "Publish announcements to staff." },
    ],
  }),
  component: AdminAnnouncementsPage,
});

type Announcement = Awaited<ReturnType<typeof adminListAnnouncements>>[number];

interface FormState {
  id: string | null;
  title: string;
  body: string;
  category: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishedAt: string;
  expiresAt: string;
  isPinned: boolean;
  audience: string;
  targetDepartments: string[];
}

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  body: "",
  category: "General",
  priority: "normal",
  status: "draft",
  publishedAt: "",
  expiresAt: "",
  isPinned: false,
  audience: "everyone",
  targetDepartments: [],
};

const PAGE_SIZE = 10;

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

function AdminAnnouncementsPage() {
  const list = useServerFn(adminListAnnouncements);
  const create = useServerFn(adminCreateAnnouncement);
  const update = useServerFn(adminUpdateAnnouncement);
  const remove = useServerFn(adminDeleteAnnouncement);
  const setStatus = useServerFn(adminSetAnnouncementStatus);
  const setPinned = useServerFn(adminSetAnnouncementPinned);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => list({ data: undefined }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-insights"] });
    void queryClient.invalidateQueries({ queryKey: ["my-announcements"] });
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const items = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = items.filter((a) => {
      if (q && !`${a.title} ${a.body} ${a.category ?? ""}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && a.effectiveStatus !== statusFilter) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (audienceFilter !== "all") {
        const value = a.audience ?? "everyone";
        if (value !== audienceFilter) return false;
      }
      return true;
    });

    const sorted = [...rows].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "priority": {
          const order = ANNOUNCEMENT_PRIORITIES;
          return order.indexOf(b.priority) - order.indexOf(a.priority);
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return sorted;
  }, [items, search, statusFilter, priorityFilter, audienceFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const saveMutation = useMutation({
    mutationFn: async (state: FormState) => {
      const payload = {
        title: state.title.trim(),
        body: state.body.trim(),
        category: state.category ? state.category : null,
        priority: state.priority,
        status: state.status,
        publishedAt: fromLocalInput(state.publishedAt),
        expiresAt: fromLocalInput(state.expiresAt),
        isPinned: state.isPinned,
        audience: state.audience === "everyone" ? null : (state.audience as AppRole),
        targetDepartments: state.targetDepartments,
      };
      if (state.id) {
        await update({ data: { id: state.id, ...payload } });
        return "updated" as const;
      }
      await create({ data: payload });
      return "created" as const;
    },
    onSuccess: (kind) => {
      toast.success(kind === "created" ? "Announcement created" : "Announcement updated");
      setFormOpen(false);
      setForm(EMPTY_FORM);
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Could not save announcement")),
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: AnnouncementStatus }) => setStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Status updated");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update status")),
  });

  const pinMutation = useMutation({
    mutationFn: (vars: { id: string; pinned: boolean }) => setPinned({ data: vars }),
    onSuccess: () => {
      toast.success("Pin updated");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update pin")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Could not delete announcement")),
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(a: Announcement) {
    setForm({
      id: a.id,
      title: a.title,
      body: a.body,
      category: a.category ?? "",
      priority: a.priority,
      status: a.status,
      publishedAt: toLocalInput(a.publishedAt),
      expiresAt: toLocalInput(a.expiresAt),
      isPinned: a.isPinned,
      audience: a.audience ?? "everyone",
      targetDepartments: a.targetDepartments,
    });
    setErrors({});
    setFormOpen(true);
  }

  function validate(state: FormState) {
    const next: Record<string, string> = {};
    if (state.title.trim().length < 3) next["title"] = "Title must be at least 3 characters";
    if (state.body.trim().length < 3) next["body"] = "Description must be at least 3 characters";
    if (state.status === "scheduled" && !state.publishedAt)
      next["publishedAt"] = "Scheduled announcements need a publish date";
    if (state.publishedAt && state.expiresAt) {
      if (new Date(state.expiresAt) <= new Date(state.publishedAt))
        next["expiresAt"] = "Expiry must be after the publish date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Announcements"
        description="Publish news and updates to teachers and staff."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Announcement
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search announcements…"
        />
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["draft", "published", "scheduled", "expired"] as EffectiveStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(v) => {
              setPriorityFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {ANNOUNCEMENT_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={audienceFilter}
            onValueChange={(v) => {
              setAudienceFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              {AUDIENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements available."
          description={
            items.length === 0
              ? "Create your first announcement to notify teachers and staff."
              : "No announcements match the current filters."
          }
          action={
            items.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> New Announcement
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Publish date</TableHead>
                  <TableHead>Expiry date</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {a.isPinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : null}
                        <div>
                          <p className="font-medium">{a.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {a.category ? `${a.category} · ` : ""}
                            {a.body}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {AUDIENCE_OPTIONS.find((o) => o.value === (a.audience ?? "everyone"))?.label}
                      {a.targetDepartments.length > 0 ? (
                        <span className="block text-xs text-muted-foreground">
                          {a.targetDepartments.join(", ")}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={PRIORITY_STYLE[a.priority]}>
                        {PRIORITY_LABEL[a.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLE[a.effectiveStatus]}>
                        {STATUS_LABEL[a.effectiveStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(a.publishedAt)}</TableCell>
                    <TableCell className="text-sm">{formatDate(a.expiresAt)}</TableCell>
                    <TableCell className="text-sm">{a.createdBy}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => openEdit(a)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {a.status === "published" ? (
                            <DropdownMenuItem
                              onSelect={() => statusMutation.mutate({ id: a.id, status: "draft" })}
                            >
                              <Undo2 className="mr-2 h-4 w-4" /> Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onSelect={() =>
                                statusMutation.mutate({ id: a.id, status: "published" })
                              }
                            >
                              <Send className="mr-2 h-4 w-4" /> Publish now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onSelect={() => pinMutation.mutate({ id: a.id, pinned: !a.isPinned })}
                          >
                            {a.isPinned ? (
                              <>
                                <PinOff className="mr-2 h-4 w-4" /> Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="mr-2 h-4 w-4" /> Pin to top
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget(a)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} · {filtered.length} announcements
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit announcement" : "New announcement"}</DialogTitle>
            <DialogDescription>
              Choose the audience, priority and schedule for this message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="a-title">Title</Label>
              <Input
                id="a-title"
                value={form.title}
                maxLength={140}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors["title"] ? (
                <p className="text-xs text-destructive">{errors["title"]}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="a-body">Description</Label>
              <Textarea
                id="a-body"
                rows={5}
                maxLength={4000}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
              {errors["body"] ? <p className="text-xs text-destructive">{errors["body"]}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category || "none"}
                  onValueChange={(v) => setForm({ ...form, category: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {ANNOUNCEMENT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as AnnouncementPriority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANNOUNCEMENT_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select
                  value={form.audience}
                  onValueChange={(v) => setForm({ ...form, audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as AnnouncementStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Save as draft</SelectItem>
                    <SelectItem value="published">Publish now</SelectItem>
                    <SelectItem value="scheduled">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="a-publish">Publish date</Label>
                <Input
                  id="a-publish"
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
                {errors["publishedAt"] ? (
                  <p className="text-xs text-destructive">{errors["publishedAt"]}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="a-expiry">Expiry date (optional)</Label>
                <Input
                  id="a-expiry"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
                {errors["expiresAt"] ? (
                  <p className="text-xs text-destructive">{errors["expiresAt"]}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected departments (optional)</Label>
              <div className="flex flex-wrap gap-3 rounded-lg border p-3">
                {DEPARTMENTS.map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.targetDepartments.includes(d)}
                      onCheckedChange={(checked) =>
                        setForm({
                          ...form,
                          targetDepartments: checked
                            ? [...form.targetDepartments, d]
                            : form.targetDepartments.filter((x) => x !== d),
                        })
                      }
                    />
                    {d}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to reach every department in the selected audience.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Pin announcement</p>
                <p className="text-xs text-muted-foreground">
                  Pinned announcements always appear first.
                </p>
              </div>
              <Switch
                checked={form.isPinned}
                onCheckedChange={(v) => setForm({ ...form, isPinned: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={() => {
                if (validate(form)) saveMutation.mutate(form);
              }}
            >
              {form.id ? "Save changes" : "Create announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be permanently removed for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
