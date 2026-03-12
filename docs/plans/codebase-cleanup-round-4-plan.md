# Codebase Cleanup Round 4 — LLM AI Coding Principles Alignment

**Date**: 2026-03-12
**Scope**: Full codebase audit against LLM AI coding principles (structure, regenerability, naming, architecture)
**Prior cleanups**: Round 1 (2026-03-06), Round 2 (2026-03-09), Round 3 (2026-03-11) — all completed

## Summary

The source code (`src/`) is well-structured and closely aligned with the principles. Most findings are about documentation debt, one structural refactor in the largest component, and one data-layer coupling risk. Nothing is broken — this is about making the codebase easier for LLMs to navigate, regenerate, and extend.

---

## High Priority

### 1. Archive 22 stale plan files from `docs/plans/` root

**Principle**: Structure — consistent, predictable layout; simple entry points

`docs/plans/` currently has 22 step-8.x plan/complete files sitting alongside the active cleanup plans. Round 3 identified this but the files were never moved.

**Action**: Move all `step-8-*` and `implement-step-8-*` files from `docs/plans/` into `docs/plans/completed/`. This leaves only active/current plans in the root.

**Files to move** (all 22):

- `implement-step-8-1-comparison-svg-chart-complete.md`
- `implement-step-8-1-comparison-svg-chart-plan.md`
- `implement-step-8-2-chart-pattern-refinement-complete.md`
- `implement-step-8-2-chart-pattern-refinement-phase-1-complete.md`
- `implement-step-8-2-chart-pattern-refinement-phase-2-complete.md`
- `implement-step-8-2-chart-pattern-refinement-phase-3-complete.md`
- `implement-step-8-2-chart-pattern-refinement-plan.md`
- `step-8-2-chart-hardening-complete.md`
- `step-8-2-chart-hardening-phase-1-complete.md`
- `step-8-2-chart-hardening-phase-2-complete.md`
- `step-8-2-chart-hardening-phase-3-complete.md`
- `step-8-2-chart-hardening-plan.md`
- `step-8-3-chart-legend-complete.md`
- `step-8-3-chart-legend-hardening-complete.md`
- `step-8-3-chart-legend-hardening-plan.md`
- `step-8-3-chart-legend-plan.md`
- `step-8-4-corrective-follow-up-plan.md`
- `step-8-4-table-fallback-complete.md`
- `step-8-4-table-fallback-plan.md`
- `step-8-5-chart-aria-wiring-complete.md`
- `step-8-5-chart-aria-wiring-plan.md`
- `codebase-cleanup-round-3-plan.md` (also completed)

After this, `docs/plans/` root contains only `codebase-cleanup-round-4-plan.md` and the `completed/` folder.

---

### 2. Extract chart visual metadata from `BarChart.tsx` into a shared module

**Principle**: Regenerability — any file can be rewritten without breaking the system; Structure — identify shared structure first

`BarChart.tsx` is 281 lines and combines three concerns:

1. **Chart pattern definitions** (`PatternDef` type, `RESPONSE_SERIES` constant, `renderPatternContent()` helper)
2. **SVG chart rendering** (the main bar chart)
3. **Legend + data table rendering** (adjacent UI to the chart)

The pattern metadata (`RESPONSE_SERIES`) is a parallel array to `RESPONSE_ROWS` in `survey-responses.ts` — both map response fields in the same order but are defined independently. If someone adds or reorders a response category in one, the other silently drifts.

**Action**: Create `src/lib/chart-patterns.ts` containing:

- `PatternDef` type
- `RESPONSE_SERIES` array (importing `RESPONSE_ROWS` and extending each entry with its `pattern`)
- `renderPatternContent()` function
- `TILE_SIZE` constant

This makes `BarChart.tsx` purely a rendering component (~180 lines) and eliminates the parallel-array coupling risk. The legend swatch rendering in BarChart would import from the same module.

---

### 3. Unify `RESPONSE_SERIES` field ordering with `RESPONSE_ROWS`

**Principle**: Architecture — minimize coupling so files can be safely regenerated

Currently `RESPONSE_SERIES` in `BarChart.tsx` and `RESPONSE_ROWS` in `survey-responses.ts` independently define the same five fields in the same order. This works today but is a silent coupling — if one changes, there's no compile-time guard.

**Action** (part of item 2 above): Build `RESPONSE_SERIES` by mapping over `RESPONSE_ROWS` and attaching pattern metadata. This makes `RESPONSE_ROWS` the single source for field ordering.

```ts
// src/lib/chart-patterns.ts
import { RESPONSE_ROWS } from '@/lib/survey-responses'

const PATTERN_DEFS: PatternDef[] = [
  { type: 'solid', bg: '#1d4ed8' },
  { type: 'diagonal', bg: '#93c5fd', stripe: '#1d4ed8' },
  // ...
]

export const RESPONSE_SERIES = RESPONSE_ROWS.map((row, i) => ({
  field: row.field,
  pattern: PATTERN_DEFS[i],
}))
```

---

## Medium Priority

### 4. Delete completed task files in `docs/memory-bank/tasks/`

**Principle**: Structure — simple entry points; Regenerability — declarative configuration

There are 28 completed task files in the tasks folder. The `_index.md` already contains the full task list with statuses. The individual completed task files are historical narratives that add workspace noise without aiding future LLM work.

**Action**: Delete all task files for completed tasks (keep `_index.md` and any in-progress/pending task files). If a task is ever reopened, a new file can be created.

### 5. Trim `docs/memory-bank/activeContext.md`

**Principle**: Regenerability — clear, declarative configuration

The active context file carries 11 "active decisions" many of which are now settled architectural patterns documented in `systemPatterns.md`. Keeping both creates redundancy — an LLM reads both files and gets duplicate information.

**Action**: Reduce active decisions to only those that are genuinely still in flux (likely 2-3). Move settled patterns to `systemPatterns.md` if not already there.

### 6. Inline SVG deduplication in `CityYearSelector.astro`

**Principle**: Structure — identify shared structure; avoid duplication requiring same fix in multiple places

The lock icon SVG path is copy-pasted twice (Stockholm and Göteborg buttons). If the icon changes, both must be updated.

**Action**: Extract the lock SVG into a variable in the Astro frontmatter or a small `LockIcon` fragment, then reference it in both buttons.

---

## Lower Priority

### 7. Fix incorrect pre-commit documentation

**Principle**: Quality — deterministic behavior; Logging and Errors — explicit

Multiple documentation files incorrectly stated that `.husky/pre-commit` runs `lint-staged` + `pnpm check`. The actual hook only runs `pnpm exec lint-staged`. The `lint-staged` config itself includes `astro check` for `.ts/.tsx/.astro` files, so type checking does happen — but via lint-staged, not as a separate `pnpm check` step.

**Action**: Update all references in `.github/copilot-instructions.md`, `docs/memory-bank/systemPatterns.md`, and `docs/memory-bank/progress.md` to reflect the actual pre-commit behavior.

### 8. Consider deleting all `docs/plans/completed/` contents

**Principle**: Regenerability — write code so any file can be rewritten without breaking the system

After archiving, there will be ~47 completed plan files. These are purely historical — they document what was done, not what should be done. No source code depends on them. An LLM scanning the workspace sees 47 files that could generate confusion.

**Action**: Delete all files in `docs/plans/completed/` or convert to a single `CHANGELOG.md` summary. This is optional and depends on whether you want to preserve the historical record.

---

## No Changes Needed

These areas were reviewed and are well-aligned:

- **`src/lib/` modules** — Small, focused, flat. Each file is independently regenerable. Good naming.
- **Preact islands** (`CompareButton`, `CompareTray`, `SortToggle`) — Clean, small components with clear prop contracts.
- **`ComparisonView.tsx`** (189 lines) — Borderline large but acceptable as a single view component. The repeated `OVERALL_ASSESSMENT_GROUP` find is fine — extracting it would add indirection without reducing complexity.
- **State management** (`state.ts`) — Well-documented window global, SSR guards, clean API surface.
- **i18n** — Clean utility with proper interpolation. JSON structure is flat and consistent.
- **Type definitions** (`types.ts`) — Flat, explicit types. No over-abstraction.
- **Test organization** — BDD-style names, behavior-focused tests, shared helpers in `tests/unit/helpers/`.
- **Config files** (`astro.config.ts`, `vitest.config.ts`, `eslint.config.js`, `tsconfig.json`) — Minimal and correct.
- **CI/CD** — Clean reusable workflow pattern. No changes needed.
- **`global.css`** — Clean Tailwind v4 theme tokens. Minimal custom CSS.
