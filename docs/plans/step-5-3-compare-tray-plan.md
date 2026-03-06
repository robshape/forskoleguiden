# Plan: Step 5.3 Compare Tray

Implement the global compare tray as a Preact island mounted from the shared layout and driven by the existing compare nanostore. The work stays scoped to Step 5.3: tests-first tray behavior, global mounting, locale-aware compare CTA, and quality-gate verification without pulling comparison-page implementation forward.

## Phases

1. **Phase 1: Add failing tray behavior tests**
   - **Objective**: Lock the expected compare-tray behavior before UI code changes.
   - **Files/Functions to Modify/Create**: `tests/e2e/compare-tray-interaction.spec.ts`
   - **Tests to Write**: Compare tray hidden when empty; tray appears after selections with selected count and compare CTA; clear resets tray and compare buttons; tray controls are keyboard reachable and operable.
   - **Steps**:
     1. Write the new Playwright spec against the current directory page.
     2. Assert the compare CTA href only, not successful navigation, because the comparison route is added later.
     3. Run the new spec and confirm it fails for the expected missing-tray reasons.

2. **Phase 2: Implement tray island and mount it globally**
   - **Objective**: Build the compare tray and wire it into the shared layout.
   - **Files/Functions to Modify/Create**: `src/components/preact/CompareTray.tsx`, `src/layouts/BaseLayout.astro`
   - **Tests to Write**: Satisfy the failing tray behavior tests from Phase 1.
   - **Steps**:
     1. Create a client-loaded CompareTray island using the existing compare store and clear helper.
     2. Pass locale-specific labels and the compare-page href from the layout, following the existing i18n and base-path patterns.
     3. Render the tray only when at least one preschool is selected and include the selected-count text, compare CTA, clear button, and safe-area-aware spacing.
     4. Run the tray tests again until they pass.

3. **Phase 3: Verify quality gates and phase acceptance**
   - **Objective**: Validate that the tray works and did not regress existing behavior.
   - **Files/Functions to Modify/Create**: None unless fixes are required during validation.
   - **Tests to Write**: None.
   - **Steps**:
     1. Re-run the new tray e2e spec.
     2. Run `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test`.
     3. Summarize completed work, write the phase-complete note, and prepare the git commit message.

## Open Questions

1. Should the tray show selected preschool names in this step? Recommendation: no; keep Step 5.3 scoped to the required selected-count display because the current global store only exposes IDs.
2. Should the tray e2e test follow the compare CTA? Recommendation: no; assert the href and keyboard reachability only so Step 5.3 does not depend on the later comparison-page route.
