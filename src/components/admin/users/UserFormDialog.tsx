import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_ROLES, type AppRole } from "@/types/auth";
import { DEPARTMENTS, ROLE_LABEL, type AdminUser, type UserStatus } from "@/data/admin-users";

const baseSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100, "Name must be under 100 characters"),
  loginId: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "User ID must be at least 3 characters")
    .max(32, "User ID is too long")
    .regex(/^[a-z0-9._-]+$/, "User ID can only use letters, numbers, dot, dash and underscore"),
  phone: z.string().trim().max(20, "Phone number is too long"),
  department: z.string().min(1, "Department is required"),
  role: z.enum(APP_ROLES),
  status: z.enum(["active", "inactive"]),
});

const createSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

interface FormState {
  name: string;
  loginId: string;
  phone: string;
  department: string;
  role: AppRole;
  status: UserStatus;
  password: string;
}

const emptyForm: FormState = {
  name: "",
  loginId: "",
  phone: "",
  department: DEPARTMENTS[0],
  role: "teacher",
  status: "active",
  password: "",
};

export interface UserFormSubmit {
  id?: string;
  name: string;
  loginId: string;
  phone: string;
  department: string;
  role: AppRole;
  status: UserStatus;
  password: string;
}

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  submitting?: boolean;
  onSubmit: (data: UserFormSubmit) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  submitting,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = !!user;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (user) {
        setForm({
          name: user.name,
          loginId: user.loginId,
          phone: user.phone,
          department: user.department,
          role: user.role,
          status: user.status,
          password: "",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, user]);

  const submit = () => {
    const schema = isEdit ? baseSchema : createSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    onSubmit({
      id: user?.id,
      name: form.name.trim(),
      loginId: form.loginId.trim().toLowerCase(),
      phone: form.phone.trim(),
      department: form.department,
      role: form.role,
      status: form.status,
      password: form.password,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this account."
              : "Create a new account for a teacher or staff member."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              maxLength={100}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="login-id">User ID</Label>
              <Input
                id="login-id"
                autoComplete="off"
                disabled={isEdit}
                value={form.loginId}
                maxLength={32}
                onChange={(e) => setForm({ ...form, loginId: e.target.value })}
              />
              {isEdit ? (
                <p className="text-xs text-muted-foreground">The User ID cannot be changed.</p>
              ) : null}
              {errors.loginId ? <p className="text-xs text-destructive">{errors.loginId}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                inputMode="tel"
                value={form.phone}
                maxLength={20}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department ? (
                <p className="text-xs text-destructive">{errors.department}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APP_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEdit ? null : (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="text"
                  autoComplete="new-password"
                  value={form.password}
                  maxLength={72}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Share this securely — it is the user&apos;s permanent password.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {isEdit ? "Save changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
