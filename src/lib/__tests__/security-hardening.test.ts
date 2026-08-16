/**
 * Security regression tests for the four launch blockers:
 * temp reset route removal, coach auth + rate limiting, inactive-user auth
 * blocking, and server-authoritative stats/scores.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, beforeEach } from "vitest";
import {
  consumeRateLimit,
  resetRateLimits,
  COACH_REPLY_LIMIT,
  COACH_EVALUATE_LIMIT,
} from "../rate-limit.server";
import { computeSessionUpdate, EMPTY_STATS } from "../practice-scoring";

const root = resolve(__dirname, "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("temporary admin reset endpoint", () => {
  it("no longer exists as a route file", () => {
    expect(existsSync(resolve(root, "src/routes/api/public/temp-admin-reset.ts"))).toBe(false);
  });

  it("leaves no references to its secrets in source", () => {
    const files = [
      "src/services/users.server.ts",
      "src/services/users.functions.ts",
      "src/start.ts",
    ];
    for (const f of files) {
      expect(read(f)).not.toContain("TEMP_ADMIN_RESET");
    }
  });

  it("keeps the normal admin password flow", () => {
    expect(read("src/services/users.functions.ts")).toContain("adminSetStaffPassword");
    expect(read("src/services/users.server.ts")).toContain("setStaffPassword");
  });
});

describe("coach endpoints", () => {
  const src = read("src/lib/coach.functions.ts");

  it("requires authentication before Gemini is reachable", () => {
    expect(src).toContain('import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware"');
    const guarded = src.match(/\.middleware\(\[requireSupabaseAuth\]\)/g) ?? [];
    expect(guarded.length).toBe(2);
    // Both server fns declare the middleware immediately after createServerFn.
    expect(src).toMatch(/coachReply = createServerFn\([^)]*\)\s*\n\s*\.middleware\(\[requireSupabaseAuth\]\)/);
    expect(src).toMatch(/coachEvaluate = createServerFn\([^)]*\)\s*\n\s*\.middleware\(\[requireSupabaseAuth\]\)/);
  });

  it("rate-limits per authenticated user id, not per browser", () => {
    expect(src).toContain("consumeRateLimit(");
    expect(src).toContain("`coach-reply:${context.userId}`");
    expect(src).toContain("`coach-evaluate:${context.userId}`");
  });

  it("never returns raw provider payloads or keys", () => {
    expect(src).not.toContain("GEMINI_API_KEY");
    expect(src).not.toContain("apiKey");
  });
});

describe("rate limiter", () => {
  beforeEach(() => resetRateLimits());

  it("allows calls up to the limit and blocks the next one", () => {
    for (let i = 0; i < COACH_EVALUATE_LIMIT.limit; i += 1) {
      expect(consumeRateLimit("u1", COACH_EVALUATE_LIMIT.limit, COACH_EVALUATE_LIMIT.windowMs).allowed).toBe(true);
    }
    const blocked = consumeRateLimit("u1", COACH_EVALUATE_LIMIT.limit, COACH_EVALUATE_LIMIT.windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("isolates users from each other", () => {
    for (let i = 0; i < COACH_REPLY_LIMIT.limit; i += 1) {
      consumeRateLimit("a", COACH_REPLY_LIMIT.limit, COACH_REPLY_LIMIT.windowMs);
    }
    expect(consumeRateLimit("a", COACH_REPLY_LIMIT.limit, COACH_REPLY_LIMIT.windowMs).allowed).toBe(false);
    expect(consumeRateLimit("b", COACH_REPLY_LIMIT.limit, COACH_REPLY_LIMIT.windowMs).allowed).toBe(true);
  });

  it("recovers after the window elapses", () => {
    const now = Date.now();
    for (let i = 0; i < 3; i += 1) consumeRateLimit("w", 3, 1000, now);
    expect(consumeRateLimit("w", 3, 1000, now).allowed).toBe(false);
    expect(consumeRateLimit("w", 3, 1000, now + 1500).allowed).toBe(true);
  });

  it("shares state across imports within the server instance", () => {
    consumeRateLimit("shared", 1, 60_000);
    expect(consumeRateLimit("shared", 1, 60_000).allowed).toBe(false);
  });
});

describe("inactive user auth blocking", () => {
  const src = read("src/services/users.server.ts");

  it("bans the auth user when a teacher is deactivated", () => {
    expect(src).toContain("ban_duration");
    expect(src).toContain("applyAuthStatus");
    expect(src).toMatch(/setStaffStatus[\s\S]*applyAuthStatus\(id, status\)/);
  });

  it("lifts the ban when reactivated", () => {
    expect(src).toContain('active ? "none"');
  });

  it("still revokes existing sessions", () => {
    expect(src).toContain('signOut(id, "global")');
  });
});

describe("stats and scores are server-authoritative", () => {
  it("the browser module no longer writes stats, sessions or achievements", () => {
    const src = read("src/lib/practice-progress.ts");
    expect(src).not.toContain("recordPracticeSession");
    expect(src).not.toContain(".upsert(");
    expect(src).not.toContain(".insert(");
  });

  it("persistence lives in a server-only module using the admin client", () => {
    const src = read("src/services/practice.server.ts");
    expect(src).toContain("supabaseAdmin");
    expect(src).toContain("persistCompletedSession");
  });

  it("evaluation persists with the authenticated user id and server scores", () => {
    const src = read("src/lib/coach.functions.ts");
    expect(src).toContain("persistCompletedSession(context.userId");
    expect(src).toContain("overall: evaluation.overall");
  });

  it("revokes client write privileges in SQL", () => {
    const sql = read("supabase/migration-export/04_security_lockdown.sql");
    expect(sql).toContain("REVOKE INSERT, UPDATE, DELETE ON public.user_stats FROM authenticated");
    expect(sql).toContain(
      "REVOKE INSERT, UPDATE, DELETE ON public.practice_sessions FROM authenticated",
    );
    expect(sql).toContain('DROP POLICY IF EXISTS "Users update own stats" ON public.user_stats');
  });

  it("derives xp, streak and achievements from the stored session", () => {
    const { stats, newAchievements } = computeSessionUpdate(EMPTY_STATS, {
      modeTitle: "Classroom",
      durationMinutes: 5,
      messages: 4,
      overall: 90,
      grammar: 90,
      vocabulary: 90,
      fluency: 90,
      confidence: 80,
      finishedAt: new Date().toISOString(),
    });
    expect(stats.xp).toBe(20 + 25 + 9);
    expect(stats.practiceMinutes).toBe(5);
    expect(stats.conversationCount).toBe(1);
    expect(stats.dailyStreak).toBe(1);
    expect(newAchievements).toContain("first-conversation");
    expect(newAchievements).toContain("grammar-star");
  });
});
