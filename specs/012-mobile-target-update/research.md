# Research: Mobile Target Update — iPhone 17

**Feature**: 012-mobile-target-update
**Date**: 2026-03-27

## R1: Playwright Device Preset for iPhone 17

**Decision**: Use `devices['iPhone 15']` as a proxy for iPhone 17 in the WebKit regression config.

**Rationale**: Playwright 1.58.2 (current project version) includes device presets up to iPhone 15 but not iPhone 16 or 17. iPhone 15, 16, and 17 share identical screen dimensions (393×852 CSS pixels) and device scale factor (3×). The `devices['iPhone 15']` preset provides: screen 393×852, viewport 393×659 (minus Safari toolbar), webkit engine, isMobile + hasTouch. This is functionally equivalent to iPhone 17 for testing purposes.

**Alternatives considered**:
- Custom device definition with explicit `{ viewport: { width: 393, height: 852 }, ... }` — rejected because the built-in preset includes user agent string, device scale factor, and touch capabilities that would need manual recreation. Using the built-in preset is more maintainable and automatically correct.
- Upgrading Playwright to a version with iPhone 17 — deferred. When Playwright adds iPhone 17 to its registry (likely Playwright 1.60+), the config can trivially switch from `devices['iPhone 15']` to `devices['iPhone 17']`.
- Using `devices['iPhone 15 Pro']` — same screen dimensions (393×852), so equivalent. Standard iPhone 15 chosen for naming simplicity.

## R2: Viewport Dimensions — Screen vs Toolbar-Adjusted

**Decision**: E2e tests that use `setViewportSize()` will use full screen dimensions (393×852), not toolbar-adjusted viewport (393×659).

**Rationale**: The existing codebase consistently uses screen dimensions (375×812) in `setViewportSize()` calls, not the Playwright device viewport (375×629). This represents the full device screen area that mobile CSS renders into (Safari hides the toolbar during scroll). Maintaining this convention ensures consistency and tests the worst-case (smallest visible area) for vertical content.

**Alternatives considered**:
- Using toolbar-adjusted viewport (393×659) — rejected because it would be inconsistent with all existing tests that use 375×812 (not 375×629) and would test a narrower vertical space than the actual device renders.

## R3: Language Switcher 375 px Breakpoint

**Decision**: The 375 px narrow-viewport breakpoint for the language switcher (ISO codes vs full locale names) is not changed.

**Rationale**: The 375 px threshold is a narrow-viewport behavior test, not tied to the primary target device. On the new primary target (393 px), the switcher shows full locale names — which is the expected default behavior. The 375 px test validates the narrow-viewport fallback for smaller devices. Changing this threshold would break the contract for users on older devices.

**Alternatives considered**:
- Moving the threshold to 393 px — rejected because it would cause the language switcher to show ISO codes on the primary target device, degrading UX for the majority of users.
- Removing the threshold entirely — rejected because narrow-viewport users (iPhone SE, older Android) benefit from the compact display.

## R4: SVG Mockup Updates — Internal Coordinates

**Decision**: Update only the `viewBox`, `width`, and `height` attributes on the root `<svg>` element. Do not rescale internal SVG coordinates.

**Rationale**: The 4 affected SVG mockups (`homepage.svg`, `comparison-view.svg`, `preschool-details.svg`, `shortlist.svg`) use coordinate systems that match the old 375×812 canvas. Updating the viewBox to 393×852 will slightly stretch the content proportionally (4.8% wider, 4.9% taller). Since these are design reference mockups (not production assets rendered to users), proportional stretching is acceptable. The mockups remain useful as directional guides at the new dimensions.

**Alternatives considered**:
- Re-authoring mockups from scratch at 393×852 — rejected as disproportionate effort for internal documentation artifacts. The value of mockups is directional, not pixel-perfect.
- Keeping mockups at 375×812 with a "legacy viewport" note — rejected because it contradicts FR-008 and leaves stale artifacts.

## R5: Visual Audit Scope

**Decision**: Perform a manual visual audit of all 3 page types (directory, detail, comparison) at the new primary viewport (393×852) and fix any discovered issues.

**Rationale**: Per clarification Q1 (audit & fix), the 18 px width increase from 375→393 could reveal minor layout issues: slightly different text wrapping, spacing that feels loose, or content that now fits differently in the wider area. While the existing responsive CSS (fluid Tailwind utilities) handles this range well, visual verification ensures the primary target experience is intentionally designed, not just accidentally acceptable.

**Approach**:
1. Build the site (`pnpm build`)
2. Preview at 393×852 in browser DevTools
3. Check each page type for: horizontal overflow, text wrapping oddities, spacing imbalance, touch target sizing, content alignment
4. Fix any issues found (likely zero or minor spacing tweaks)
5. Run `pnpm validate` to confirm no regressions

## R6: Existing Responsive CSS Assessment

**Decision**: No new CSS breakpoints or framework changes are needed.

**Rationale**: The existing Tailwind v4 responsive system uses `sm:` (640px), `md:` (768px), `lg:` (1024px) breakpoints. The 320–430 px mobile range falls entirely below `sm:`, meaning all "base" (mobile-first) styles apply uniformly across the entire supported mobile range. The 18 px increase from 375→393 does not cross any breakpoint boundary. `src/styles/global.css` has no hardcoded pixel values related to viewport width. `src/layouts/BaseLayout.astro` uses `<meta content="width=device-width, viewport-fit=cover" name="viewport" />` — no hardcoded viewport dimensions.

**Alternatives considered**: None needed — the architecture already supports the target range by design.
