/**
 * Gemini API key manager.
 * Server-only: never import from client code.
 *
 * Reads up to 5 project keys (GEMINI_API_KEY_1 .. GEMINI_API_KEY_5) and falls
 * back to the single GEMINI_API_KEY. Requests are spread across the available
 * keys round-robin, and a key that hits a quota/auth failure is cooled down so
 * the next request skips it automatically.
 */

const COOLDOWN_MS = 60_000;

let cursor = 0;
const cooldownUntil = new Map<string, number>();

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
 * Ordered list of keys to try for one request: healthy keys first (round-robin),
 * then cooled-down keys as a last resort.
 */
export function getKeyRotation(): string[] {
  const keys = getGeminiKeys();
  if (keys.length === 0) return [];

  const start = cursor % keys.length;
  cursor = (cursor + 1) % keys.length;

  const ordered = [...keys.slice(start), ...keys.slice(0, start)];
  const now = Date.now();
  const healthy = ordered.filter((k) => (cooldownUntil.get(k) ?? 0) <= now);
  const cooling = ordered.filter((k) => (cooldownUntil.get(k) ?? 0) > now);
  return [...healthy, ...cooling];
}

export function markKeyExhausted(key: string, ms = COOLDOWN_MS) {
  cooldownUntil.set(key, Date.now() + ms);
}

export function markKeyHealthy(key: string) {
  cooldownUntil.delete(key);
}

export function describeKey(key: string) {
  return `…${key.slice(-4)}`;
}
