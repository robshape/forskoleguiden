# Research: Phase 2 Final Verification

**Date**: 2026-03-26

## R1: E2E Test Structure — Single Long Test vs. Multiple Short Tests

**Decision**: Single test file (`user-flow-phase2.spec.ts`) with one long sequential test covering the full Phase 2 user journey.

**Rationale**: The project constitution (§IV) explicitly follows Kent C. Dodds's "Write fewer, longer tests" approach. The Phase 1 user flow test (`user-flow-phase1.spec.ts`) uses this exact pattern — a single `test()` block with 13 sequential steps. The Phase 2 test mirrors this structure with 15 steps covering language switching → selection → queue link → comparison → share/restore → RTL.

**Alternatives considered**:
- Multiple small test files per feature (e.g., `share-restore-flow.spec.ts`, `language-switch-flow.spec.ts`): Rejected because individual feature e2e tests already exist (`share-ui-copy-and-restore.spec.ts`, `language-switcher-navigation.spec.ts`). The value of this test is specifically cross-feature integration in a single journey.

## R2: Share URL Round-Trip Testing Strategy

**Decision**: Use the existing `encodeSharePayload()` helper from `tests/e2e/helpers.ts` to construct a share URL with known preschool IDs from the real data set, then navigate to it in a new browser context and assert restoration.

**Rationale**: The e2e helpers already export `encodeSharePayload(ids)` which mirrors the production `encodeShareState()` logic. Using real preschool IDs from the index data ensures the round-trip tests against actual content. A new browser context (via `browser.newContext()`) simulates a different user opening the shared link — more realistic than navigating in the same session.

**Alternatives considered**:
- Click the Share button and read the clipboard: Possible but clipboard access in CI (headless Chromium) is unreliable. The existing `share-ui-copy-and-restore.spec.ts` already tests clipboard behavior with appropriate guards. The user flow test should focus on the end-to-end journey, not clipboard mechanics.
- Mock IDs: Rejected because real IDs validate the full pipeline (data exists → page rendered → share encodes correctly → restoration decodes and finds the preschool).

## R3: Post-Build Verification Scope — New Tests vs. Existing Coverage

**Decision**: No new post-build tests needed. The existing `static-output-verification.test.ts` and `page-weight-budget.test.ts` already cover all three locales, page counts, content attributes, and weight budgets.

**Rationale**: These tests were added/updated in earlier Phase 2 steps (Steps 0 and 9). The `static-output-verification.test.ts` already asserts: (a) locale directories `sv/`, `en/`, `ar/` exist, (b) minimum 40 HTML files, (c) total dist size ≤ 21 MB, (d) Arabic pages contain Arabic script characters. The `page-weight-budget.test.ts` already asserts per-locale page weight ≤ 600 KB. Running `pnpm validate` executes both as part of the pipeline.

**Alternatives considered**:
- Duplicate assertion in the e2e test (e.g., counting pages via Playwright): Redundant with post-build tests and slower. Post-build tests inspect the filesystem directly and are the right layer for this validation.

## R4: RTL Layout Verification in E2E

**Decision**: The Phase 2 user flow test verifies RTL layout by asserting `dir="rtl"` on the `<html>` element and checking that Arabic text renders (checking for Arabic Unicode range characters). Layout mirroring (visual correctness) is not pixel-tested.

**Rationale**: The existing `arabic-rtl-layout.spec.ts` already performs detailed RTL layout assertions (text alignment, document direction, component rendering). The user flow test's role is integration verification — confirming that switching locales via the language switcher correctly applies RTL, not re-testing every RTL detail.

**Alternatives considered**:
- Visual regression testing (screenshot comparison): Not currently in the project's test infrastructure. Adding it for this feature would be over-engineering.
- Detailed RTL CSS assertions in the user flow test: Duplicates `arabic-rtl-layout.spec.ts` and makes the user flow test brittle against CSS changes.

## R5: Clipboard Fallback Strategy in CI

**Decision**: The user flow test clicks the Share button and asserts the confirmation message appears. It does NOT assert clipboard contents. Share URL restoration is tested by constructing the URL programmatically (via `encodeSharePayload()`) and navigating to it in a new context.

**Rationale**: Clipboard API access in headless Chromium within CI environments is inconsistent. The existing `share-ui-copy-and-restore.spec.ts` already handles clipboard testing with appropriate guards and fallbacks. Repeating that logic in the user flow test adds fragility without value. The spec's Assumptions section explicitly allows this fallback approach.

**Alternatives considered**:
- Granting clipboard permissions via Playwright's `context.grantPermissions(['clipboard-read', 'clipboard-write'])`: Works in some environments but not reliably in all CI configurations. Already used in the dedicated share test — no need to duplicate.
