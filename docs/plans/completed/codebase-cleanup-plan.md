# Codebase Cleanup Plan — LLM AI Coding Principles Alignment

**Date**: 2026-03-06
**Scope**: Full codebase review against LLM-optimized coding principles (regenerability, flat/explicit structure, predictable patterns, minimal coupling).

**Overall assessment**: The codebase is well-structured. Types, data loading, scoring, i18n, and the Astro/Preact island split are clean and predictable. Most files can be understood and rewritten independently. The items below are the few areas where alignment can improve.

---

## High Priority

### 1. Archive completed plan documents

**Problem**: `docs/plans/` contains 18 files for already-completed steps (5.1–5.4). A future LLM agent reading the workspace will waste context on historical artifacts and may confuse completed work with active plans.

**Action**: Move all `step-5-*-complete.md` and `step-5-*-phase-*-complete.md` files into `docs/plans/completed/`. Keep only active or upcoming plan files at the top level.

**Principle**: Predictable structure — reduce noise so agents find current work quickly.

### 2. Remove unused `lz-string` dependency

**Problem**: `lz-string` is listed in `dependencies` in `package.json` but is not imported anywhere in the codebase. It was added for planned future URL sharing but doesn't exist yet.

**Action**: Remove `lz-string` from `package.json` and run `pnpm install`. Re-add it when the sharing feature is actually built.

**Principle**: Regenerability — unused dependencies confuse agents about what's in use. An LLM may try to use `lz-string` incorrectly or add it to a feature where it doesn't belong.

### 3. Fix hardcoded Swedish text in `/sv/om/` page

**Problem**: `src/pages/sv/om/index.astro` has inline Swedish text (`"Förskoleguiden använder officiella enkätresultat..."`) instead of using the `t()` function. Every other component in the project uses `t()` for user-facing text.

**Action**: Move the about-page copy to `about.text` (or a new `about.body` key) in all three locale JSON files and use `t()` in the template.

**Principle**: Predictable patterns — all user-facing text goes through `t()`. An LLM copying this page as a template will carry the bad pattern forward.

---

## Medium Priority

### 4. Delete unused `data/template.json`

**Problem**: `data/template.json` is a reference template showing the shape of preschool survey JSON. It is not imported or used by any code. The canonical shape is defined in `src/lib/types.ts` and enforced by `tests/unit/malmo-survey-files-contract.test.ts`.

**Action**: Delete `data/template.json`. If you want a schema reference, the types file and the test contract serve that purpose.

**Principle**: Regenerability — dead files create ambiguity about the source of truth. An LLM may try to keep `template.json` and `types.ts` in sync when only one matters.

### 5. Remove premature `@astrojs/sitemap` integration

**Problem**: `@astrojs/sitemap` is configured in `astro.config.ts` and installed as a dependency, but the site is not live yet and there's no sitemap customization. It adds build overhead and import surface for no current benefit.

**Action**: Remove `sitemap()` from `astro.config.ts` integrations and uninstall `@astrojs/sitemap`.

**Principle**: Minimal coupling — don't ship what you don't use yet.

### 6. Use `t()` for brand text in Nav.astro

**Problem**: `Nav.astro` hardcodes the string `"Förskoleguiden"` for the brand link text. Every other user-facing string in the codebase goes through `t('...', locale)`. The `site.title` key already exists in all three locale JSONs.

**Action**: Replace the hardcoded string with `{t('site.title', locale)}`.

**Principle**: Predictable patterns — consistent use of `t()` for all visible text.

### 7. Consolidate ad-hoc string interpolation in Preact islands

**Problem**: `CompareButton.tsx` has its own `interpolateAriaLabel()` function, and `CompareTray.tsx` does a manual `.replace('{count}', ...)`. Both duplicate the template interpolation logic that already exists in `src/i18n/utils.ts` (`interpolateTemplate`). However, neither island imports the i18n module — they receive pre-localized strings from Astro as props (which is the correct pattern for keeping islands dumb).

**Action**: Pre-interpolate these strings on the Astro side before passing them as props, so islands don't need any interpolation logic. For the aria label template in `CompareButton`, this requires a design decision — the label changes dynamically based on selected state, so either:

- (a) Pass two separate pre-interpolated aria labels (`addAriaLabel` and `addedAriaLabel`) instead of a template + runtime interpolation, OR
- (b) Accept the current pattern as a reasonable trade-off since the island needs to interpolate at runtime based on state.

Option (b) is probably fine. The tray's `.replace('{count}', ...)` is the lower-hanging fruit since it's simpler to pre-build from the Astro side with a known count pattern. However, the count changes dynamically too, so the same trade-off applies.

**Recommendation**: Leave this as-is for now. The current approach (pass template strings, interpolate in the island) is an acceptable pattern when dynamic state determines the output. Document this as a **conscious decision** in `systemPatterns.md` so future agents don't try to "fix" it.

---

## Lower Priority

### 8. Add invariant comment to `SortToggle.tsx` DOM manipulation

**Problem**: `SortToggle.tsx` directly manipulates the server-rendered `<ul>` DOM (via `appendChild`, `textContent`) from within a Preact island. This is a deliberate pattern — the island reorders Astro-rendered HTML rather than re-rendering the list in Preact. But there's no comment explaining why.

**Action**: Add a one-line comment at the top of `applySort()`:

```typescript
// Reorders server-rendered list items in-place. This is intentional — the list is
// pre-rendered by Astro at build time and the island only changes their DOM order.
```

**Principle**: Regenerability — LLM agents need to understand non-obvious invariants to safely rewrite this file.

### 9. Resolve Astro i18n config vs manual routing

**Problem**: `astro.config.ts` includes Astro's built-in `i18n` configuration block (`locales`, `defaultLocale`, `routing.prefixDefaultLocale`), but the project uses manual file-based routing (`src/pages/sv/`, `src/pages/en/`, etc.) rather than Astro's i18n routing features. The config block currently has no effect on routing but may confuse an LLM agent into thinking Astro's i18n middleware is active.

**Action**: Either remove the `i18n` block from `astro.config.ts` (since it's not driving behavior) or add a comment explaining it's declarative metadata only. The former is cleaner.

**Principle**: Flat, explicit architecture — config should reflect actual behavior.

### 10. Clean up `src/features/` documentation references

**Problem**: `copilot-instructions.md` and `systemPatterns.md` reference `src/features/` as a planned directory, but it doesn't exist. No current code lives there.

**Action**: Either create `src/features/.gitkeep` as a placeholder, or remove the references until the directory is actually needed.

**Principle**: Predictable structure — docs should match reality.

---

## No Change Needed

The following areas are already well-aligned and do not need changes:

- **`src/lib/` module organization** — types, data, scoring, constants, state, base-path are clean, single-purpose files.
- **Type definitions** — `src/lib/types.ts` is flat and descriptive.
- **Error handling in `data.ts`** — Contextual error messages with file paths. Exactly what LLM debugging needs.
- **Testing structure** — BDD-style names, shared helpers, contract tests. Follows KCD principles appropriately.
- **Astro/Preact split** — Correct use of islands architecture. Static by default, interactive only where needed.
- **Nanostore state management** — SSR-safe, persistence-safe, well-tested.
- **i18n utils** — Clean, flat, interpolation works correctly.
- **CI/CD workflows** — Reusable quality-gates pattern is solid.
- **`pnpm-workspace.yaml` supply-chain settings** — Good security practice, well-documented.

---

## Summary

| Priority | Item                                | Type                |
| -------- | ----------------------------------- | ------------------- |
| High     | Archive completed plan docs         | Reduce noise        |
| High     | Remove unused `lz-string`           | Remove dead code    |
| High     | Fix hardcoded text in `/sv/om/`     | Pattern consistency |
| Medium   | Delete `data/template.json`         | Remove dead file    |
| Medium   | Remove premature `@astrojs/sitemap` | Remove unused dep   |
| Medium   | Use `t()` in Nav.astro brand text   | Pattern consistency |
| Medium   | Document island interpolation       | Document decision   |
| Lower    | Comment SortToggle DOM pattern      | Invariant comment   |
| Lower    | Resolve Astro i18n config mismatch  | Config clarity      |
| Lower    | Clean up `src/features/` references | Doc accuracy        |
