/**
 * Validate a `redirect` search param before navigating to it.
 * Only allows same-origin, absolute-path URLs (e.g. "/dashboard").
 * Rejects protocol-relative ("//evil.com"), backslash tricks, and
 * absolute URLs (http://...). Returns `fallback` when unsafe.
 */
export function safeRedirect(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.length === 0) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
