# Active Context

## Current State

Steps 0–8.4 are complete. The site ships a Swedish preschool directory at `/sv/`, detail pages at `/sv/forskola/[id]/`, and a comparison page at `/sv/jamfor/` with a mobile-optimized sticky-column table plus per-question accessible SVG charts, chart-adjacent data tables, a visible legend per chart, and a static `<noscript>` fallback directing users to individual preschool detail pages when JavaScript is unavailable. Step 8.2 refined the comparison chart palette so all five response categories use distinct SVG encodings (solid, diagonal stripes, dots, horizontal lines, and crosshatch), Step 8.3 added an inline legend beneath each chart so every swatch is labelled, and Step 8.4 added the no-JS static fallback and deterministic chart-adjacent table `id` attributes for Step 8.5 `aria-describedby` wiring. The Step 8.2 hardening follow-up unified `BarChart` response/pattern metadata under `RESPONSE_SERIES`, and the Step 8.3 hardening follow-up extracted a shared `renderPatternContent` helper so chart and legend patterns can never drift structurally. Compare state is backed by `sessionStorage` via nanostores, shared across all Preact islands. Husky pre-commit runs `lint-staged` + `pnpm check`. Test suite: 26 unit + 44 e2e = 70 total. `pnpm validate` is green.

For the detailed history of completed milestones, see `progress.md`.

## Next Focus

1. Implement Step 8.5 — wire `aria-describedby` from each SVG chart to its chart-adjacent data table using the deterministic table `id` attributes added in Step 8.4.
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
- Each chart-adjacent data table in `BarChart.tsx` now carries a deterministic `id` derived from the chart index so Step 8.5 can attach `aria-describedby` without further structural changes.
