# Active Context

Step 3.4 is now complete and review-hardened: root redirect is implemented with Astro native `redirects` config (`'/'` -> `/sv/`), the temporary meta-refresh page has been removed, and redirect behavior is covered by both unit config assertions and runtime e2e redirect navigation tests.

Current state:

- Step 3.1 shell composition remains complete and test-covered by `tests/unit/sv-index-layout.test.ts`.
- Step 3.2 nav shell remains complete with locale home-linking, localized nav `aria-label`, `<ul>/<li>` city semantics, disabled Stockholm/Göteborg button semantics, static year `2025`, and locale-based language placeholder text.
- Step 3.3 footer shell is complete with visible Malmö attribution text and source link contract validation in e2e.
- Step 3.4 redirect is complete with Astro config-level redirect and deletion of temporary `src/pages/index.astro`.
- Redirect test quality is hardened: `tests/unit/root-redirect.test.ts` imports Astro config and asserts `redirects` object shape directly; `tests/e2e/smoke.spec.ts` now asserts `/` lands on `/sv/`.
- `/sv/` passes shell semantics, nav contract checks, and footer attribution/source-link checks via `tests/e2e/layout-shell.spec.ts`.
- Step 2 i18n foundation remains complete (`src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`, `src/i18n/utils.ts`).
- Step 1 data/scoring foundation remains green (`src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`).

Pending tracked tasks:

- None.

Recently completed tasks:

- `TASK001`: Step 3.1-3.3 layout shell complete (BaseLayout + Nav + Footer).
- `TASK002`: Step 3.4 root redirect complete (Astro redirects + root placeholder removal).
- Step 3.3 footer component implementation plan complete (`docs/plans/implement-step-3-3-footer-component-phase-2-complete.md`).
- `TASK006`: Step 2 i18n foundation complete.
- `TASK005`: Step 1 data layer foundations complete.

Next implementation focus: begin Step 4 directory page implementation.
