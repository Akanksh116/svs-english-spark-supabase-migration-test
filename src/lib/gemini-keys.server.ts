/**
 * Gemini API key manager.
 * Server-only: never import from client code.
 *
 * Reads up to 5 project keys (GEMINI_API_KEY_1 .. GEMINI_API_KEY_5) and falls
 * back to the single GEMINI_API_KEY. Requests are spread across the available
 * keys round-robin, and a key that hits a quota/auth/overload failure is cooled
 * down so the next request skips it automatically.
 *
 * State (cursor + cooldowns) lives on globalThis so every module instance in
 * the same server isolate shares it. That keeps cooldowns effective across
 * concurrent requests instead of resetting per request.
 */

const COOLDOWN_MS = 60_000;

type KeyState = { cursor: number; cooldownUntil: Map<string, number> };

const STATE_KEY = "__svsGeminiKeyState__";

function state(): KeyState {
  const g = globalThis as unknown as Record<string, KeyState | undefined>;
  if (!g[STATE_KEY]) {
    g[STATE_KEY] = { cursor: 0, cooldownUntil: new Map() };
  }
  return g[STATE_KEY]!;
}

export function getGeminiKeys(): string[] {
  const numbered = [1, 2, 3, 4, 5]
    .map((i) => process.env[`GEMINI_API_KEY_${i}`])
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());

  const single = process.env.GEMINI_API_KEY?.trim();
  const all = single ? [...numbered, single] : numbered;

  // De-duplicate in case the same key is configured twice.
  return Array.from(new Set(all));
}

/**
 * The preferred ("paid") key. GEMINI_API_KEY_1 is the paid Gemini project;
 * keys 2..5 and the bare GEMINI_API_KEY fallback are overflow/failover.
 * Returns undefined when no key is configured.
 */
export function getPrimaryKey(): string | undefined {
  const explicit = process.env.GEMINI_API_KEY_1?.trim();
  if (explicit) return explicit;
  return getGeminiKeys()[0];
}

/**
 * Pure rotation logic (exported for tests).
 *
 * Ordering rules:
 * 1. If `primary` is configured and healthy it is tried FIRST on every request
 *    (the paid project absorbs normal traffic).
 * 2. Remaining keys follow in round-robin order starting at `start`, so
 *    overflow traffic spreads across the free projects.
 * 3. Cooled-down keys are only used when NO key is healthy, so a single request
 *    still tries every key at most once and never loops.
 */
export function planRotation(
  keys: string[],
  start: number,
  cooldownUntil: Map<string, number>,
  now: number,
  primary?: string,
): string[] {
  const unique = Array.from(new Set(keys));
  if (unique.length === 0) return [];

  const rest = primary ? unique.filter((k) => k !== primary) : unique;
  const base = rest.length > 0 ? rest : unique;
  const offset = ((start % base.length) + base.length) % base.length;
  const rotated = [...base.slice(offset), ...base.slice(0, offset)];

  const hasPrimary = Boolean(primary) && unique.includes(primary!);
  const ordered = hasPrimary && rest.length > 0 ? [primary!, ...rotated] : rotated;

  const isHealthy = (k: string) => (cooldownUntil.get(k) ?? 0) <= now;
  const healthy = ordered.filter(isHealthy);
  if (healthy.length === 0) {
    // Last resort: every key is cooling down — try them all once anyway.
    return ordered;
  }
  // Keep cooled keys out of the plan, but preserve primary-first ordering.
  return healthy;
}

/** Ordered list of keys to try for one request. Each key appears at most once. */
export function getKeyRotation(): string[] {
  const keys = getGeminiKeys();
  if (keys.length === 0) return [];

  const s = state();
  const start = s.cursor;
  s.cursor = (s.cursor + 1) % Math.max(1, keys.length);

  return planRotation(keys, start, s.cooldownUntil, Date.now(), getPrimaryKey());
}

export function markKeyExhausted(key: string, ms = COOLDOWN_MS) {
  state().cooldownUntil.set(key, Date.now() + ms);
}

export function markKeyHealthy(key: string) {
  state().cooldownUntil.delete(key);
}

export function isKeyCoolingDown(key: string) {
  return (state().cooldownUntil.get(key) ?? 0) > Date.now();
}

/** Test helper: reset shared rotation state. */
export function resetKeyState() {
  const s = state();
  s.cursor = 0;
  s.cooldownUntil.clear();
}

/** Never log or return a full key — only a short, non-reversible hint. */
export function describeKey(key: string) {
  return `…${key.slice(-4)}`;
}
