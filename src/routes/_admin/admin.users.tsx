import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Pencil,
  MoreHorizontal,
  KeyRound,
  UserX,
  UserCheck,
  Users as UsersIcon,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserFormDialog, type UserFormSubmit } from "@/components/admin/users/UserFormDialog";
import { UserProfilePanel } from "@/components/admin/users/UserProfilePanel";
import {
  DEPARTMENTS,
  ROLE_LABEL,
  formatRelative,
  type AdminUser,
  type UserStatus,
} from "@/data/admin-users";
import {
  adminListStaff,
  adminCreateStaff,
  adminSetStaffPassword,
  adminSetStaffStatus,
  adminUpdateStaff,
} from "@/services/users.functions";
import { APP_ROLES } from "@/types/auth";
import { levelForXp } from "@/lib/practice-progress";

export const Route = createFileRoute("/_admin/admin/users")({
  head: () => ({
    meta: [
      { title: "Users · Admin · SVS English Coach" },
      { name: "description", content: "Manage teachers and staff accounts." },
    ],
  }),
  component: AdminUsersPage,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const statusStyles: Record<UserStatus, string> = {
  active: "border-accent/40 bg-accent/10 text-accent",
  inactive: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

function AdminUsersPage() {
  const listStaff = useServerFn(adminListStaff);
  const createStaff = useServerFn(adminCreateStaff);
  const updateStaff = useServerFn(adminUpdateStaff);
  const setStaffStatus = useServerFn(adminSetStaffStatus);
  const setStaffPassword = useServerFn(adminSetStaffPassword);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: () => listStaff({ data: undefined }),
  });

  const users: AdminUser[] = useMemo(
    () =>
      (data ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        loginId: s.loginId,
        phone: s.phone,
        department: s.department,
        role: s.role,
        status: s.status === "active" ? "active" : "inactive",
        photoUrl: s.avatarUrl,
        lastLoginAt: s.lastLoginAt,
        currentLevel: levelForXp(s.xp).name,
        currentStreak: s.dailyStreak,
        xp: s.xp,
        growthScore: s.growthScore,
        practiceMinutes: s.practiceMinutes,
        challengesCompleted: s.conversationCount,
      })),
    [data],
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [viewUser, setViewUser] = useState<AdminUser | null>(null);

  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (form: UserFormSubmit) => {
      if (form.id) {
        await updateStaff({
          data: {
            id: form.id,
            name: form.name,
            phone: form.phone,
            department: form.department,
            role: form.role,
            status: form.status,
          },
        });
        return "updated" as const;
      }
      await createStaff({
        data: {
          loginId: form.loginId,
          password: form.password,
          name: form.name,
          phone: form.phone,
          department: form.department,
          role: form.role,
          status: form.status,
        },
      });
      return "created" as const;
    },
    onSuccess: (kind) => {
      toast.success(kind === "created" ? "User created" : "User updated");
      setFormOpen(false);
      setEditingUser(null);
      void refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Could not save the user")),
  });

  const passwordMutation = useMutation({
    mutationFn: async (vars: { id: string; password: string }) => setStaffPassword({ data: vars }),
    onSuccess: () => {
      toast.success("Password updated");
      setPasswordTarget(null);
      setNewPassword("");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update the password")),
  });

  const statusMutation = useMutation({
    mutationFn: async (vars: { id: string; status: UserStatus }) => setStaffStatus({ data: vars }),
    onSuccess: (_r, vars) => {
      toast.success(vars.status === "inactive" ? "User deactivated" : "User reactivated");
      setDeactivateTarget(null);
      void refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Could not update the status")),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (deptFilter !== "all" && u.department !== deptFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.loginId.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter, statusFilter, deptFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFormOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage teachers, staff, and administrator accounts."
        actions={
          <Button onClick={openCreate} className="gap-1">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search by name, User ID, or phone…"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {APP_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-0">
                    <div className="py-10">
                      <EmptyState
                        icon={UsersIcon}
                        title="No users match your filters"
                        description="Try clearing filters or adding a new user."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {u.photoUrl ? <AvatarImage src={u.photoUrl} alt={u.name} /> : null}
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ROLE_LABEL[u.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.department}</TableCell>
                    <TableCell className="text-muted-foreground">{u.loginId}</TableCell>
                    <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${statusStyles[u.status]}`}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(u.lastLoginAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewUser(u)}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(u)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="More">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onSelect={() => {
                                setNewPassword("");
                                setPasswordTarget(u);
                              }}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Set password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => setDeactivateTarget(u)}
                              className={
                                u.status === "active"
                                  ? "text-destructive focus:text-destructive"
                                  : undefined
                              }
                            >
                              {u.status === "active" ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Reactivate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingUser(null);
        }}
        user={editingUser}
        submitting={saveMutation.isPending}
        onSubmit={(form) => saveMutation.mutate(form)}
      />

      <UserProfilePanel user={viewUser} onClose={() => setViewUser(null)} />

      <Dialog
        open={!!passwordTarget}
        onOpenChange={(v: boolean) => {
          if (!v) {
            setPasswordTarget(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set password</DialogTitle>
            <DialogDescription>
              Set a new permanent password for{" "}
              <span className="font-medium text-foreground">{passwordTarget?.loginId}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="text"
              autoComplete="new-password"
              value={newPassword}
              maxLength={72}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordTarget(null);
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={newPassword.length < 8 || passwordMutation.isPending}
              onClick={() =>
                passwordTarget &&
                passwordMutation.mutate({ id: passwordTarget.id, password: newPassword })
              }
            >
              Save password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(v: boolean) => !v && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deactivateTarget?.status === "active"
                ? "Deactivate this user?"
                : "Reactivate this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.status === "active"
                ? "They will lose access until reactivated. Their history is preserved."
                : "They will regain access with their existing profile."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deactivateTarget &&
                statusMutation.mutate({
                  id: deactivateTarget.id,
                  status: deactivateTarget.status === "active" ? "inactive" : "active",
                })
              }
              className={
                deactivateTarget?.status === "active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {deactivateTarget?.status === "active" ? "Deactivate" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
