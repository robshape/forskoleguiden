# Active Context

## Current State

Steps 0–12 are complete. Step 12 (Build and Deploy Pipeline) was already satisfied by the CI/CD workflows built incrementally during earlier steps: `deploy.yml` (push-to-main deploy via GitHub Pages), `quality-gates.yml` (shared reusable pipeline: lint, check, test, build, e2e, Lighthouse), and `dependabot.yml` (PR quality gates + auto-merge for Dependabot). No new code was needed — the existing three-workflow architecture exceeds the original Step 12 requirements. `pnpm validate` is green with 75 unit tests and 1 post-build test passing.

For detailed milestone history, see `progress.md`. For settled architectural patterns, see `systemPatterns.md`.

## Next Focus

- Steps 0–12 complete; the Phase 1 implementation plan is fully delivered through the Build and Deploy Pipeline milestone.
- Next: Step 13 (Final Verification) or Phase 2 roadmap items (i18n EN/AR page routes, shortlist sharing).

## Active Decisions

- Plan files for future steps should produce only 2 files (plan + complete), not 5. Phase checkpoints go inline in the plan file.
- The tray is count-based only; selected preschool names and pluralization refinements are out of scope until a later UX pass.
- Step 9.1 summary data is emitted as unique pairwise combinations with one directional classification per pair/question; the compared question set is always anchored to the first selected survey, and pairs with zero matched questions are omitted entirely.
- Step 9.2 summary text keeps all user-facing copy in locale JSON files. Directional sentences (`higher`/`lower`) use the target preschool as the grammatical subject, while `similar` stays base-first for deterministic ordering.
- Step 9.3 summary rendering stays intentionally minimal: it flattens all formatted pair sentences into a single list below the charts and only mounts that section for 2+ selected preschools.
- Step 11.2 treats keyboard coverage as an interactive-control concern only: comparison charts and the read-only comparison table remain intentionally non-tabbable and continue to be covered by semantics plus axe assertions instead of forced Tab-order tests.
- Step 11.3 Lighthouse performance threshold is advisory (warn), not a hard gate, because Lighthouse performance scores are noisy on CI runners. Accessibility score (≥0.95) is the only hard error gate.
