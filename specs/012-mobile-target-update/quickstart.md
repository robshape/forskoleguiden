# Quickstart: Mobile Target Update — iPhone 17

**Feature**: 012-mobile-target-update
**Date**: 2026-03-27

> This quickstart follows the phase sequence defined in [plan.md](plan.md#implementation-phases). Each step below references its corresponding plan phase and relevant research decisions.

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Playwright browsers installed (`pnpm dlx playwright install webkit`)
- On branch `012-mobile-target-update`

## Development Workflow

### 1. Visual audit at new viewport _(Plan Phase 1; [research.md R5](research.md#r5-visual-audit-scope), [R6](research.md#r6-existing-responsive-css-assessment))_

```bash
pnpm build && pnpm preview
```

Open browser DevTools, set viewport to 393×852 (iPhone 17) and visually inspect:
- Directory page: `/forskoleguiden/sv/`
- Detail page: `/forskoleguiden/sv/forskola/<any-id>`
- Comparison page: `/forskoleguiden/sv/jamfor/` (select 3+ preschools first)

Also verify at 430×932 (iPhone 17 Pro Max) and 375×812 (backward compat). Fix any layout or spacing issues found in component files. See plan Phase 1 steps 1b–1f for the full checklist.

### 2. Update WebKit test config _(Plan Phase 2; [research.md R1](research.md#r1-playwright-device-preset-for-iphone-17))_

Update `playwright.webkit.config.ts`:
- Replace `devices['iPhone 13 mini']` with `devices['iPhone 15']` (proxy for iPhone 17 — same 393×852 screen)
- Update project name from `'webkit-iphone13mini'` to `'webkit-iphone15'`
- Update comments to reference iPhone 17 / 393×852

**Why iPhone 15?** Playwright 1.58.2 doesn't include iPhone 17 yet. iPhone 15 has identical screen dimensions (393×852). See [research.md R1](research.md#r1-playwright-device-preset-for-iphone-17).

### 3. Update e2e test viewports _(Plan Phase 3; [research.md R2](research.md#r2-viewport-dimensions--screen-vs-toolbar-adjusted), [R3](research.md#r3-language-switcher-375-px-breakpoint))_

Search for `setViewportSize({ width: 375, height: 812 })` in `tests/e2e/` and update primary target tests to `{ width: 393, height: 852 }`.

**Files to update** (see plan Phase 3 steps 3a–3f for exact line numbers):
- `responsive-context-adaptation.spec.ts` — line 23 (primary viewport only; keep 320px tests unchanged)
- `hardening-touch-target-and-heading-shell.spec.ts` — line 35
- `typography-system-normalization.spec.ts` — line 113
- `compare-tray-interaction.spec.ts` — lines 169, 172 (also update test name)
- `comparison-page-route-shell.spec.ts` — lines 392, 395 (also update test name)
- `comparison-page-mobile-webkit.spec.ts` — update comments only (lines 5, 8, 16, 21)

**Do NOT change** ([research.md R3](research.md#r3-language-switcher-375-px-breakpoint)):
- `language-switcher-navigation.spec.ts` — tests 375 px breakpoint behavior (narrow-viewport edge case)
- Any tests using 320 px width — these test narrow-viewport edge cases

### 4. Regenerate visual regression baselines _(Plan Phase 4; [spec.md FR-011](spec.md#functional-requirements))_

```bash
# Delete old baselines (375×812)
rm tests/e2e/visual-regression.spec.ts-snapshots/*.png

# Regenerate at new viewport (393×852)
pnpm dlx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
```

Old baselines are replaced, not dual-maintained (per spec clarification Q2).

### 5. Update project documentation _(Plan Phase 5; [spec.md FR-006](spec.md#functional-requirements))_

Replace "iPhone 13 mini" as "primary target" with "iPhone 17 (393×852)" in these files (see plan Phase 5 for exact line numbers):
- `docs/prd.md` — lines 160, 198, 328
- `docs/implementation-plan-phase-1.md` — lines 558, 569, 573
- `.github/copilot-instructions.md` — lines 131, 162
- `.impeccable.md` — optional: add "iPhone 17 (393 px)" note to phone portrait range

iPhone 13 mini may still appear as "lower bound of supported range."

### 6. Update SVG mockups _(Plan Phase 6 steps 6a–6d; [research.md R4](research.md#r4-svg-mockup-updates--internal-coordinates))_

Update `viewBox="0 0 375 812"` to `viewBox="0 0 393 852"` and corresponding `width`/`height` attributes in:
- `docs/mockups/homepage.svg`
- `docs/mockups/comparison-view.svg`
- `docs/mockups/preschool-details.svg`
- `docs/mockups/shortlist.svg`

Only the root `<svg>` attributes change — internal coordinates are not rescaled (see [research.md R4](research.md#r4-svg-mockup-updates--internal-coordinates)).

### 7. Update historical spec documentation _(Plan Phase 6 steps 6e–6n; [spec.md FR-012](spec.md#functional-requirements))_

Update "iPhone 13 mini" primary target references in earlier spec files (see plan Phase 6 for exact line numbers):
- `specs/001-multi-locale-routes/plan.md`
- `specs/002-language-switcher/plan.md`, `research.md`, `quickstart.md`, `tasks.md`, `spec.md`
- `specs/003-arabic-rtl-layout/plan.md`
- `specs/004-preschool-queue-links/plan.md`, `tasks.md`
- `specs/006-share-ui/plan.md`

**Important**: In `specs/002-language-switcher/` files, the 375 px threshold is a responsive breakpoint — update the context (device name) but preserve the 375 px value. See [research.md R3](research.md#r3-language-switcher-375-px-breakpoint).

### 8. Full validation _(Plan Phase 7)_

```bash
pnpm validate
```

This runs: lint → lint:md → format → check → test → build → e2e → Lighthouse

### 9. Final verification _(Plan Phase 7)_

```bash
# WebKit regression
pnpm test:e2e:webkit

# Confirm no stale primary target references
grep -rn "iPhone 13 mini" docs/ .github/ --include="*.md" | grep -i "primary"
```

## Key Files

| Category | File | Change Type | Plan Phase |
|----------|------|-------------|------------|
| Test config | `playwright.webkit.config.ts` | Modify device preset | 2 |
| E2e tests | `tests/e2e/*.spec.ts` (6 files) | Update viewport sizes | 3 |
| Visual baselines | `tests/e2e/visual-regression.spec.ts-snapshots/` | Regenerate | 4 |
| Documentation | `docs/prd.md`, `docs/implementation-plan-phase-1.md`, `.github/copilot-instructions.md` | Update references | 5 |
| SVG mockups | `docs/mockups/*.svg` (4 files) | Update viewBox/dimensions | 6 |
| Spec docs | `specs/001-006/` (multiple files) | Update references | 6 |
| CSS/components | `src/components/`, `src/styles/` | Audit; fix if needed | 1 |
