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
 * Pure rotation logic (exported for tests).
 * Healthy keys first, in round-robin order starting at `start`.
 * Cooled-down keys are only used when NO key is healthy, so a single request
 * still tries every key at most once and never loops.
 */
export function planRotation(
  keys: string[],
  start: number,
  cooldownUntil: Map<string, number>,
  now: number,
): string[] {
  const unique = Array.from(new Set(keys));
  if (unique.length === 0) return [];
  const offset = ((start % unique.length) + unique.length) % unique.length;
  const ordered = [...unique.slice(offset), ...unique.slice(0, offset)];
  const healthy = ordered.filter((k) => (cooldownUntil.get(k) ?? 0) <= now);
  // Last resort: every key is cooling down — try them all once anyway.
  return healthy.length > 0 ? healthy : ordered;
}

/** Ordered list of keys to try for one request. Each key appears at most once. */
export function getKeyRotation(): string[] {
  const keys = getGeminiKeys();
  if (keys.length === 0) return [];

  const s = state();
  const start = s.cursor % keys.length;
  s.cursor = (s.cursor + 1) % keys.length;

  return planRotation(keys, start, s.cooldownUntil, Date.now());
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
