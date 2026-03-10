# Codebase Cleanup Round 3 — LLM AI Coding Principles Alignment

**Date**: 2026-03-10
**Previous cleanup**: `docs/plans/codebase-cleanup-round-2-plan.md` (2026-03-09, partially resolved)
**Scope**: Full-codebase review against LLM-optimized coding principles (regenerability, flat/explicit structure, predictable patterns, minimal coupling, reduced context noise).

**Overall assessment**: The source code (`src/`) is clean, well-structured, and follows LLM AI coding principles closely. The main problems are **documentation bloat** — 58 plan files and 20 completed task files create substantial context noise for future LLM agents. The round-2 cleanup identified this same issue but only partially resolved it (items 2 and 3 were fixed; item 1 was never executed for Step 7 files). There is also one memory-bank file carrying unnecessary weight from duplicated milestone summaries.

---

## High Priority

### 1. Archive all completed plan documents out of `docs/plans/` root

**Problem**: `docs/plans/` has 21 files at the top level.
Every single one is for completed work (Steps 7.1–7.4 + cleanup round 2). A future LLM agent scanning the workspace will waste context loading these instead of finding active plans immediately.

**Files to move to `docs/plans/completed/`** (all 21):

- `codebase-cleanup-round-2-plan.md`
- All 20 Step 7.x files (`implement-step-7-*`)

**After this move**, `docs/plans/` root should contain only this file and any future active plans.

**Principle**: Structure — reduce context noise so LLM agents find current work fast.

### 2. Delete intermediate phase-complete files across all of `docs/plans/`

**Problem**: Each step generated 3–4 intermediate checkpoint files (`phase-1-complete.md`, `phase-2-complete.md`, etc.). These capture LLM working state from a single session and have zero value after the step is done. Across all steps, there are approximately **50 intermediate files** in `docs/plans/completed/` + root.

Only two files per step have lasting value:

- The `-plan.md` (captures the approach)
- The final `-complete.md` (captures the outcome summary)

**Action**: Delete all `*-phase-*-complete.md` files from both `docs/plans/completed/` and `docs/plans/` root. This reduces the completed archive from ~58 files to ~20.

**Principle**: Regenerability + structure — fewer files means less context waste. These files cannot be regenerated into anything useful and exist only as session artifacts.

### 3. Trim `activeContext.md` to current focus only

**Problem**: `activeContext.md` is ~95 lines, with ~80 lines being a detailed changelog of every completed milestone (Steps 0–7.4). This same information already lives in `progress.md`, creating duplication. When a fresh LLM agent loads the memory bank, it reads both files and processes the same completed milestone summaries twice.

The purpose of `activeContext.md` is "current work focus, recent changes, next steps, active decisions." It should not be a second progress log.

**Action**: Strip `activeContext.md` down to:

- **Current state**: One paragraph summarizing where the project stands
- **Next focus**: What to build next (Steps 8, 9)
- **Active decisions**: Only decisions that affect upcoming work

The full milestone history stays in `progress.md` where it belongs.

**Principle**: Structure — avoid duplication that requires the same update in multiple places. Context efficiency — LLM agents should load the active context file in seconds, not parse a changelog.

---

## Medium Priority

### 4. Clean up `docs/memory-bank/tasks/completed/` individual task files

**Problem**: 20 individual task files in `tasks/completed/` contain full thought processes, implementation plans, and progress logs for finished work. The `_index.md` already provides a one-line summary of each completed task with dates. The individual files add context noise with no actionable value.

**Action**: Delete all files in `docs/memory-bank/tasks/completed/`. The `_index.md` preserves the historical record. Keep individual task files only for in-progress or pending work.

**Principle**: Predictable structure — task tracking should surface active work, not historical artifacts.

### 5. Add a comment to the `state.ts` window global explaining its purpose

**Problem**: `src/lib/state.ts` attaches the compare store to `window.__forskoleguidenCompareStore__`. This is a pragmatic pattern for ensuring a single store instance survives Preact island hydration across MPA navigations and hot module reloads. However, the code has no comment explaining _why_ a window global is used instead of a simple module-level variable.

A future LLM agent regenerating this file might remove the window global thinking it's unnecessary, which would break cross-island state sharing in production.

**Action**: Add a brief comment above `getCompareStoreContainer()` explaining that the window global ensures a single store instance across independently-hydrated Preact islands on the same MPA page.

**Principle**: Naming and comments — note invariants and assumptions that aren't obvious from the code.

### 6. Reduce plan file granularity for future steps

**Problem**: The round-2 cleanup recommended producing only 2 files per step (plan + complete) instead of 5 (plan + 3 phases + complete). This recommendation was not followed for Steps 7.1–7.4, which produced 20 files. The pattern creates predictable documentation debt after each feature.

**Action**: For Steps 8+ and beyond, produce only:

- `step-N-feature-plan.md` (the plan, updated in place as work progresses)
- `step-N-feature-complete.md` (the final summary)

Phase checkpoints should be inline sections within the plan file, not separate documents.

**Principle**: Regenerability — fewer files, less noise, faster context loading.

---

## Lower Priority

### 7. `CityYearSelector.astro` has duplicated lock-icon SVG

**Problem**: The lock icon for disabled city buttons (Stockholm, Göteborg) is the same 5-line SVG block copy-pasted twice. If the icon changes, both copies need the same edit.

**Impact**: Very low. There are only 2 copies, the component is stable, and the SVG is unlikely to change. This is a minor DRY observation, not a pressing concern.

**Action**: Could extract into an Astro snippet or partial, but the cost of the abstraction (new file, new import) may exceed the cost of the duplication. Skip unless the component grows.

**Principle**: Architecture — avoid unnecessary abstractions for two occurrences of a static element.

### 8. `progress.md` is long but accurate

**Problem**: `progress.md` is ~100+ lines covering every step's detailed history. This is by design — it's the canonical historical record. But it will keep growing with each step.

**Impact**: None currently. This file is only read when a full memory-bank review is needed.

**Action**: No change now. If it exceeds ~200 lines, consider splitting into `progress.md` (current status + in-progress steps) and `progress-archive.md` (completed step details).

**Principle**: No change for the sake of change — the file serves its purpose.

---

## No Changes Needed

These areas were reviewed and are well-aligned with LLM AI coding principles:

- **`src/lib/` modules** — Small, focused, independently regenerable. `types.ts`, `data.ts`, `scoring.ts`, `constants.ts`, `base-path.ts`, `state.ts`, `survey-responses.ts` all follow the flat/explicit pattern.
- **Preact islands** — Clean props-in/UI-out pattern. Islands receive pre-localized strings from Astro and don't import i18n utilities directly.
- **Astro pages** — Each page follows the same `BaseLayout` + locale + `t()` pattern consistently.
- **Test structure** — BDD-style naming, shared helpers in `tests/unit/helpers/`, coverage follows "fewer, longer tests" principles.
- **Config files** — Minimal, declarative, no unnecessary complexity.
- **i18n** — Three locale JSONs with identical key structures enforced by unit test.
- **CI/CD** — Clean reusable workflow pattern, no duplication between deploy and dependabot pipelines.
- **`.prettierignore`** — Contains only `pnpm-lock.yaml`. This is legitimate since the lockfile is tracked but should not be formatted. No change needed.
- **`SortToggle.tsx` DOM mutation** — Intentional architectural decision (documented in `systemPatterns.md`) to reorder server-rendered list items without re-rendering them in Preact.
- **`ComparisonView.tsx` complexity** — Handles 3 selection states in one component. Still manageable. Would warrant splitting only if Step 8 chart rendering significantly increases the component size.
