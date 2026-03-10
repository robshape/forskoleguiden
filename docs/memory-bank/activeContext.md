# Active Context

## Current State

Steps 0–7.4 are complete. The site ships a Swedish preschool directory at `/sv/`, detail pages at `/sv/forskola/[id]/`, and a comparison page at `/sv/jamfor/` with a mobile-optimized sticky-column table. Compare state is backed by `sessionStorage` via nanostores, shared across all Preact islands. Husky pre-commit runs `lint-staged` + `pnpm check`. Test suite: 26 unit + 36 e2e = 62 total. `pnpm validate` is green.

For the detailed history of completed milestones, see `progress.md`.

## Next Focus

1. Implement Step 8 — accessible SVG chart rendering, legend, and chart-adjacent table fallback on the comparison page.
2. Implement Step 9 — deterministic comparison summaries and summary text rendering.

## Active Decisions

- Session-backed compare state stays in `src/lib/state.ts` and must remain safe to import during Astro SSR/prerender.
- The compare tray is `client:only="preact"` to avoid SSR/client hydration mismatches with persisted browser state.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- `ComparisonView` renders the empty state when `compareIds` becomes empty (no redirect away from `/sv/jamfor/`).
- The tray writes `--tray-height` to `documentElement` so `body` can reserve bottom space.
- The comparison view is text-only (semantic HTML table with agree-share percentages). Step 8 layers charts on top of this stable structure.
- The detail page uses a stable ordered `RESPONSE_ROWS` mapping from `src/lib/survey-responses.ts` for the five-category breakdown.
- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
