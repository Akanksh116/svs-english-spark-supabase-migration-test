import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
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

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in · SVS English Coach" },
      {
        name: "description",
        content:
          "Sign in with your staff User ID — Sri Vijaya Sai High School English coaching portal.",
      },
      { property: "og:title", content: "Sign in · SVS English Coach" },
      {
        property: "og:description",
        content: "Staff sign-in for the SVS English Coach learning portal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const loginSchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(3, "Enter your User ID")
    .max(32, "User ID is too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "User ID can only use letters, numbers, dot, dash and underscore"),
  password: z.string().min(1, "Enter your password").max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
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
      await authService.signInWithUserId({ loginId, password });
      toast.success("Welcome back!");
      const target = safeRedirect(redirect, "/dashboard");
      navigate({ to: target as "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with the User ID issued by your school administrator."
      footer={
        <>
          Are you an administrator?{" "}
          <Link to="/admin/login" className="font-medium text-primary hover:underline">
            Admin sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="loginId">User ID</Label>
          <Input
            id="loginId"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. lakshmi.devi"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Sign in
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Forgot your password? Ask your school administrator to reset it for you.
        </p>
      </form>
    </AuthLayout>
  );
}
