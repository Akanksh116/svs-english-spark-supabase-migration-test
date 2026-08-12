import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  challengesService,
  type ChallengeCategory,
  type ChallengeDifficulty,
  type DailyChallengeWithCategory,
} from "@/services/challenges.service";

export const Route = createFileRoute("/_admin/admin/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges · Admin · SVS English Coach" },
      { name: "description", content: "Manage daily English challenges." },
    ],
  }),
  component: AdminChallengesPage,
});

const DIFFICULTIES: ChallengeDifficulty[] = ["beginner", "intermediate", "advanced"];

interface FormState {
  id?: string;
  title: string;
  description: string;
  category_id: string;
  difficulty: ChallengeDifficulty;
  estimated_duration_minutes: number;
  display_order: number;
  is_active: boolean;
}

const emptyForm = (categoryId = ""): FormState => ({
  title: "",
  description: "",
  category_id: categoryId,
  difficulty: "beginner",
  estimated_duration_minutes: 5,
  display_order: 0,
  is_active: true,
});

function AdminChallengesPage() {
  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [challenges, setChallenges] = useState<DailyChallengeWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    setCreatingCat(true);
    try {
      const cat = await challengesService.createCategory(newCategory);
      setCategories((prev) => [...prev, cat]);
      setForm((f) => ({ ...f, category_id: cat.id }));
      setNewCategory("");
      toast.success("Category created");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setCreatingCat(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [cats, list] = await Promise.all([
        challengesService.listCategories(),
        challengesService.listChallenges(),
      ]);
      setCategories(cats);
      setChallenges(list);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return challenges.filter((c) => {
      if (filterCat !== "all" && c.category_id !== filterCat) return false;
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    });
  }, [challenges, search, filterCat]);

  const openCreate = () => {
    setForm(emptyForm(categories[0]?.id ?? ""));
    setOpen(true);
  };

  const openEdit = (c: DailyChallengeWithCategory) => {
    setForm({
      id: c.id,
      title: c.title,
      description: c.description,
      category_id: c.category_id,
      difficulty: c.difficulty,
      estimated_duration_minutes: c.estimated_duration_minutes,
      display_order: c.display_order,
      is_active: c.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category_id) {
      toast.error("Please fill in title, description, and category.");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await challengesService.updateChallenge(form.id, {
          title: form.title,
          description: form.description,
          category_id: form.category_id,
          difficulty: form.difficulty,
          estimated_duration_minutes: form.estimated_duration_minutes,
          display_order: form.display_order,
          is_active: form.is_active,
        });
        toast.success("Challenge updated");
      } else {
        await challengesService.createChallenge({
          title: form.title,
          description: form.description,
          category_id: form.category_id,
          difficulty: form.difficulty,
          estimated_duration_minutes: form.estimated_duration_minutes,
          display_order: form.display_order,
          is_active: form.is_active,
        });
        toast.success("Challenge created");
      }
      setOpen(false);
      await refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: DailyChallengeWithCategory) => {
    try {
      await challengesService.setActive(c.id, !c.is_active);
      setChallenges((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)),
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await challengesService.deleteChallenge(deleteId);
      toast.success("Challenge deleted");
      setDeleteId(null);
      await refresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Daily Challenges"
        description="Create and manage the challenges shown to teachers each day."
        actions={
          <Button onClick={openCreate} className="gap-1">
            <Plus className="h-4 w-4" /> New challenge
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges..."
            className="pl-9"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No challenges match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.category?.name ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{c.difficulty}</TableCell>
                  <TableCell>{c.estimated_duration_minutes} min</TableCell>
                  <TableCell>{c.display_order}</TableCell>
                  <TableCell>
                    <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit challenge" : "New challenge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                {categories.length === 0 ? (
                  <div className="space-y-2 rounded-md border border-dashed p-3">
                    <p className="text-sm text-muted-foreground">No categories available.</p>
                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={creatingCat || !newCategory.trim()}
                        onClick={addCategory}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Select
                    value={form.category_id}
                    onValueChange={(v) => setForm({ ...form, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(v) => setForm({ ...form, difficulty: v as ChallengeDifficulty })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dur">Duration (minutes)</Label>
                <Input
                  id="dur"
                  type="number"
                  min={1}
                  value={form.estimated_duration_minutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estimated_duration_minutes: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ord">Display order</Label>
                <Input
                  id="ord"
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v: boolean) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the challenge. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
