import { defineNitroConfig } from "nitro/config";

/**
 * Deployment configuration.
 *
 * The preset is NOT set here on purpose:
 * - Inside the Lovable sandbox the Lovable vite plugin forces `cloudflare-module`.
 * - On Vercel, nitro auto-detects the `vercel` preset from the VERCEL build
 *   environment and emits `.vercel/output` (Build Output API) with a Node
 *   serverless function. The `vercel` block below only applies there.
 */
export default defineNitroConfig({
  vercel: {
    functions: {
      /**
       * Vercel's default serverless duration is much shorter than one Gemini
       * call plus key failover, which would kill the function before the
       * fallback key is tried.
       *
       * `"max"` asks Vercel for the highest duration the current plan allows,
       * instead of hard-coding a number that a Hobby deployment could reject.
       * The application budget (12s per Gemini attempt, 25s total per request —
       * both overridable via GEMINI_ATTEMPT_TIMEOUT_MS / GEMINI_TOTAL_DEADLINE_MS)
       * must stay below whatever this resolves to.
       */
      maxDuration: "max",
    },
  },
});
