# Quickstart: Multi-Locale Page Routes

**Branch**: `001-multi-locale-routes` | **Date**: 2026-03-23

## Prerequisites

- Node.js and pnpm installed (`pnpm >= 9`)
- Repository cloned, on `001-multi-locale-routes` branch
- `pnpm install` completed

## Traceability

Each step maps to Phase 2 sub-steps (0.1–0.6), spec requirements (FR-_), user stories (US-_), and research decisions (D-\*). Use these references to navigate to the full context.

| Step | Phase 2 sub-step | Spec requirements                      | Research decision              |
| ---- | ---------------- | -------------------------------------- | ------------------------------ |
| 0    | 0.1              | —                                      | D-1 (page generation strategy) |
| 1    | 0.2              | FR-001, FR-002, FR-005, FR-008, FR-009 | D-3 (SortToggle list ID)       |
| 1a   | 0.2 (verify)     | SC-002                                 | —                              |
| 2    | 0.3              | FR-001, FR-003, FR-004, FR-008, FR-009 | D-3                            |
| 2a   | 0.3 (verify)     | SC-003                                 | —                              |
| 3    | 0.4              | FR-006                                 | —                              |
| 4    | 0.5              | FR-007                                 | D-2 (root redirect)            |
| 5    | 0.6              | FR-010, SC-001, SC-007                 | D-5 (post-build test updates)  |
| 6    | —                | FR-006, SC-004, SC-005                 | D-4 (e2e test URLs)            |
| 7    | —                | FR-011, SC-006                         | —                              |

_Spec: `specs/001-multi-locale-routes/spec.md` · Research: `specs/001-multi-locale-routes/research.md`_

## Implementation Steps

### Step 0: Confirm Page Generation Strategy _(Phase 2 §0.1 · research.md D-1)_

Read `research.md` Decision 1 and confirm the approach: **explicit page files per locale** (`src/pages/{locale}/`), not Astro's `i18n` config or dynamic catch-all routes. No code changes — this is a read-and-confirm checkpoint.

Verify no Astro config changes are needed:

```sh
pnpm build
```

Build should succeed with the existing Phase 1 output unchanged.

---

### Step 1: Create English Page Routes _(Phase 2 §0.2 · FR-001, FR-002, FR-005, FR-008, FR-009)_

Create `src/pages/en/` with 4 files mirroring the Swedish pages. Each file is identical to its Swedish counterpart except:

- `const locale = 'en'` instead of `'sv'` (line 13 in `src/pages/sv/index.astro`, line 28 in `[id].astro`, line 11 in `jamfor/index.astro`, line 5 in `om/index.astro`)
- SortToggle `listId` prop changes from `"sv-preschool-directory-list"` to `"en-preschool-directory-list"` (line 72 in `src/pages/sv/index.astro`)
- `<ul>` `id` changes from `"sv-preschool-directory-list"` to `"en-preschool-directory-list"` (line 77 in `src/pages/sv/index.astro`)
- `localeCompare` already uses the `locale` variable, so it picks up `'en'` automatically — no manual change needed beyond the `locale` constant

**Files to create**:

1. `src/pages/en/index.astro` — Copy from `src/pages/sv/index.astro`, change `locale`, `listId`, `id` _(see research.md D-3 for rationale)_
2. `src/pages/en/forskola/[id].astro` — Copy from `src/pages/sv/forskola/[id].astro`, change `locale`
3. `src/pages/en/jamfor/index.astro` — Copy from `src/pages/sv/jamfor/index.astro`, change `locale`
4. `src/pages/en/om/index.astro` — Copy from `src/pages/sv/om/index.astro`, change `locale`

### Step 1a: Verify English Build _(Phase 2 §0.2 verify · SC-002)_

```sh
pnpm build
```

Assert before proceeding:

- `dist/en/index.html` exists and contains `<html lang="en">` (not `dir="rtl"`) — satisfies **SC-002**
- `dist/en/forskola/{any-id}/index.html` exists for at least one preschool
- `dist/en/jamfor/index.html` exists
- `dist/en/om/index.html` exists
- The English directory page heading uses the English translation (e.g., "Preschools" not "Förskolor") — satisfies **FR-002**
- Existing `dist/sv/` output is unchanged — early check on **FR-011**

---

### Step 2: Create Arabic Page Routes _(Phase 2 §0.3 · FR-001, FR-003, FR-004, FR-008, FR-009)_

Create `src/pages/ar/` with the same 4 files, using `locale = 'ar'`:

1. `src/pages/ar/index.astro` — `locale = 'ar'`, `listId="ar-preschool-directory-list"`, `id="ar-preschool-directory-list"`
2. `src/pages/ar/forskola/[id].astro` — `locale = 'ar'`
3. `src/pages/ar/jamfor/index.astro` — `locale = 'ar'`
4. `src/pages/ar/om/index.astro` — `locale = 'ar'`

### Step 2a: Verify Arabic Build _(Phase 2 §0.3 verify · SC-003)_

```sh
pnpm build
```

Assert before proceeding:

- `dist/ar/index.html` exists and contains `<html lang="ar">` AND `dir="rtl"` — satisfies **SC-003**, **FR-004**
- `dist/ar/forskola/{any-id}/index.html` exists for at least one preschool
- `dist/ar/jamfor/index.html` and `dist/ar/om/index.html` exist
- Arabic directory page contains Arabic text from `ar.json` — satisfies **FR-003**

---

### Step 3: Verify Internal Links Stay Within Locale _(Phase 2 §0.4 · FR-006 · spec.md US-3)_

This is a **verification step**, not a code change step. All components already use dynamic `${base}/${locale}/` interpolation. Verify by inspecting the built HTML:

```sh
# English links stay in /en/
grep -o 'href="[^"]*"' dist/en/index.html | head -20
# Arabic links stay in /ar/
grep -o 'href="[^"]*"' dist/ar/index.html | head -20
```

Confirm for each component _(Phase 2 §0.4 checklist)_:

| Component                         | Link pattern                       | Expected in `dist/en/`                       |
| --------------------------------- | ---------------------------------- | -------------------------------------------- |
| `Nav.astro` site title            | `${base}/${locale}/`               | Links to `/forskoleguiden/en/`               |
| `PreschoolCard.astro` detail link | `${base}/${locale}/forskola/{id}/` | Links to `/forskoleguiden/en/forskola/{id}/` |
| `CompareTray.tsx` comparison link | `${base}/${locale}/jamfor/`        | Links to `/forskoleguiden/en/jamfor/`        |
| `ComparisonView.tsx` back link    | `${base}/${locale}/`               | Links to `/forskoleguiden/en/`               |
| Detail page breadcrumb            | `${base}/${locale}/`               | Links to `/forskoleguiden/en/`               |

If any link hardcodes `/sv/`, fix it in the component. No component changes are expected based on codebase analysis, but this step confirms it.

This satisfies **spec.md User Story 3** (all 4 acceptance scenarios) and **FR-006**.

---

### Step 4: Verify Root Redirect _(Phase 2 §0.5 · FR-007 · spec.md US-4)_

No code changes expected _(see research.md D-2)_. Verify:

```sh
cat dist/index.html | grep -i 'redirect\|refresh\|location'
```

Assert `dist/index.html` redirects to `/forskoleguiden/sv/` — satisfies **FR-007** and **SC-005**.

---

### Step 5: Update Post-Build Tests _(Phase 2 §0.6 · FR-010, SC-001, SC-007 · research.md D-5)_

Update `tests/post-build/static-output-verification.test.ts`:

**Config constant changes** (lines 18–22 of the current file):

| Constant                  | Current value | New value      | Rationale                                                                                |
| ------------------------- | ------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `MIN_HTML_FILE_COUNT`     | `8`           | `790`          | 3 locales × (~261 detail + 1 directory + 1 about + 1 comparison) + 1 root redirect ≈ 790 |
| `TOTAL_SIZE_BUDGET_BYTES` | `7000 * 1024` | `21000 * 1024` | 3× the single-locale budget (research.md D-5)                                            |

**New structural assertions** — add test cases mirroring the existing Swedish ones for `en/` and `ar/`:

- `dist/en/index.html` exists (English directory)
- `dist/en/om/index.html` exists (English about)
- `dist/en/jamfor/index.html` exists (English comparison)
- Detail page for every preschool ID in `dist/en/forskola/{id}/index.html`
- Same 4 assertions for `dist/ar/`

Consider using a locale loop (`['sv', 'en', 'ar'].forEach(...)`) to avoid tripling the test code — this satisfies **SC-001** (all three locale directories with identical page counts).

---

### Step 6: Create E2e Test _(FR-006, SC-004, SC-005 · research.md D-4 · spec.md US-1, US-2, US-3, US-4)_

Create `tests/e2e/multi-locale-routes.spec.ts`. Use its own URL constants _(not the shared helpers — see research.md D-4)_.

Map test cases to spec acceptance scenarios:

| Test case                                                               | Spec acceptance scenario         |
| ----------------------------------------------------------------------- | -------------------------------- |
| English directory page loads with English headings                      | US-1 AS-1                        |
| English page has `lang="en"` and no `dir="rtl"`                         | US-1 AS-4                        |
| Clicking English preschool card navigates to `/en/forskola/{id}/`       | US-1 AS-2, US-3 AS-1, **SC-004** |
| Arabic directory page loads with Arabic text                            | US-2 AS-1                        |
| Arabic page has `lang="ar"` and `dir="rtl"`                             | US-2 AS-2                        |
| Clicking Arabic preschool card navigates to `/ar/forskola/{id}/`        | US-2 AS-3                        |
| Root URL redirects to Swedish directory                                 | US-4 AS-1, **SC-005**            |
| Internal navigation stays within active locale (breadcrumb, back links) | US-3 AS-2, US-3 AS-3, US-3 AS-4  |

---

### Step 7: Full Validation _(FR-011, SC-006)_

```sh
pnpm validate
```

This runs lint, format, check, test, build, post-build tests, e2e, WebKit e2e, and Lighthouse audit. All must pass.

Passing confirms **FR-011** (no Swedish regressions) and **SC-006** (all existing Swedish e2e tests pass without modification).

## Key Patterns to Follow

### Locale constant pattern (every page file)

```typescript
const locale = 'en' // or 'ar' — this is the ONLY change from the Swedish file
```

### SortToggle list ID pattern (directory page only)

```typescript
// In the directory page, the listId prop and <ul> id share the same locale-prefixed value.
// See src/pages/sv/index.astro lines 72 and 77 for the Swedish pattern:
//   listId="sv-preschool-directory-list"
//   <ul ... id="sv-preschool-directory-list">
// For English: "en-preschool-directory-list"
// For Arabic:  "ar-preschool-directory-list"
```

### Base path + locale pattern (all links)

```typescript
const base = getBasePath()
const href = `${base}/${locale}/path/`
```

All components already use this pattern — no component changes needed.

## What NOT to Change

- **No component changes**: All Astro and Preact components already accept `locale` as a prop and use dynamic link interpolation _(verified in Step 3)_.
- **No Astro config changes**: The root redirect and base path config remain unchanged _(verified in Step 4; see research.md D-2)_.
- **No data loader changes**: `getPreschoolIndex()`, `getPreschoolSurveyByYear()`, `getAllPreschoolSurveys()` are locale-agnostic _(see data-model.md)_.
- **No i18n file changes**: All three locale files already exist with complete, parity-tested keys _(enforced by `i18n-locale-key-parity.test.ts`)_.
- **No existing test changes**: Swedish e2e tests continue to pass as-is. New tests are additive _(see research.md D-4)_.
