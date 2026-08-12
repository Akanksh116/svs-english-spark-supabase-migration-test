## SVS English Coach — Foundation & Architecture

Scaffold a production-ready base for a two-portal app (User + Admin) with routing, layouts, auth wiring, design system, and reusable components. No business logic, no DB tables, no AI.

### Stack note (important)
This Lovable project uses **TanStack Start + TanStack Router** (file-based routing) and **Lovable Cloud** (managed Supabase) — not React Router / vanilla Vite. I'll deliver the same architecture you asked for using these equivalents:
- Routing: TanStack Router file routes under `src/routes/` (React Router is not supported on this stack).
- Backend: Lovable Cloud (Supabase under the hood) — I'll enable it so `@/integrations/supabase/client` is ready.
- Everything else (React, TS, Vite, Tailwind, shadcn/ui, React Query, Lucide) is already in place.

### 1. Design system (`src/styles.css`)
- Primary: Blue `#2563EB` (oklch equivalent), Accent: Emerald green, Background: light gray, Card: white with soft shadow.
- Update semantic tokens for light + dark, add `--shadow-soft`, `--radius` tuned for rounded cards/buttons.
- Load Inter via `<link>` in `__root.tsx` head; set `--font-sans`.
- Update `__root.tsx` head metadata: title "SVS English Coach", school-specific description, og/twitter tags.

### 2. Folder structure
```text
src/
  routes/                 (TanStack file routes — see §3)
  components/
    ui/                   (existing shadcn primitives)
    common/               PageContainer, LoadingScreen, EmptyState,
                          SearchBox, Breadcrumb, StatCard, DashboardCard,
                          ChartCard, ProfileCard, ConfirmDialog
  layouts/                UserLayout, AdminLayout, AuthLayout
  contexts/               AuthContext (Supabase session)
  hooks/                  useAuth, use-mobile (existing)
  services/               auth.service.ts (thin wrapper over supabase.auth)
  lib/                    utils, supabase re-export
  types/                  auth.ts, common.ts
  utils/                  formatters, guards
  assets/                 logo placeholder
```

### 3. Routes (file-based, TanStack)
Public:
- `src/routes/index.tsx` — landing (replaces placeholder) with hero + CTA to `/login`.
- `src/routes/login.tsx` — placeholder "Coming soon" auth screen (no functional UI yet, per spec).
- `src/routes/admin.login.tsx` — admin login placeholder.

User portal (gated) under `src/routes/_authenticated/`:
- `route.tsx` — integration-managed gate (redirects to `/login`), wraps `UserLayout`.
- `dashboard.tsx`, `profile.tsx`, `practice.tsx`, `progress.tsx`, `vocabulary.tsx`, `achievements.tsx`, `settings.tsx`.

Admin portal (gated) under `src/routes/_admin/`:
- `route.tsx` — gate: requires session (role check stubbed; TODO comment for future `user_roles`), wraps `AdminLayout`.
- `admin.dashboard.tsx`, `admin.users.tsx`, `admin.challenges.tsx`, `admin.analytics.tsx`, `admin.announcements.tsx`, `admin.settings.tsx`.

Every gated page uses a shared `<PlaceholderPage title description />` component: title, description, "Coming soon" badge, consistent layout.

### 4. Layouts
- **UserLayout**: shadcn `Sidebar` (collapsible icon) with Lucide icons for Dashboard/Practice/Progress/Vocabulary/Achievements/Profile/Settings + topbar with `SidebarTrigger`, avatar menu (sign-out stub), school name/logo.
- **AdminLayout**: separate sidebar (Dashboard/Users/Challenges/Analytics/Announcements/Settings), visually distinct topbar accent to signal admin context.
- **AuthLayout**: centered card layout for `/login` and `/admin/login`.

Active-link highlighting via `useRouterState`. Fully responsive (mobile drawer via shadcn sidebar).

### 5. Authentication architecture
- Enable Lovable Cloud (provisions Supabase, generates `@/integrations/supabase/client` + `_authenticated/route.tsx` gate + bearer middleware in `src/start.ts`).
- `AuthContext` exposes `{ session, user, loading, signOut }`, subscribed once via `onAuthStateChange` (filtered to identity events) in `__root.tsx`.
- Protected route gates redirect unauthenticated users to `/login` (user) or `/admin/login` (admin).
- No login form UI implemented — just architecture, per spec.

### 6. Reusable components (stubs, styled, typed)
`PageContainer`, `PageHeader` (title + description + breadcrumb slot), `StatCard`, `DashboardCard`, `ChartCard` (empty state), `LoadingScreen`, `EmptyState`, `SearchBox`, `ConfirmDialog`, `Breadcrumb`, `Avatar` (shadcn), `ProfileCard`, `NotificationToast` (via existing `sonner`), `Modal` (shadcn Dialog wrapper).

### 7. What I will NOT do (per your spec)
- No DB tables, no RLS, no migrations.
- No AI, no chat, no practice engine.
- No dashboard content or charts with real data.
- No login form UI (architecture only).

### Deliverable
A polished, navigable shell: visit `/` → CTA → placeholder login → (once auth is wired later) portal shells with sidebars and "Coming soon" pages that look production-ready and share one design system.
