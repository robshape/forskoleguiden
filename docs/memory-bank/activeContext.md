# Active Context

## Current State

Steps 0–9.3 are complete. The site ships a Swedish preschool directory at `/sv/`, detail pages at `/sv/forskola/[id]/`, and a comparison page at `/sv/jamfor/` with mobile-optimized sticky-column table, accessible SVG charts with ARIA wiring, chart-adjacent data tables, legend per chart, `<noscript>` fallback, and deterministic comparison summary text rendered beneath the chart section for 2+ selected preschools. Chart pattern metadata lives in `src/lib/chart-patterns.tsx` (derived from `RESPONSE_ROWS`). Compare state is backed by `sessionStorage` via nanostores. Step 9.1 added `src/features/comparison/summary.ts`, which computes deterministic unique pairwise comparisons for Helhetsbedömning questions using the first selected survey's question set as the shared anchor and omits pairs with no matched questions. Step 9.2 added `src/features/comparison/summaryText.ts`, which formats those pair summaries into localized deterministic sentences using the locale `summary.*` templates and explicit percentage placeholders. Step 9.3 now threads `locale` into `ComparisonView`, calls the Step 9.1 and 9.2 utilities at runtime from the client-only comparison island, and renders a stable `comparison-summary` test hook only when 2 or more preschools are selected. A follow-up accessibility hardening pass added a localized summary heading and an explicit labeled `region` so the summary list is easier to discover with assistive tech. `pnpm validate` is green with 75 unit tests passing.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

1. Implement Step 10 — add visible attribution to the comparison page and verify detail-page attribution placement.

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
- Step 9.2 summary text keeps all user-facing copy in locale JSON files. Directional sentences (`higher`/`lower`) use the target preschool as the grammatical subject, while `similar` stays base-first for deterministic ordering.
- Step 9.3 summary rendering stays intentionally minimal: it flattens all formatted pair sentences into a single list below the charts and only mounts that section for 2+ selected preschools.
