import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { safeRedirect } from "@/lib/safe-redirect";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/admin/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Administrator sign in · SVS English Coach" },
      {
        name: "description",
        content: "Restricted administrator sign-in for SVS English Coach.",
      },
      { property: "og:title", content: "Administrator sign in · SVS English Coach" },
      {
        property: "og:description",
        content: "Restricted administrator access for Sri Vijaya Sai High School.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLoginPage,
});

const loginSchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(3, "Enter your administrator User ID")
    .max(32, "User ID is too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "User ID can only use letters, numbers, dot, dash and underscore"),
  password: z.string().min(1, "Enter your password").max(72),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/admin/login" });
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ loginId, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const { user } = await authService.signInWithUserId({ loginId, password });
      if (!user) throw new Error("Sign-in failed");

      const isAdmin = await authService.isAdmin(user.id);
      if (!isAdmin) {
        // Keep the session — this is a valid staff account, just not an admin.
        toast.error("This account does not have administrator access.");
        navigate({ to: "/dashboard" });
        return;
      }

      toast.success("Welcome, administrator.");
      const target = safeRedirect(redirect, "/admin/dashboard");
      navigate({ to: target as "/admin/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Administrator sign in"
      subtitle="Restricted access — administrators only."
      footer={
        <>
          Not an administrator?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Staff sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="admin-login-id">Administrator User ID</Label>
          <Input
            id="admin-login-id"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="admin"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" /> Sign in as administrator
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
