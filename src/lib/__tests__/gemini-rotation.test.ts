import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyHttpStatus } from "../coach.server";
import {
  getGeminiKeys,
  getKeyRotation,
  isKeyCoolingDown,
  markKeyExhausted,
  planRotation,
  resetKeyState,
  describeKey,
} from "../gemini-keys.server";

const KEYS = ["key-aaaa", "key-bbbb", "key-cccc"];

function setEnvKeys(keys: string[]) {
  for (let i = 1; i <= 5; i++) delete process.env[`GEMINI_API_KEY_${i}`];
  delete process.env.GEMINI_API_KEY;
  keys.forEach((k, i) => (process.env[`GEMINI_API_KEY_${i + 1}`] = k));
}

beforeEach(() => {
  resetKeyState();
  setEnvKeys(KEYS);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("key configuration", () => {
  it("reads numbered keys plus fallback and de-duplicates", () => {
    setEnvKeys(["a", "b", "a"]);
    process.env.GEMINI_API_KEY = "b";
    expect(getGeminiKeys()).toEqual(["a", "b"]);
  });

  it("never exposes a full key in its description", () => {
    expect(describeKey("super-secret-key-1234")).toBe("…1234");
    expect(describeKey("super-secret-key-1234")).not.toContain("secret");
  });
});

describe("planRotation", () => {
  it("round-robins healthy keys", () => {
    const cooldowns = new Map<string, number>();
    expect(planRotation(KEYS, 0, cooldowns, 1000)).toEqual(KEYS);
    expect(planRotation(KEYS, 1, cooldowns, 1000)).toEqual([KEYS[1], KEYS[2], KEYS[0]]);
  });

  it("skips cooling keys and lists each key at most once", () => {
    const cooldowns = new Map([[KEYS[0], 5000]]);
    const plan = planRotation(KEYS, 0, cooldowns, 1000);
    expect(plan).toEqual([KEYS[1], KEYS[2]]);
    expect(new Set(plan).size).toBe(plan.length);
  });

  it("falls back to all keys once when every key is cooling", () => {
    const cooldowns = new Map(KEYS.map((k) => [k, 5000] as const));
    expect(planRotation(KEYS, 0, cooldowns, 1000)).toEqual(KEYS);
  });
});

describe("shared cooldown state", () => {
  it("persists across separate getKeyRotation calls (concurrent requests)", () => {
    markKeyExhausted(KEYS[0], 60_000);
    expect(isKeyCoolingDown(KEYS[0])).toBe(true);
    expect(getKeyRotation()).not.toContain(KEYS[0]);
    expect(getKeyRotation()).not.toContain(KEYS[0]);
  });
});

describe("classifyHttpStatus", () => {
  it("treats 503 UNAVAILABLE as retryable with a cooldown", () => {
    const r = classifyHttpStatus(503);
    expect(r.code).toBe("unavailable");
    expect(r.retryable).toBe(true);
    expect(r.cooldownMs).toBeGreaterThan(0);
  });

  it("treats 429 as retryable rate limit", () => {
    const r = classifyHttpStatus(429);
    expect(r.code).toBe("rate_limit");
    expect(r.retryable).toBe(true);
  });

  it("treats 401/403 as retryable invalid key with a long cooldown", () => {
    for (const status of [401, 403]) {
      const r = classifyHttpStatus(status);
      expect(r.code).toBe("invalid_key");
      expect(r.retryable).toBe(true);
      expect(r.cooldownMs).toBeGreaterThanOrEqual(10 * 60_000);
    }
  });

  it("does not retry client errors like 400", () => {
    expect(classifyHttpStatus(400).retryable).toBe(false);
  });

  it("never includes provider payload details in the message", () => {
    expect(classifyHttpStatus(503).message).not.toMatch(/gemini|status|json/i);
  });
});

describe("callGemini failover", () => {
  async function loadCallGemini() {
    const mod = await import("../coach.server");
    return mod;
  }

  function mockFetchSequence(statuses: Array<number | "ok">) {
    let i = 0;
    return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      const next = statuses[Math.min(i++, statuses.length - 1)];
      if (next === "ok") {
        return new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ text: "hello" }] } }] }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ error: { code: next, status: "UNAVAILABLE" } }), {
        status: next,
      });
    });
  }

  it("fails over to the next key on 503 and succeeds", async () => {
    const { callGemini } = await loadCallGemini();
    const fetchSpy = mockFetchSequence([503, "ok"]);
    const text = await callGemini({ system: "s", contents: [{ role: "user", text: "hi" }] });
    expect(text).toBe("hello");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("fails over on 429", async () => {
    const { callGemini } = await loadCallGemini();
    const fetchSpy = mockFetchSequence([429, "ok"]);
    await expect(
      callGemini({ system: "s", contents: [{ role: "user", text: "hi" }] }),
    ).resolves.toBe("hello");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("tries each key at most once and returns a clean error when all fail", async () => {
    const { callGemini } = await loadCallGemini();
    const fetchSpy = mockFetchSequence([503]);
    const err = await callGemini({
      system: "s",
      contents: [{ role: "user", text: "hi" }],
    }).catch((e: Error) => e);
    expect(fetchSpy).toHaveBeenCalledTimes(KEYS.length);
    expect((err as Error).message).toBe(
      "The AI service is temporarily unavailable. Please try again in a moment.",
    );
    for (const k of KEYS) expect((err as Error).message).not.toContain(k);
  });

  it("errors cleanly when no key is configured", async () => {
    setEnvKeys([]);
    const { callGemini } = await loadCallGemini();
    await expect(
      callGemini({ system: "s", contents: [{ role: "user", text: "hi" }] }),
    ).rejects.toThrow(/not configured/i);
  });
});
