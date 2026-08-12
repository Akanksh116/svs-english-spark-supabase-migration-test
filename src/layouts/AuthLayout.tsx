import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/common/Brand";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground md:flex md:flex-col md:justify-between md:p-10">
        <Link to="/">
          <Brand className="[&_span]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_.bg-primary]:bg-primary-foreground/10 [&_.text-primary-foreground]:text-primary-foreground" />
        </Link>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight">Speak English with confidence.</h2>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/80">
            A structured practice space built for Sri Vijaya Sai High School — teachers and staff
            improving spoken English with AI-guided lessons.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Sri Vijaya Sai High School
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 md:hidden">
            <Link to="/">
              <Brand />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
