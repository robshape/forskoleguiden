# Active Context

## Current State

Steps 0–8.2 are complete. The site ships a Swedish preschool directory at `/sv/`, detail pages at `/sv/forskola/[id]/`, and a comparison page at `/sv/jamfor/` with a mobile-optimized sticky-column table plus per-question accessible SVG charts and chart-adjacent data tables. Step 8.2 refined the comparison chart palette so all five response categories now use distinct SVG encodings: solid, diagonal stripes, dots, horizontal lines, and crosshatch, and the immediate hardening follow-up made the regression selectors semantic and unified `BarChart` response/pattern metadata under `RESPONSE_SERIES`. Compare state is backed by `sessionStorage` via nanostores, shared across all Preact islands. Husky pre-commit runs `lint-staged` + `pnpm check`. Test suite: 26 unit + 41 e2e = 67 total. `pnpm validate` is green, and the focused Step 8.2 Playwright regression passes.

For the detailed history of completed milestones, see `progress.md`.

## Next Focus

1. Implement Steps 8.3–8.5 follow-up chart refinements where needed (explicit legend treatment, tighter chart/table semantics, and any additional a11y coverage).
2. Implement Step 9 — deterministic comparison summaries and summary text rendering.

## Active Decisions

- Session-backed compare state stays in `src/lib/state.ts` and must remain safe to import during Astro SSR/prerender.
- The compare tray is `client:only="preact"` to avoid SSR/client hydration mismatches with persisted browser state.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- `ComparisonView` renders the empty state when `compareIds` becomes empty (no redirect away from `/sv/jamfor/`).
- The tray writes `--tray-height` to `documentElement` so `body` can reserve bottom space.
- The comparison view now layers charts on top of the stable semantic table structure: visible question headings, pattern-filled SVG charts, and chart-adjacent data tables render together per question.
- The detail page uses a stable ordered `RESPONSE_ROWS` mapping from `src/lib/survey-responses.ts` for the five-category breakdown.
- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
