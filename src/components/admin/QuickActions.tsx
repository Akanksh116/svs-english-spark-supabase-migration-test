import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { UserPlus, PlusCircle, Megaphone, BarChart3, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Action {
  label: string;
  description: string;
  icon: LucideIcon;
  to: string;
}

const actions: Action[] = [
  {
    label: "Add User",
    description: "Onboard teachers & staff",
    icon: UserPlus,
    to: "/admin/users",
  },
  {
    label: "Create Challenge",
    description: "Design a new daily practice",
    icon: PlusCircle,
    to: "/admin/challenges",
  },
  {
    label: "Send Announcement",
    description: "Notify the whole school",
    icon: Megaphone,
    to: "/admin/announcements",
  },
  {
    label: "View Reports",
    description: "Explore engagement metrics",
    icon: BarChart3,
    to: "/admin/analytics",
  },
  {
    label: "Manage Vocabulary",
    description: "Curate the word library",
    icon: BookOpen,
    to: "/admin/challenges",
  },
];

export function QuickActions() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((a) => (
          <Link key={a.label} to={a.to} className="group">
            <Card className="h-full shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <a.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
