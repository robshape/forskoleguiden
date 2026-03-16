# Active Context

## Current State

Steps 0–13.2 are complete. Step 13.2 (End-to-end User Flow Test) added `tests/e2e/user-flow-phase1.spec.ts`, a single comprehensive Playwright journey that covers the full Phase 1 Malmö flow: directory load, sort toggling, real compare-button selection of 3 preschools, compare-tray navigation, 3-school comparison rendering, chart and summary assertions, comparison-page attribution, return to the directory, preschool detail navigation, and sessionStorage-backed state persistence across both comparison and detail-page round trips. `pnpm validate` is fully green: 0 lint errors, 75 unit tests, 61 Chromium e2e tests, 1 WebKit regression test, 9 post-build tests, and Lighthouse healthcheck passed.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

- Step 13 is complete.
- Next: continue with Phase 2 roadmap items — i18n EN/AR page routes, shortlist URL sharing.

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
- Step 9.2 summary text keeps all user-facing copy in locale JSON files. Directional sentences (`higher`/`lower`) use the target preschool as the grammatical subject, while `similar` stays base-first for deterministic ordering.
- Step 9.3 summary rendering stays intentionally minimal: it flattens all formatted pair sentences into a single list below the charts and only mounts that section for 2+ selected preschools.
- Step 11.2 treats keyboard coverage as an interactive-control concern only: comparison charts and the read-only comparison table remain intentionally non-tabbable and continue to be covered by semantics plus axe assertions instead of forced Tab-order tests.
- Step 11.3 Lighthouse performance threshold is advisory (warn), not a hard gate, because Lighthouse performance scores are noisy on CI runners. Accessibility score (≥0.95) is the only hard error gate.
- Step 13.2's comprehensive journey intentionally uses real UI clicks and anchor navigation rather than `sessionStorage` seeding or browser-history shortcuts so the final verification exercises the shipped Astro MPA behavior end to end.
