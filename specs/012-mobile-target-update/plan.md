# Implementation Plan: Mobile Target Update — iPhone 17

**Branch**: `012-mobile-target-update` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-mobile-target-update/spec.md`

## Summary

Update the primary mobile design target from iPhone 13 mini (375×812 CSS pixels) to iPhone 17 (393×852 CSS pixels). This involves updating Playwright test configurations and e2e viewport sizes, updating all project documentation to reference iPhone 17 as the primary target, updating SVG mockup canvas dimensions, and performing a visual audit of all page types at the new viewport to fix any layout/spacing issues. No new CSS breakpoints or framework changes are needed — the existing responsive Tailwind v4 system already handles the 320–430 px range. Backward compatibility down to 320 px is maintained. The Playwright `devices['iPhone 15']` preset is used as a proxy for iPhone 17 (identical screen dimensions: 393×852, webkit engine) since iPhone 17 is not yet in Playwright's device registry.

## Technical Context

**Language/Version**: TypeScript (strict mode, `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro (static output), Preact (islands), nanostores + @nanostores/preact, Tailwind CSS v4 (@tailwindcss/vite)
**Storage**: sessionStorage (client-side compare state persistence), no server-side storage
**Testing**: Vitest (unit, node env), Playwright 1.58.2 + @axe-core/playwright (e2e), post-build verification tests
**Target Platform**: Static site on GitHub Pages, mobile-first (iPhone 17 — 393×852 CSS viewport)
**Project Type**: Static web application (MPA with Preact islands)
**Performance Goals**: 100 KB uncompressed page-weight budget, Lighthouse perf ≥ 0.90, a11y ≥ 0.95, ~3–5 KB total island JS budget
**Constraints**: Zero runtime APIs, no external CDNs, share URLs < 2,000 chars, responsive range 320–430 px
**Scale/Scope**: ~100 preschools, 3 locales (sv/en/ar), 4 page types (directory, detail, comparison)

### Playwright Device Mapping

Playwright 1.58.2 does not include an `iPhone 17` device preset. The closest match is `devices['iPhone 15']`, which has identical screen dimensions (393×852) and uses the webkit engine. Device details:

| Property | iPhone 13 Mini (current) | iPhone 15 (proxy for iPhone 17) |
|----------|--------------------------|--------------------------------|
| Screen | 375×812 | 393×852 |
| Viewport (minus toolbar) | 375×629 | 393×659 |
| Device scale factor | 3 | 3 |
| Default browser | webkit | webkit |
| isMobile | true | true |

For `setViewportSize()` calls in e2e tests, the full screen dimensions (393×852) are used, not the toolbar-adjusted viewport (393×659), matching the existing pattern where tests use 375×812 (screen) rather than 375×629 (viewport).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Performance by Default | ✅ PASS | No new JavaScript, no new islands, no new dependencies. Changes are limited to documentation, test configs, and potential minor CSS spacing adjustments. Page-weight budget unaffected. |
| II. Accessibility First | ✅ PASS | Touch targets remain ≥ 44×44 px. Visual audit at 393×852 will verify accessibility. Lighthouse a11y ≥ 0.95 enforced. No functionality changes that could affect keyboard navigation or ARIA. |
| III. Data Integrity | ✅ PASS | No changes to data pipeline, scoring logic, or data files. |
| IV. Testing Standards | ✅ PASS | E2e tests updated to new primary viewport. WebKit regression suite updated. No new test files needed — existing tests are modified in place. |
| V. Architecture Discipline | ✅ PASS | No new abstractions, no new files (except potential minor CSS adjustments in existing files). Feature-over-type organization maintained. |
| VI. Internationalization | ✅ PASS | No new i18n keys. Language switcher 375 px breakpoint behavior unchanged. RTL layout unaffected. |
| VII. Privacy by Design | ✅ PASS | No new external requests, no tracking, no cookies. |

**Gate result**: All 7 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/012-mobile-target-update/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# No new files. All changes are modifications to existing files.

# TEST CONFIGURATIONS
playwright.webkit.config.ts     # MODIFY — devices['iPhone 13 mini'] → devices['iPhone 15'], update comments
playwright.config.ts            # NO CHANGE — no explicit mobile viewport defined

# E2E TESTS (viewport size updates)
tests/e2e/
├── responsive-context-adaptation.spec.ts            # MODIFY — update primary viewport 375×812 → 393×852
├── hardening-touch-target-and-heading-shell.spec.ts # MODIFY — update 375×812 → 393×852
├── typography-system-normalization.spec.ts          # MODIFY — update 375×812 → 393×852
├── compare-tray-interaction.spec.ts                 # MODIFY — update 375×812 → 393×852, update test name
├── comparison-page-route-shell.spec.ts              # MODIFY — update 375×812 → 393×852, update test name
├── comparison-page-mobile-webkit.spec.ts            # MODIFY — update comments (iPhone 13 mini → iPhone 17/15)
└── language-switcher-navigation.spec.ts             # NO CHANGE — tests 375 px breakpoint behavior (edge case)

# DOCUMENTATION UPDATES
docs/prd.md                          # MODIFY — 4 refs to iPhone 13 mini → iPhone 17
docs/implementation-plan-phase-1.md  # MODIFY — 3 refs to 375×812/iPhone 13 mini
.github/copilot-instructions.md      # MODIFY — 2 refs to iPhone 13 mini
.impeccable.md                       # OPTIONAL — add iPhone 17 note to phone portrait range

# SVG MOCKUPS (viewBox/dimension updates)
docs/mockups/homepage.svg            # MODIFY — viewBox 375×812 → 393×852
docs/mockups/comparison-view.svg     # MODIFY — viewBox 375×812 → 393×852
docs/mockups/preschool-details.svg   # MODIFY — viewBox 375×812 → 393×852
docs/mockups/shortlist.svg           # MODIFY — viewBox 375×812 → 393×852

# SPEC DOCUMENTATION (historical references)
specs/001-006/*/plan.md              # MODIFY — update iPhone 13 mini primary target refs
specs/002-language-switcher/spec.md  # MODIFY — update 375 px reference context
specs/002-language-switcher/research.md  # MODIFY — update 375 px cutoff context

# CSS/STYLING (visual audit — conditional)
src/styles/global.css                # LIKELY NO CHANGE — no hardcoded pixel values
src/components/astro/*               # AUDIT — verify spacing/layout at 393 px
src/components/preact/*              # AUDIT — verify rendering at 393 px
src/layouts/BaseLayout.astro         # NO CHANGE — uses device-width meta tag
```

**Structure Decision**: No new files or directories. This feature is a cross-cutting update to existing configurations, tests, documentation, and design artifacts. Any CSS fixes discovered during the visual audit will be applied to existing component files.

## Implementation Phases

Phases are sequential — the visual audit must happen first (to discover styling issues before changing test expectations), test config and viewport updates come next, then documentation and mockup sweeps, and finally full validation. Within a phase, steps marked **[P]** can run in parallel.

```text
Phase 1 (Visual Audit & CSS Fixes)
  └─► Phase 2 (Test Configuration)
        └─► Phase 3 (E2e Viewport Updates)
              └─► Phase 5 (Documentation Updates)
                          └─► Phase 6 (SVG Mockups & Historical Specs)
                                └─► Phase 7 (Full Validation)
```

### Phase 1: Visual Audit & CSS Fixes (User Story 1 — P1)

Build the site and visually verify all page types at the new primary viewport. Fix any layout or spacing issues before updating test expectations. _(See [research.md R5](research.md#r5-visual-audit-scope) for audit approach and [R6](research.md#r6-existing-responsive-css-assessment) for CSS assessment rationale.)_

| Step | File | What | References |
|------|------|------|------------|
| 1a | — | Run `pnpm build && pnpm preview`; open DevTools at 393×852 | research.md R5 step 1–2 |
| 1b | — | Verify directory page (`/forskoleguiden/sv/`): no horizontal overflow, card spacing, touch targets | spec FR-002, FR-009; SC-001, SC-008 |
| 1c | — | Verify detail page (`/forskoleguiden/sv/forskola/<any>/`): bar charts, question cards, queue link | spec FR-002, FR-009 |
| 1d | — | Verify comparison page (`/forskoleguiden/sv/jamfor/`) with 3+ selected: card stacking, share button | spec FR-002, FR-009 |
| 1e | — | Also verify at 430×932 (iPhone 17 Pro Max) and 375×812 (backward compat) | spec US-2, US-3; SC-001 |
| 1f | `src/components/astro/*` or `src/components/preact/*` | Fix any issues found (likely zero — see research.md R6) | spec FR-009; research.md R6 |

### Phase 2: Test Configuration (User Story 5 — P1)

Update the WebKit regression config to use iPhone 15 as proxy for iPhone 17. _(See [research.md R1](research.md#r1-playwright-device-preset-for-iphone-17) for device mapping rationale.)_

| Step | File | What | References |
|------|------|------|------------|
| 2a | `playwright.webkit.config.ts` | Change `devices['iPhone 13 mini']` → `devices['iPhone 15']` (line 17) | spec FR-004; research.md R1 |
| 2b | `playwright.webkit.config.ts` | Update project name `'webkit-iphone13mini'` → `'webkit-iphone15'` (line 16) | spec FR-004 |
| 2c | `playwright.webkit.config.ts` | Update comments: "iPhone 13 mini" → "iPhone 15 (proxy for iPhone 17)", "375×812" → "393×852" (lines 4, 6) | spec FR-004, FR-013 |

### Phase 3: E2e Viewport Updates (User Story 5 — P1)

Update `setViewportSize()` calls in e2e tests that use 375×812 as the primary mobile viewport. _(See [research.md R2](research.md#r2-viewport-dimensions--screen-vs-toolbar-adjusted) for screen-vs-toolbar viewport convention and [R3](research.md#r3-language-switcher-375-px-breakpoint) for which tests NOT to change.)_

| Step | File | What | References |
|------|------|------|------------|
| 3a | `tests/e2e/responsive-context-adaptation.spec.ts` | Line 23: `375, 812` → `393, 852` (primary target test) | spec FR-005; research.md R2 |
| 3b **[P]** | `tests/e2e/hardening-touch-target-and-heading-shell.spec.ts` | Line 35: `375, 812` → `393, 852` | spec FR-005; research.md R2 |
| 3c **[P]** | `tests/e2e/typography-system-normalization.spec.ts` | Line 113: `375, 812` → `393, 852` | spec FR-005; research.md R2 |
| 3d **[P]** | `tests/e2e/compare-tray-interaction.spec.ts` | Lines 169, 172: `375, 812` → `393, 852`; update test name from "375×812" to "393×852" | spec FR-005; research.md R2 |
| 3e **[P]** | `tests/e2e/comparison-page-route-shell.spec.ts` | Lines 392, 395: `375, 812` → `393, 852`; update test name from "375×812" to "393×852" | spec FR-005; research.md R2 |
| 3f | `tests/e2e/comparison-page-mobile-webkit.spec.ts` | Update comments only: "iPhone 13 mini" → "iPhone 17 (via iPhone 15 preset)", "375×812" → "393×852", "375 px" → "393 px" (lines 5, 8, 16, 21) | spec FR-005, FR-013; research.md R1 |
| 3g | `tests/e2e/language-switcher-navigation.spec.ts` | **NO CHANGE** — tests 375 px breakpoint behavior (narrow-viewport edge case, not primary target) | spec FR-010; research.md R3 |
| 3h | — | Run `pnpm test:e2e` — verify all updated tests pass | spec SC-002 |

### ~~Phase 4: Visual Regression Baselines~~ _Removed_

_Visual regression tests were deleted from the project. This phase is no longer applicable._

### Phase 5: Documentation Updates (User Story 4 — P2)

Update all project documentation to reference iPhone 17 as the primary target. iPhone 13 mini is mentioned only as the lower bound of the supported range.

| Step | File | What | References |
|------|------|------|------------|
| 5a | `docs/prd.md` | Lines 160, 198, 328: replace "iPhone 13 mini" with "iPhone 17 (393×852)" as primary target; add "responsive down to iPhone 13 mini (375 px)" where appropriate | spec FR-006 |
| 5b **[P]** | `docs/implementation-plan-phase-1.md` | Lines 558, 569, 573: replace "375px/375×812/iPhone 13 mini" with "393×852/iPhone 17" context | spec FR-006 |
| 5c **[P]** | `.github/copilot-instructions.md` | Line 131: "WebKit/iPhone 13 mini" → "WebKit/iPhone 17 (via iPhone 15 preset)"; Line 162: "iPhone 13 mini viewport" → "iPhone 17 viewport (393×852), responsive range 320–430 px" | spec FR-006, FR-013 |
| 5d | `.impeccable.md` | Optional: add "iPhone 17 (393 px) is the primary target" to the phone portrait range description (currently says "320-430px" generically) | spec FR-007 |

### Phase 6: SVG Mockups & Historical Specs (User Story 4 — P2)

Update SVG canvas dimensions and spec documentation references. _(See [research.md R4](research.md#r4-svg-mockup-updates--internal-coordinates) for SVG update rationale.)_

| Step | File | What | References |
|------|------|------|------------|
| 6a | `docs/mockups/homepage.svg` | `viewBox="0 0 375 812"` → `viewBox="0 0 393 852"`, update `width`/`height` attributes | spec FR-008; research.md R4 |
| 6b **[P]** | `docs/mockups/comparison-view.svg` | Same viewBox/dimension update | spec FR-008; research.md R4 |
| 6c **[P]** | `docs/mockups/preschool-details.svg` | Same viewBox/dimension update | spec FR-008; research.md R4 |
| 6d **[P]** | `docs/mockups/shortlist.svg` | Same viewBox/dimension update | spec FR-008; research.md R4 |
| 6e | `specs/001-multi-locale-routes/plan.md` | Line 16: "iPhone 13 mini" → "iPhone 17 (393 px)" | spec FR-012 |
| 6f **[P]** | `specs/002-language-switcher/plan.md` | Line 16: same update | spec FR-012 |
| 6g **[P]** | `specs/002-language-switcher/research.md` | Lines 54, 68, 72: update primary target context to iPhone 17; preserve 375 px cutoff as narrow-viewport threshold (it's a responsive breakpoint, not the primary target) | spec FR-012; research.md R3 |
| 6h **[P]** | `specs/002-language-switcher/quickstart.md` | Lines 175, 189, 190: update context around 375 px to clarify it's a narrow-viewport threshold | spec FR-012 |
| 6i **[P]** | `specs/002-language-switcher/tasks.md` | Lines 48, 53: update primary target context | spec FR-012 |
| 6j **[P]** | `specs/002-language-switcher/spec.md` | Line 91: update context for FR-014 — 375 px is a narrow-viewport threshold, not the primary target | spec FR-012; research.md R3 |
| 6k **[P]** | `specs/003-arabic-rtl-layout/plan.md` | Line 16: "iPhone 13 mini" → "iPhone 17 (393 px)" | spec FR-012 |
| 6l **[P]** | `specs/004-preschool-queue-links/plan.md` | Line 21: same update | spec FR-012 |
| 6m **[P]** | `specs/004-preschool-queue-links/tasks.md` | Line 119: update viewport reference and device name | spec FR-012 |
| 6n **[P]** | `specs/006-share-ui/plan.md` | Line 16: same update | spec FR-012 |

### Phase 7: Full Validation

| Step | File | What | References |
|------|------|------|------------|
| 7a | — | Run `pnpm validate` — all quality gates pass (lint, lint:md, format, check, test, build, e2e, Lighthouse) | spec SC-006, SC-007 |
| 7b | — | Run `pnpm test:e2e:webkit` — WebKit regression passes | spec SC-003 |
| 7c | — | Grep codebase: zero "iPhone 13 mini" as "primary target" remaining | spec SC-004 |

## Requirements Traceability

| FR | Implementation | Phase | Design Reference |
|----|---------------|-------|-----------------|
| FR-001 | All phases — cumulative effect of switching primary target | 1–7 | — |
| FR-002 | Phase 1 visual audit confirms no overflow at 320–430 px | 1 | research.md R5, R6 |
| FR-003 | Phase 3 — e2e tests use 393×852 as primary mobile viewport | 3 | research.md R2 |
| FR-004 | Phase 2 — `playwright.webkit.config.ts` device preset update | 2 | research.md R1 |
| FR-005 | Phase 3 — `setViewportSize()` updates in 5 test files + webkit comments | 3 | research.md R2, R3 |
| FR-006 | Phase 5 — `prd.md`, `implementation-plan-phase-1.md`, `copilot-instructions.md` | 5 | — |
| FR-007 | Phase 5, step 5d — `.impeccable.md` optional update | 5 | — |
| FR-008 | Phase 6, steps 6a–6d — SVG viewBox/dimension updates | 6 | research.md R4 |
| FR-009 | Phase 1 — visual audit + CSS fixes; Phase 7 — `pnpm validate` | 1, 7 | research.md R5, R6 |
| FR-010 | Phase 3, step 3g — `language-switcher-navigation.spec.ts` explicitly NOT changed | 3 | research.md R3 |
| FR-011 | Phase 4 — delete old baselines, regenerate at 393×852 | 4 | spec Clarification Q2 |
| FR-012 | Phase 6, steps 6e–6n — historical spec file updates | 6 | — |
| FR-013 | Phase 2 (step 2c) + Phase 5 (step 5c) — copilot instructions for webkit test | 2, 5 | research.md R1 |

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
