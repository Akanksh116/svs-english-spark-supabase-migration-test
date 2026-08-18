// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    // Inside the Lovable sandbox the plugin forces the cloudflare-module preset
    // and ignores everything below. On Vercel, nitro auto-detects the `vercel`
    // preset from the VERCEL build env and emits `.vercel/output` (Build Output
    // API) with a Node serverless function — so the settings below apply there.
    vercel: {
      functions: {
        // Vercel's default serverless duration is far shorter than one Gemini
        // call plus failover. `"max"` asks Vercel for the maximum duration the
        // current plan allows instead of hard-coding a number that could be
        // rejected on Hobby. Our budget (12s per attempt / 25s total, both
        // overridable via GEMINI_ATTEMPT_TIMEOUT_MS / GEMINI_TOTAL_DEADLINE_MS)
        // must stay below whatever this resolves to.
        maxDuration: "max",
      },
    },
  },
});

