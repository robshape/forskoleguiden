# Active Context

## Current State

Steps 0–10 and Step 11.1 are complete. Step 10 (10.1–10.3) required no code changes — the shared `Footer.astro` component (included in `BaseLayout.astro` on every page) already renders the `attribution.text` locale key with a link to `MALMO_SOURCE_URL` in static Astro HTML. Step 11.1 added a dedicated Playwright axe-core route audit in `tests/e2e/accessibility-axe-core.spec.ts` covering `/sv/`, `/sv/forskola/almgardens-forskola/`, and `/sv/jamfor/` with a seeded 2-school comparison state and hydration guards around client-rendered UI. `pnpm validate` is green with 75 unit tests passing.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

1. Step 11.2 — keyboard navigation audit.
2. Step 11.3 — Lighthouse verification.

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
- Step 9.2 summary text keeps all user-facing copy in locale JSON files. Directional sentences (`higher`/`lower`) use the target preschool as the grammatical subject, while `similar` stays base-first for deterministic ordering.
- Step 9.3 summary rendering stays intentionally minimal: it flattens all formatted pair sentences into a single list below the charts and only mounts that section for 2+ selected preschools.
