# Active Context

## Current State

Steps 0–9.1 are complete. The site ships a Swedish preschool directory at `/sv/`, detail pages at `/sv/forskola/[id]/`, and a comparison page at `/sv/jamfor/` with mobile-optimized sticky-column table, accessible SVG charts with ARIA wiring, chart-adjacent data tables, legend per chart, and `<noscript>` fallback. Chart pattern metadata lives in `src/lib/chart-patterns.tsx` (derived from `RESPONSE_ROWS`). Compare state is backed by `sessionStorage` via nanostores. Step 9.1 added `src/features/comparison/summary.ts`, which computes deterministic unique pairwise comparisons for Helhetsbedömning questions using the first selected survey's question set as the shared anchor and omits pairs with no matched questions. Test suite: 42 unit + 47 e2e = 89 total. `pnpm validate` is green.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

1. Implement Step 9.2 — deterministic comparison summary text generation.

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
