# Active Context

## Current State

Steps 0–10 and Steps 11.1–11.3 are complete. Step 11.3 added two-track Lighthouse verification: a deterministic post-build page-weight test (`tests/post-build/page-weight-budget.test.ts`) that enforces a 100 KB uncompressed budget for the `/sv/` page, and a `pnpm audit:lighthouse` command backed by `@lhci/cli` and `.lighthouserc.json` that runs an accessibility error gate (≥0.95) plus a performance advisory (≥0.9) against the preview server. Both tracks are wired into CI via `quality-gates.yml`: `pnpm test:post-build` runs after build in `pnpm validate`, and the Lighthouse audit step runs last in the shared workflow (after WebKit e2e) to avoid a port-4321 conflict with the Playwright web server. Because `@lhci/cli` pulls an older transitive `semver` path that trips `trustPolicy: no-downgrade`, `pnpm-workspace.yaml` now pins `semver` to `7.7.4` in `overrides` so clean installs remain reproducible. `pnpm validate` is green with 75 unit tests and 1 post-build test passing.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

- Steps 11.1–11.3 complete; the full Step 11 accessibility + verification milestone is now closed.
- Next: Step 12 (i18n EN/AR page routes) or other roadmap items from `docs/implementation-plan.md`.

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
- Step 9.2 summary text keeps all user-facing copy in locale JSON files. Directional sentences (`higher`/`lower`) use the target preschool as the grammatical subject, while `similar` stays base-first for deterministic ordering.
- Step 9.3 summary rendering stays intentionally minimal: it flattens all formatted pair sentences into a single list below the charts and only mounts that section for 2+ selected preschools.
- Step 11.2 treats keyboard coverage as an interactive-control concern only: comparison charts and the read-only comparison table remain intentionally non-tabbable and continue to be covered by semantics plus axe assertions instead of forced Tab-order tests.
- Step 11.3 Lighthouse performance threshold is advisory (warn), not a hard gate, because Lighthouse performance scores are noisy on CI runners. Accessibility score (≥0.95) is the only hard error gate.
