# Plan: Implement Step 3.2 Navigation Shell

Implement the Step 3.2 navigation shell by introducing a locale-aware Astro `Nav` component and composing it in `BaseLayout`. The work follows a strict fail-first TDD flow to lock behavior, then adds the minimal UI from mockup cues without expanding scope.

## Phases

1. **Phase 1: Add failing Step 3.2 tests**
   - **Objective**: Define and enforce the required navigation contract before implementation.
   - **Files/Functions to Modify/Create**: `tests/unit/sv-index-layout.test.ts`, `tests/e2e/layout-shell.spec.ts`
   - **Tests to Write**: `BaseLayout composes Nav with locale prop`, `nav renders Malmö/Stockholm/Göteborg and 2025 on /sv/`
   - **Steps**:
     1. Extend unit assertions to verify `BaseLayout` imports and renders `Nav` with locale wiring.
     2. Extend e2e assertions to verify site link target, city labels, disabled semantics, and static year text on `/sv/`.
     3. Run targeted tests and confirm fail-first outcomes.

2. **Phase 2: Implement Nav and wire into layout**
   - **Objective**: Deliver the Step 3.2 UI in the smallest safe change set.
   - **Files/Functions to Modify/Create**: `src/components/astro/Nav.astro`, `src/layouts/BaseLayout.astro`, `src/pages/sv/index.astro`
   - **Tests to Write**: No new tests; satisfy Phase 1 tests.
   - **Steps**:
     1. Create `Nav.astro` with `locale: Locale` and required static shell elements.
     2. Render `Nav` in `BaseLayout` header using existing `locale` prop.
     3. Remove page-level header slot content from `/sv/` to prevent duplicate header shell.
     4. Re-run targeted tests and confirm pass.

3. **Phase 3: Validate quality gates and finalize phase handoff**
   - **Objective**: Verify stability, capture review outcome, and provide commit-ready handoff.
   - **Files/Functions to Modify/Create**: Updated source/tests above, plus phase completion artifact.
   - **Tests to Write**: No new tests.
   - **Steps**:
     1. Run required gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     2. Run phase review and address any review-required revisions.
     3. Generate phase completion document and commit message.

## Open Questions

1. None. Language-switcher placeholder is confirmed as visible non-interactive text: “Språk: SV | EN | AR (kommer snart)”.
