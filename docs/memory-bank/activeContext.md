# Active Context

## Current State

Steps 0–10 and Steps 11.1–11.2 are complete. Step 11.2 added a dedicated Playwright keyboard-navigation suite in `tests/e2e/keyboard-navigation-focus-ring.spec.ts` that covers the Swedish directory page, compare tray, and comparison page with real Tab and Enter/Space interactions, plus shared `getFocusRingContract` and `getFocusOutlineContract` helpers in `tests/e2e/fixtures.ts` so focus assertions match the app's ring-based and outline-based styling models. The step remained test-only: the existing UI already satisfied the required keyboard contracts, and `pnpm validate` is green after the new suite landed.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

1. Step 11.3 — Lighthouse verification.

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
- Step 9.2 summary text keeps all user-facing copy in locale JSON files. Directional sentences (`higher`/`lower`) use the target preschool as the grammatical subject, while `similar` stays base-first for deterministic ordering.
- Step 9.3 summary rendering stays intentionally minimal: it flattens all formatted pair sentences into a single list below the charts and only mounts that section for 2+ selected preschools.
- Step 11.2 treats keyboard coverage as an interactive-control concern only: comparison charts and the read-only comparison table remain intentionally non-tabbable and continue to be covered by semantics plus axe assertions instead of forced Tab-order tests.
