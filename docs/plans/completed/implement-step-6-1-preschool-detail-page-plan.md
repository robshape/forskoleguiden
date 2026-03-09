# Plan: Implement Preschool Detail Page

Add the Swedish preschool detail route for each Malmö preschool using the existing Astro shell, build-time data loaders, and compare-state UI. The work stays scoped to Step 6.1 by covering dynamic route generation, detail-page rendering, and verification without pulling in Step 6.2 or later comparison features unless required for correctness.

## Phases

1. **Phase 1: Add failing Step 6.1 tests**
   - **Objective**: Capture the required detail-page behavior before implementation.
   - **Files/Functions to Modify/Create**: [tests/e2e/preschool-card-contract.spec.ts](tests/e2e/preschool-card-contract.spec.ts), a new detail-page e2e spec if needed, and existing build/runtime assertions around generated routes.
   - **Tests to Write**: A build-output assertion that each Malmö preschool gets a generated detail page and a runtime assertion that one detail page renders the required metadata, Helhetsbedömning content, and compare interaction.
   - **Steps**:
     1. Add a failing test that verifies all Swedish preschool detail pages are generated.
     2. Add a failing browser test for the detail-page rendering contract.
     3. Run the targeted tests and confirm they fail for the expected missing-route behavior.

2. **Phase 2: Implement the Swedish detail route**
   - **Objective**: Create the dynamic Astro detail page using existing data, layout, and compare-button patterns.
   - **Files/Functions to Modify/Create**: [src/pages/sv/forskola/[id].astro](src/pages/sv/forskola/[id].astro), plus any minimal supporting updates required in [src/i18n/sv.json](src/i18n/sv.json) and locale-parity companions if new keys are necessary.
   - **Tests to Write**: No additional tests beyond the failing Phase 1 cases unless a narrow regression guard becomes necessary.
   - **Steps**:
     1. Implement `getStaticPaths()` from the Malmö preschool index and load each preschool survey at build time.
     2. Render the detail page in the existing layout with back navigation, preschool metadata, Helhetsbedömning question content, and the existing compare button island.
     3. Keep the scope limited to Step 6.1 and avoid Step 6.2 structured response rendering unless required by the acceptance criteria.

3. **Phase 3: Verify and harden**
   - **Objective**: Confirm the new route works within the current app contracts and does not regress directory or compare behavior.
   - **Files/Functions to Modify/Create**: The new detail-page tests and any minimal follow-up fixes identified during review.
   - **Tests to Write**: Targeted reruns for new detail-page coverage followed by full validation.
   - **Steps**:
     1. Run the new detail-page tests and fix only issues directly blocking Step 6.1.
     2. Run relevant existing directory and compare tests to confirm integration safety.
     3. Run `pnpm validate` and prepare the completion artifacts.

## Open Questions

1. Should the detail page keep Step 6.1 minimal and defer the five labeled response rows to Step 6.2, or should both land together if the implementation cost is negligible?
2. Should the detail-page contract live in a dedicated e2e spec or be folded into an existing directory/detail navigation spec?
