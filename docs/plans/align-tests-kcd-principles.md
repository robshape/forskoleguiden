# Align Tests with Kent C. Dodds's Testing Principles

## Date: 2026-03-02

## Kent C. Dodds's Core Principles

### The Testing Trophy

```text
    ╭──────────╮
    │   E2E    │  ← Few, high-confidence user journey tests
    ├──────────┤
    │Integration│  ← BULK of tests — how units work together
    ├──────────┤
    │   Unit   │  ← Pure functions, algorithms, utils
    ├──────────┤
    │  Static  │  ← TypeScript, ESLint, Prettier
    ╰──────────╯
```

### "Write Fewer, Longer Tests"

1. **Don't test implementation details** — test behavior/outcomes
2. **Each test should be a complete use case**, not a single assertion
3. **Fewer, longer tests > many short, focused tests**
4. **Tests should resemble how the software is used**
5. **Avoid testing internal structure** — test the public API/interface

---

## Current Test Inventory (60 unit + 4 e2e)

| File                            | Tests | Level             | KCD Rating                   |
| ------------------------------- | ----- | ----------------- | ---------------------------- |
| `base-layout.test.ts`           | 7     | Source inspection | ❌ Implementation details    |
| `city-year-selector.test.ts`    | 7     | Source inspection | ❌ Implementation details    |
| `nav.test.ts`                   | 4     | Source inspection | ❌ Implementation details    |
| `footer.test.ts`                | 3     | Source inspection | ❌ Implementation details    |
| `global-styles-phase-a.test.ts` | 2     | Source inspection | ❌ Implementation details    |
| `types.test.ts`                 | 2     | Type shape        | ⚠️ Redundant with TypeScript |
| `root-redirect.test.ts`         | 1     | Config inspection | ⚠️ Redundant with e2e        |
| `i18n-utils.test.ts`            | 8     | Unit              | ⚠️ Too many tiny tests       |
| `i18n-sv.test.ts`               | 7     | Unit/Contract     | ⚠️ Too many tiny tests       |
| `i18n-locales.test.ts`          | 2     | Unit/Contract     | ✅ Reasonable                |
| `scoring.test.ts`               | 7     | Unit              | ⚠️ Too many tiny tests       |
| `data.test.ts`                  | 5     | Integration       | ⚠️ Slightly fragmented       |
| `malmo-index.test.ts`           | 1     | Data contract     | ✅ Good                      |
| `malmo-surveys.test.ts`         | 2     | Data contract     | ✅ Good                      |
| `gitignore.test.ts`             | 1     | Infrastructure    | ✅ Good (special purpose)    |
| `smoke.spec.ts`                 | 2     | E2E               | ⚠️ Could consolidate         |
| `layout-shell.spec.ts`          | 2     | E2E               | ✅ Good                      |

---

## Detailed Analysis

### PROBLEM 1: Source-Text Inspection Tests (Critical — 5 files, 23 tests)

**Files**: `base-layout.test.ts`, `city-year-selector.test.ts`, `nav.test.ts`, `footer.test.ts`, `global-styles-phase-a.test.ts`

**What they do**: Read Astro/CSS source files as raw strings, then assert on:

- Import paths (`expect(source).toMatch(/import\s+BaseLayout/)`)
- CSS class tokens (`expect(classTokens.has('bg-page')).toBe(true)`)
- HTML structure via regex (`/<header>([\s\S]*?)<\/header>/`)
- Specific Tailwind utility classes (`'text-sm'`, `'font-semibold'`, etc.)

**Why this violates KCD**:

- These test **how the code is written**, not **what the code does**
- Renaming a CSS class, reordering attributes, or refactoring markup breaks tests even when behavior is identical
- They don't resemble how users interact with the software
- KCD: "The more your tests resemble the way your software is used, the more confidence they can give you"

**What they're actually trying to protect**:

- That the layout has the right semantic landmarks (header, main, footer)
- That navigation links exist and point to the right places
- That the visual design system is applied (colors, spacing, typography)
- That accessibility attributes are present (aria-label, aria-current)

**The fix**: These concerns are already largely covered by the e2e `layout-shell.spec.ts` test, which verifies semantics, roles, visible text, and focus behavior in a real browser. The remaining visual design concerns (specific Tailwind classes) should be verified by **visual regression testing** or **Storybook snapshots**, not unit tests on source strings.

### PROBLEM 2: Too Many Tiny Tests (3 files, ~22 tests)

**`i18n-utils.test.ts`** (8 tests):

- 5 one-liner tests for `getLocaleFromURL` with different inputs
- 3 one-liner tests for `t()` with different scenarios
- KCD says: combine these into 2 tests — one for locale extraction, one for translation lookup

**`scoring.test.ts`** (7 tests):

- Each edge case (`computeAgreeShare`, `computeOverallScore` with various inputs, `byOverallScoreDesc`, warning spy) is a separate test
- KCD says: combine into 1-2 longer tests that exercise the full scoring pipeline

**`i18n-sv.test.ts`** (7 tests):

- 3 nearly identical tests for `summary.higher`, `summary.lower`, `summary.similar` — each checks the same pattern (placeholder presence)
- Namespace check + key paths check + copy check could be one longer test
- KCD says: combine into 1-2 tests

### PROBLEM 3: Redundant Test Layers (2 files, 3 tests)

**`root-redirect.test.ts`** (1 test):

- Dynamically imports `astro.config.ts` and checks `redirects` object
- The e2e `smoke.spec.ts` already tests that `GET /` redirects to `/sv/` in the real built site
- Config-level assertion adds no unique confidence — if the redirect works in e2e, the config is correct
- **Remove**: delete file, the e2e test covers this

**`types.test.ts`** (2 tests):

- Constructs sample `PreschoolSurvey` and `PreschoolIndex` objects, then asserts their keys match expected sets
- TypeScript's `strict` mode already enforces these shapes at compile time — if a key is missing, `tsc` errors
- The `assertResponseShape` call is also redundant since the response is typed
- **Remove or migrate**: the runtime key-set check adds no value beyond what the static type system provides. If the concern is "someone modifies the interface", that's a TypeScript compile error.

### PROBLEM 4: E2E Test Consolidation (Minor)

**`smoke.spec.ts`** (2 tests):

- "Swedish homepage loads" and "Root path redirects to Swedish homepage" are two tiny tests
- Could be one longer test: navigate to root, verify redirect, verify page loads
- Minor issue — both are fast and focused, but KCD would prefer one test

---

## Alignment Plan

### Phase 1: Consolidate Small Unit Tests (Low risk, high alignment)

**Goal**: Apply "write fewer, longer tests" to pure-function unit tests.

#### 1a. Consolidate `i18n-utils.test.ts`

**Before**: 8 tests (5 for `getLocaleFromURL`, 3 for `t()`)

**After**: 2 tests

```javascript
describe('i18n utilities') {
  it('extracts locale from URL paths and defaults to sv') {
    // All getLocaleFromURL cases in one test
    // All t() cases in one test
  }
}
```

#### 1b. Consolidate `scoring.test.ts`

**Before**: 7 tests

**After**: 2-3 tests

```javascript
describe('scoring utilities') {
  it('computes agree share, overall scores, and sorts correctly') {
    // computeAgreeShare basic case
    // computeOverallScore average case
    // computeOverallScore rounding
    // computeOverallScore null for missing group
    // computeOverallScore null for empty group
    // byOverallScoreDesc sort behavior
  }

  it('warns for invalid response percentages in non-production') {
    // Separate because it needs spy setup/teardown
  }
}
```

#### 1c. Consolidate `i18n-sv.test.ts`

**Before**: 7 tests

**After**: 2 tests

```javascript
describe('Swedish i18n contract') {
  it('has all required namespaces, key paths, and non-empty string values') {
    // Namespace check + key paths check + copy spot-checks in one test
  }

  it('includes required template placeholders in summary and tray keys') {
    // summary.higher/lower/similar + compareTray.selectedCount
  }
}
```

#### 1d. Consolidate `i18n-locales.test.ts`

**Before**: 2 tests

**After**: 1 test (the "catches nested-key mismatches" test is testing the helper, not the product)

```javascript
describe('locale parity contract') {
  it('matches recursive key paths across sv/en/ar locales') {
    // Move the helper self-test into the helper file or remove it
  }
}
```

#### 1e. Consolidate `data.test.ts`

**Before**: 5 tests

**After**: 2-3 tests

```javascript
describe('data loading') {
  it('loads index and individual surveys with correct relationships') {
    // getPreschoolIndex + getPreschoolSurvey + relationship checks
    // getAllPreschoolSurveys + order check
    // Error case for unknown id
  }

  it('reads index file exactly once when loading all surveys') {
    // Separate because it needs mock setup
  }
}
```

#### 1f. Consolidate `smoke.spec.ts` (E2E)

**Before**: 2 tests

**After**: 1 test

```javascript
test('Swedish homepage loads and root redirects to it') {
  // Navigate to /, verify redirect to /sv/, verify page content
}
```

### Phase 2: Remove Redundant Tests (Medium risk)

#### 2a. Delete `root-redirect.test.ts`

Covered by e2e `smoke.spec.ts`. Config-inspection unit test adds no unique value.

#### 2b. Delete `types.test.ts`

TypeScript strict mode already enforces interface shapes at compile time. The runtime key-set checks add no confidence beyond `tsc`.

### Phase 3: Replace Source-Inspection Tests with Behavioral Tests (High value, most effort)

**Goal**: Move testing of component composition/styling from source-string regex to behavioral verification.

#### 3a. Delete or heavily reduce `base-layout.test.ts`

**What to keep**: Nothing — semantic landmarks (header, main, footer), component composition, and viewport meta are all verified by e2e `layout-shell.spec.ts`.

**What to lose**: CSS class token assertions (`bg-page`, `font-sans`, etc.). These are implementation details. If visual design must be tested, use visual regression (Percy, Chromatic) or a Storybook snapshot — not regex on source strings.

#### 3b. Delete or heavily reduce `nav.test.ts`

**What to keep**: Nothing unique — nav visibility, brand link, language pill are tested in e2e `layout-shell.spec.ts`.

**What to lose**: Import path assertions, CSS class tokens (`bg-surface`, `border-b`, etc.), absence of city names.

#### 3c. Delete or heavily reduce `footer.test.ts`

**What to keep**: Nothing unique — attribution text, source link href/target are tested in e2e `layout-shell.spec.ts`.

**What to lose**: CSS class tokens (`mx-auto`, `text-sm`, `text-gray-400`, etc.), absence of `border-t`.

#### 3d. Delete or heavily reduce `city-year-selector.test.ts`

**What to keep**: Nothing unique — city section visibility, button states, survey year are tested in e2e `layout-shell.spec.ts`.

**What to lose**: Regex on i18n key usage, CSS class tokens on buttons, disabled button styling.

#### 3e. Delete or heavily reduce `global-styles-phase-a.test.ts`

**What to keep**: Nothing — these assert that specific CSS color values exist in a CSS file. This is an implementation detail.

**What to lose**: All theme token assertions, focus-visible/button/link interaction defaults.

**Alternative**: If you want to protect design tokens from accidental removal, consider a dedicated "design token contract" test that imports the built CSS (post-Tailwind processing) and checks computed values in a real browser context — or simply rely on visual regression testing.

### Phase 3 Migration Strategy

Rather than just deleting 23 source-inspection tests, verify that the e2e `layout-shell.spec.ts` test already covers the behavioral intent:

| Source-Inspection Concern                  | E2E Coverage                                  |
| ------------------------------------------ | --------------------------------------------- |
| `<header>`, `<main>`, `<footer>` landmarks | ✅ `layout-shell.spec.ts` line 24-26          |
| Nav brand link with correct href           | ✅ `layout-shell.spec.ts` line 30-33          |
| Language pill visible                      | ✅ `layout-shell.spec.ts` line 34             |
| City section with buttons                  | ✅ `layout-shell.spec.ts` line 37-51          |
| Survey year visible                        | ✅ `layout-shell.spec.ts` line 54-55          |
| Attribution text in footer                 | ✅ `layout-shell.spec.ts` line 58             |
| Source link with target/rel                | ✅ `layout-shell.spec.ts` line 60-65          |
| Focus-visible outline                      | ✅ `layout-shell.spec.ts` line 69-108         |
| Viewport meta                              | ❌ Not covered — add to e2e                   |
| `lang="sv"` attribute                      | ✅ `layout-shell.spec.ts` line 23             |
| CSS class tokens (Tailwind)                | ❌ Not covered — use visual regression        |
| Import paths                               | ❌ Never needs testing — build fails if wrong |
| HTML composition order                     | ✅ Semantic landmark tests cover this         |

**Action**: Before deleting source-inspection tests, add these to e2e:

1. Viewport meta has `viewport-fit=cover`
2. Favicon link exists

Everything else is already covered by e2e or by the build system itself.

---

## Summary: Test Count Impact

| Phase                             | Tests Removed   | Tests Added      | Net Change |
| --------------------------------- | --------------- | ---------------- | ---------- |
| Phase 1: Consolidate              | ~30 short tests | ~10 longer tests | -20        |
| Phase 2: Remove redundant         | 3 tests         | 0                | -3         |
| Phase 3: Remove source-inspection | 23 tests        | 2 e2e assertions | -21        |
| **Total**                         | **~56**         | **~12**          | **-44**    |

### Final Target State

| File                          | Tests   | Level          | Purpose                                              |
| ----------------------------- | ------- | -------------- | ---------------------------------------------------- |
| `i18n.test.ts`                | 3       | Unit           | Utility functions + locale parity + Swedish contract |
| `scoring.test.ts`             | 2       | Unit           | Pure scoring functions + warning behavior            |
| `data.test.ts`                | 2-3     | Integration    | Data loading pipeline + error handling               |
| `malmo-data-contract.test.ts` | 2       | Data contract  | Index + survey file integrity                        |
| `gitignore.test.ts`           | 1       | Infrastructure | Infrastructure guard                                 |
| `smoke.spec.ts`               | 1       | E2E            | Homepage + redirect                                  |
| `layout-shell.spec.ts`        | 2       | E2E            | Full shell semantics + keyboard a11y                 |
| **Total**                     | **~14** |                |                                                      |

This aligns with KCD's trophy: heavy on integration (e2e for component behavior, data contract for file integrity), lean unit layer (pure functions only), no implementation-detail tests.

---

## Recommended Execution Order

1. **Phase 1** first — safe consolidation, no tests deleted, just merged
2. **Phase 3 prep** — verify e2e coverage, add missing e2e assertions
3. **Phase 3** — delete source-inspection tests one file at a time
4. **Phase 2** — remove redundant tests last (smallest impact)

## Risks and Mitigations

| Risk                             | Mitigation                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Losing CSS class coverage        | Accept that CSS class tests are low-value. Use visual regression if design integrity is critical.            |
| Breaking change detection        | TypeScript + ESLint + e2e tests catch real breakages. Source-inspection tests only catch cosmetic refactors. |
| Confidence gap during transition | Execute phase-by-phase; run full test suite after each phase.                                                |
