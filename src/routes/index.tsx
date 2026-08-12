import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Mic, Sparkles, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/common/Brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SVS English Coach — Speak English with confidence" },
      {
        name: "description",
        content:
          "AI-guided English speaking practice built for teachers and staff at Sri Vijaya Sai High School.",
      },
      { property: "og:title", content: "SVS English Coach" },
      {
        property: "og:description",
        content: "AI-guided English speaking practice for Sri Vijaya Sai High School.",
      },
    ],
  }),
  component: Landing,
});

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Mic;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Brand />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/login">Admin</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/login">
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-8 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Built for Sri Vijaya Sai High School
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
            Speak English with <span className="text-primary">confidence.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            SVS English Coach helps teachers and school staff practice spoken English every day with
            structured lessons, AI feedback, and progress tracking — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Start practicing <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/admin/login">Admin sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Feature icon={Mic} title="Guided practice">
            Short daily sessions to build fluency, pronunciation, and confidence.
          </Feature>
          <Feature icon={LineChart} title="Track progress">
            See your growth week by week — never wonder if you're improving.
          </Feature>
          <Feature icon={GraduationCap} title="For educators">
            Content shaped for classroom staff, tuned to school needs.
          </Feature>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Private to SVS High School staff — invite-only access.
        </div>
      </section>

      <footer className="border-t bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <span>© {new Date().getFullYear()} Sri Vijaya Sai High School</span>
          <span>SVS English Coach · v0.1 Foundation</span>
        </div>
      </footer>
    </div>
  );
}
