# Plan: Render Comparison Summary Text

Step 9.3 can stay narrow because the deterministic logic already exists in `src/features/comparison/summary.ts` and `src/features/comparison/summaryText.ts`. The remaining work is to connect that logic to the runtime-selected surveys inside `src/components/preact/ComparisonView.tsx`, pass the locale from `src/pages/sv/jamfor/index.astro`, and add an end-to-end contract proving the rendered text appears only in the right comparison states.

## Phases

1. **Phase 1: Add Failing Summary Rendering Contract**
   - **Objective**: Prove the comparison page is missing Step 9.3 by adding a failing e2e test first.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: renders deterministic summary text for a higher/lower comparison; does not render summary text for a single selected preschool
   - **Steps**:
     1. Extend the existing comparison route spec with a seeded selected-state that should produce visible summary text.
     2. Assert the rendered sentence contains both preschool names and the expected Swedish classification language.
     3. Run the targeted e2e test to confirm it fails before implementation.

2. **Phase 2: Wire Summary Logic Into ComparisonView**
   - **Objective**: Render deterministic summary sentences for 2+ selected preschools without affecting empty or single-selection states.
   - **Files/Functions to Modify/Create**: `src/components/preact/ComparisonView.tsx`, `src/pages/sv/jamfor/index.astro`
   - **Tests to Write**: satisfy the failing e2e contract from Phase 1
   - **Steps**:
     1. Pass the locale into the client-only comparison island from the Astro route.
     2. Inside the island, build the selected-school name map, compute the comparison summary, and format it into localized sentences.
     3. Render the sentences below the chart and table area only when 2 or more surveys are selected, preserving the existing empty and single-selection flows.
     4. Run the targeted e2e test again and get it green.

3. **Phase 3: Validate and Harden**
   - **Objective**: Confirm the feature integrates cleanly with the existing comparison experience and repo standards.
   - **Files/Functions to Modify/Create**: only if required by validation fallout
   - **Tests to Write**: none unless validation exposes a regression
   - **Steps**:
     1. Run targeted unit and e2e coverage around comparison summaries.
     2. Run `pnpm validate` as required by the repo instructions.
     3. If validation reveals regressions, make the smallest corrective patch and re-run validation.

## Open Questions

1. Summary section heading: keep scope tight and render just the sentences, or add a localized summary heading that would require new i18n keys in `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`? Recommendation: skip the heading for this step unless explicitly requested.

## Phase Checkpoints

- **Phase 1 complete (2026-03-15)**: Added a red-state Playwright contract in `tests/e2e/comparison-page-route-shell.spec.ts` that proves multi-preschool summary text was missing, while locking in the one-preschool no-summary behavior.
- **Phase 2 complete (2026-03-15)**: Wired `computeSummary()` and `formatSummaryText()` into `src/components/preact/ComparisonView.tsx`, passed `locale` from `src/pages/sv/jamfor/index.astro`, and rendered a `data-testid="comparison-summary"` list only for 2+ selected preschools.
- **Phase 3 complete (2026-03-15)**: Ran `pnpm validate` successfully after the Step 9.3 changes. Final status: ESLint, markdownlint, Prettier, Astro check, all 75 unit tests, and the static build are green.
