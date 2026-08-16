/**
 * Minimal server-side sliding-window rate limiter.
 *
 * Server-only. State lives on `globalThis` so it is shared by every request
 * handled by the same server instance/isolate (the same approach the Gemini
 * key cooldowns use).
 *
 * DEPLOYMENT SCOPE: this is per-instance, not a durable global store. On a
 * multi-instance/serverless deployment each instance keeps its own counters,
 * so the effective limit is `limit x instances`. That is intentional and
 * sufficient for an ~80-user single-school deployment: it stops a single
 * client from hammering the AI endpoints without adding infrastructure.
 */

type Buckets = Map<string, number[]>;

const STATE_KEY = "__svsRateLimitState__";

function buckets(): Buckets {
  const g = globalThis as unknown as Record<string, Buckets | undefined>;
  if (!g[STATE_KEY]) g[STATE_KEY] = new Map();
  return g[STATE_KEY]!;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Consume one token for `key`. Returns whether the call is allowed.
 * `windowMs` is the sliding window, `limit` the max calls inside it.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const map = buckets();
  const cutoff = now - windowMs;
  const hits = (map.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    map.set(key, hits);
    const oldest = hits[0]!;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  map.set(key, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (map.size > 500) {
    for (const [k, v] of map) {
      if (v.every((t) => t <= cutoff)) map.delete(k);
    }
  }

  return { allowed: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

/** Test helper: clears all counters. */
export function resetRateLimits(): void {
  buckets().clear();
}

/** Per-user limits for the AI coach endpoints. */
export const COACH_REPLY_LIMIT = { limit: 40, windowMs: 60_000 };
export const COACH_EVALUATE_LIMIT = { limit: 10, windowMs: 60_000 };
