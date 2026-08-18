import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPrimaryKey,
  planRotation,
  resetKeyState,
  getKeyRotation,
  markKeyExhausted,
} from "../gemini-keys.server";
import {
  DEFAULT_ATTEMPT_TIMEOUT_MS,
  DEFAULT_TOTAL_DEADLINE_MS,
  MIN_ATTEMPT_BUDGET_MS,
  getTimeoutBudget,
} from "../coach.server";

const PAID = "paid-key-0001";
const FREE = ["free-key-0002", "free-key-0003", "free-key-0004", "free-key-0005"];
const ALL = [PAID, ...FREE];

function setEnvKeys(keys: string[]) {
  for (let i = 1; i <= 5; i++) delete process.env[`GEMINI_API_KEY_${i}`];
  delete process.env.GEMINI_API_KEY;
  keys.forEach((k, i) => (process.env[`GEMINI_API_KEY_${i + 1}`] = k));
}

beforeEach(() => {
  resetKeyState();
  setEnvKeys(ALL);
  delete process.env.GEMINI_ATTEMPT_TIMEOUT_MS;
  delete process.env.GEMINI_TOTAL_DEADLINE_MS;
});

afterEach(() => vi.restoreAllMocks());

describe("paid key priority", () => {
  it("treats GEMINI_API_KEY_1 as the primary key", () => {
    expect(getPrimaryKey()).toBe(PAID);
  });

  it("puts the paid key first on every request while healthy", () => {
    for (let i = 0; i < 6; i++) expect(getKeyRotation()[0]).toBe(PAID);
  });

  it("spreads overflow across the free keys round-robin behind the paid key", () => {
    const cooldowns = new Map<string, number>();
    expect(planRotation(ALL, 0, cooldowns, 1000, PAID)).toEqual([PAID, ...FREE]);
    expect(planRotation(ALL, 1, cooldowns, 1000, PAID)).toEqual([
      PAID,
      FREE[1],
      FREE[2],
      FREE[3],
      FREE[0],
    ]);
  });

  it("falls back through keys 2-5 when the paid key is cooling down", () => {
    markKeyExhausted(PAID, 60_000);
    const plan = getKeyRotation();
    expect(plan).not.toContain(PAID);
    expect(new Set(plan)).toEqual(new Set(FREE));
  });

  it("recovers to the paid key once its cooldown expires", () => {
    markKeyExhausted(PAID, 1);
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 10_000);
    expect(getKeyRotation()[0]).toBe(PAID);
  });

  it("lists every key at most once", () => {
    const plan = planRotation(ALL, 2, new Map(), 1000, PAID);
    expect(plan.length).toBe(new Set(plan).size);
    expect(plan.length).toBe(ALL.length);
  });

  it("still works when only the paid key is configured", () => {
    setEnvKeys([PAID]);
    expect(getKeyRotation()).toEqual([PAID]);
  });
});

describe("timeout budget", () => {
  it("uses conservative defaults that allow at least two attempts", () => {
    const { attemptTimeoutMs, totalDeadlineMs } = getTimeoutBudget();
    expect(attemptTimeoutMs).toBe(DEFAULT_ATTEMPT_TIMEOUT_MS);
    expect(totalDeadlineMs).toBe(DEFAULT_TOTAL_DEADLINE_MS);
    expect(attemptTimeoutMs * 2).toBeLessThanOrEqual(totalDeadlineMs);
  });

  it("is overridable per environment and never exceeds the total deadline", () => {
    process.env.GEMINI_ATTEMPT_TIMEOUT_MS = "9000";
    process.env.GEMINI_TOTAL_DEADLINE_MS = "8000";
    expect(getTimeoutBudget()).toEqual({ attemptTimeoutMs: 8000, totalDeadlineMs: 8000 });
  });

  it("ignores invalid overrides", () => {
    process.env.GEMINI_TOTAL_DEADLINE_MS = "not-a-number";
    expect(getTimeoutBudget().totalDeadlineMs).toBe(DEFAULT_TOTAL_DEADLINE_MS);
  });
});

describe("timeout failover", () => {
  it("aborts a stalled key and succeeds on the next one", async () => {
    process.env.GEMINI_ATTEMPT_TIMEOUT_MS = "60";
    process.env.GEMINI_TOTAL_DEADLINE_MS = "5000";
    const { callGemini } = await import("../coach.server");

    let call = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((async (_url: unknown, init: RequestInit) => {
      call++;
      if (call === 1) {
        return await new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            const e = new Error("aborted");
            e.name = "AbortError";
            reject(e);
          });
        });
      }
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "ok-text" }] } }] }),
        { status: 200 },
      );
    }) as unknown as typeof fetch);

    await expect(
      callGemini({ system: "s", contents: [{ role: "user", text: "hi" }] }),
    ).resolves.toBe("ok-text");
    expect(call).toBe(2);
  });

  it("stops trying keys once the overall deadline is spent and returns a clean error", async () => {
    process.env.GEMINI_ATTEMPT_TIMEOUT_MS = "40";
    process.env.GEMINI_TOTAL_DEADLINE_MS = String(MIN_ATTEMPT_BUDGET_MS + 40);
    const { callGemini } = await import("../coach.server");

    let call = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((async (_url: unknown, init: RequestInit) => {
      call++;
      return await new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          const e = new Error("aborted");
          e.name = "AbortError";
          reject(e);
        });
      });
    }) as unknown as typeof fetch);

    const err = await callGemini({
      system: "s",
      contents: [{ role: "user", text: "hi" }],
    }).catch((e: Error) => e);

    expect((err as Error).message).toBe(
      "The AI service is temporarily unavailable. Please try again in a moment.",
    );
    // Did not burn one attempt per key: the deadline stopped it early.
    expect(call).toBeLessThan(ALL.length);
    for (const k of ALL) expect((err as Error).message).not.toContain(k);
  });
});

describe("concurrent rotation state", () => {
  it("shares cooldowns across concurrent requests instead of resetting per call", () => {
    markKeyExhausted(PAID, 60_000);
    // Two "requests" interleaved: neither may resurrect the cooling paid key.
    const a = getKeyRotation();
    const b = getKeyRotation();
    expect(a).not.toContain(PAID);
    expect(b).not.toContain(PAID);
  });

  it("never returns a key twice within one request, whatever the cursor is", () => {
    for (let i = 0; i < 20; i++) {
      const plan = getKeyRotation();
      expect(new Set(plan).size).toBe(plan.length);
    }
  });

  it("keeps every configured key reachable as the cursor advances", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) for (const k of getKeyRotation()) seen.add(k);
    expect([...seen].sort()).toEqual([...ALL].sort());
  });

  it("falls back to trying every key once when all of them are cooling down", () => {
    for (const k of ALL) markKeyExhausted(k, 60_000);
    const plan = getKeyRotation();
    expect(new Set(plan).size).toBe(ALL.length);
    expect(plan[0]).toBe(PAID);
  });
});

describe("network error failover", () => {
  it("tries the next key when a key hits a transient network error", async () => {
    const { callGemini } = await import("../coach.server");
    const seen: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation((async (_url, init) => {
      const key = new Headers((init as RequestInit).headers).get("x-goog-api-key")!;
      seen.push(key);
      if (seen.length === 1) throw new TypeError("fetch failed");
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "ok" }] } }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch);

    await expect(callGemini({ system: "s", contents: [] })).resolves.toBe("ok");
    expect(seen).toHaveLength(2);
    expect(seen[0]).toBe(PAID);
    expect(seen[1]).not.toBe(PAID);
  });

  it("cools the failed key down so the next request skips it", async () => {
    const { callGemini } = await import("../coach.server");
    vi.spyOn(globalThis, "fetch").mockImplementation((async (_url, init) => {
      const key = new Headers((init as RequestInit).headers).get("x-goog-api-key")!;
      if (key === PAID) throw new TypeError("fetch failed");
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: "ok" }] } }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch);

    await callGemini({ system: "s", contents: [] });
    expect(getKeyRotation()).not.toContain(PAID);
  });

  it("returns one clean generic error when every key fails with a network error", async () => {
    const { callGemini } = await import("../coach.server");
    let calls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((async () => {
      calls++;
      throw new TypeError("fetch failed: ECONNREFUSED 142.250.1.1:443");
    }) as typeof fetch);

    await expect(callGemini({ system: "s", contents: [] })).rejects.toThrow(
      /temporarily unavailable/i,
    );
    // Exactly one attempt per configured key, no provider detail leaked.
    expect(calls).toBe(ALL.length);
  });
});
