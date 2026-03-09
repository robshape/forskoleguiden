# Codebase Cleanup Round 2 — LLM AI Coding Principles Alignment

**Date**: 2026-03-09
**Previous cleanup**: `docs/plans/completed/codebase-cleanup-plan.md` (2026-03-06, fully resolved)
**Scope**: Fresh full-codebase review against LLM-optimized coding principles (regenerability, flat/explicit structure, predictable patterns, minimal coupling, reduced context noise).

**Overall assessment**: The codebase is in good shape. The previous cleanup resolved all its items. The source code itself (`src/`) is clean, well-structured, and follows the LLM AI coding principles closely. The main issues this round are **documentation noise** (completed plan files polluting `docs/plans/`) and a **shared-constant miss** that will create drift when Step 7 lands.

---

## High Priority

### 1. Archive completed plan documents to `docs/plans/completed/`

**Problem**: `docs/plans/` has 19 files at the top level. Of those, 15 are historical artifacts from already-completed steps (husky, step-6-1, step-6-2, restore-pnpm-check). A future LLM agent reading the workspace wastes context on these and may confuse completed work with active plans. The `completed/` subdirectory already exists and holds the step-5 archives, but the newer completed files were never moved.

**Files to move** (all `*-complete.md`, `*-phase-*-complete.md`, and their associated `-plan.md` files for finished steps):

- `add-husky-pre-commit-validate-hook-complete.md`
- `add-husky-pre-commit-validate-hook-phase-1-complete.md`
- `add-husky-pre-commit-validate-hook-phase-2-complete.md`
- `add-husky-pre-commit-validate-hook-phase-3-complete.md`
- `add-husky-pre-commit-validate-hook-plan.md`
- `implement-step-6-1-preschool-detail-page-complete.md`
- `implement-step-6-1-preschool-detail-page-phase-1-complete.md`
- `implement-step-6-1-preschool-detail-page-phase-2-complete.md`
- `implement-step-6-1-preschool-detail-page-phase-3-complete.md`
- `implement-step-6-1-preschool-detail-page-plan.md`
- `implement-step-6-2-preschool-detail-response-breakdown-complete.md`
- `implement-step-6-2-preschool-detail-response-breakdown-phase-1-complete.md`
- `implement-step-6-2-preschool-detail-response-breakdown-phase-2-complete.md`
- `implement-step-6-2-preschool-detail-response-breakdown-phase-3-complete.md`
- `implement-step-6-2-preschool-detail-response-breakdown-plan.md`
- `restore-pnpm-check-node-types-phase-1-complete.md`
- `restore-pnpm-check-node-types-phase-2-complete.md`
- `restore-pnpm-check-node-types-plan.md`
- `codebase-cleanup-plan.md` (fully resolved — archive it)

**After this move**, `docs/plans/` should contain only this file and any future active plans.

**Principle**: Predictable structure — reduce noise so LLM agents find current work fast.

### 2. Import `OVERALL_ASSESSMENT_GROUP` constant in detail page

**Problem**: `src/pages/sv/forskola/[id].astro` hardcodes the string `'Helhetsbedömning'` to find the question group, but `src/lib/scoring.ts` already exports the same string as `OVERALL_ASSESSMENT_GROUP`. Two places define the same magic string independently. If the group name ever changes, the detail page breaks silently.

**Action**: Replace the inline string in `[id].astro` with an import of `OVERALL_ASSESSMENT_GROUP` from `@/lib/scoring`.

**Principle**: Regenerability — a single source of truth for domain constants means any file can be rewritten without introducing string drift.

### 3. Extract `RESPONSE_ROWS` mapping to a shared module

**Problem**: `src/pages/sv/forskola/[id].astro` defines a `RESPONSE_ROWS` array that maps `SurveyResponse` field names to i18n keys. This is the canonical mapping for rendering the five-category response breakdown. When Step 7 builds the `/sv/jamfor/` comparison page, it will almost certainly need the same mapping. Keeping it page-local means the compare page will either duplicate it or import from a page file (which is not a clean dependency).

**Action**: Move `RESPONSE_ROWS` to a new shared module (e.g., `src/lib/survey-responses.ts`). The detail page and the future compare page both import from there.

**Principle**: Structure principle #4 — "Duplication that requires the same fix in multiple places is a code smell, not a pattern to preserve." Also regenerability — the mapping is a data declaration that should live in `src/lib/` alongside the types it references.

---

## Medium Priority

### 4. Trim completed task files in `docs/memory-bank/tasks/`

**Problem**: The `tasks/` folder contains 16 individual task files, all with "Completed" status. Each file includes full thought process, implementation plans, and progress logs. For a fresh LLM agent loading the memory bank, this is a lot of context to parse with zero actionable value. The `_index.md` already lists all completed tasks with dates, which is sufficient for historical reference.

**Action**: Consider one of these approaches:

- (a) Delete the individual completed task files since `_index.md` preserves the summary. Keep task files only for in-progress or pending work.
- (b) Create a `tasks/completed/` subdirectory and move them there, mirroring the `docs/plans/completed/` pattern.

Option (a) is cleaner. Option (b) preserves history at the cost of clutter.

**Principle**: Predictable structure — task tracking should surface active work, not historical artifacts.

### 5. Add `about.body` i18n key to English and Arabic locale files

**Problem**: The `about.body` key appears in `sv.json` but may not have equivalent translations in `en.json` and `ar.json`. The i18n key-parity unit test enforces identical key structures across all three locale files, so if the key is missing, tests would fail. However, a placeholder in English/Arabic (e.g., the same Swedish text or a `TODO:` marker) would satisfy the test while flagging the translation gap.

**Action**: Verify that `about.body` exists in all three locale files. If not, add placeholder entries. (This may already be resolved — the key-parity test passing suggests it is.)

**Principle**: Predictable patterns — every i18n key present in one locale file should exist in all three.

### 6. Consider whether `src/pages/sv/om/index.astro` should be documented as test infrastructure

**Problem**: The `/sv/om/` about page was added in Step 5.4 specifically as an MPA navigation target for cross-page persistence e2e tests. It renders minimal content (a heading and one paragraph). It's not clear from the code alone whether this is intended as a real product page or test infrastructure.

**Action**: Either:

- (a) Add a comment at the top of the file explaining its purpose (MPA navigation target + about page).
- (b) Accept it as a real (if minimal) about page that doubles as a test target.

Option (b) is probably fine — the page uses proper layout and i18n patterns, and it's a reasonable feature for a real site. No code change needed, just a note here for future reference.

**Principle**: Naming and comments — note invariants and assumptions.

---

## Lower Priority

### 7. Reduce `docs/plans/` phase-file granularity for future steps

**Problem**: Past steps generated 4–5 files each (plan, phase-1-complete, phase-2-complete, phase-3-complete, complete). This is 20+ files per feature across the project lifetime. The phase-by-phase files capture intermediate state that has no value once the step is done.

**Action**: For future steps, consider producing only two files:

- `step-N-plan.md` (the plan, updated in-place as phases complete)
- `step-N-complete.md` (the final summary)

This reduces per-step file count from 5 to 2. The plan file can include a progress section that tracks phase completions without needing separate files.

**Principle**: Regenerability — fewer files means less context for future agents to load and less opportunity for stale documentation.

### 8. Review `docs/memory-bank/` for stale "next steps"

**Problem**: `activeContext.md` and `progress.md` both reference "Next Focus: implement Step 7" as the planned work. This is accurate but hasn't changed since the Step 6.2 completion. If the project pauses, a returning LLM agent will pick up where things left off, which is correct behavior.

**Action**: No change needed now. After Step 7 begins, update both files.

**Principle**: No change for the sake of change — this is working as designed.

---

## No Change Needed

These areas are well-aligned with LLM AI coding principles:

- **`src/lib/` module organization** — types, data, scoring, state, constants, base-path are clean single-purpose files with minimal coupling
- **Type definitions** (`src/lib/types.ts`) — flat, descriptive, no unnecessary generics
- **Error handling** (`src/lib/data.ts`) — contextual error messages with file paths, exactly what LLM debugging needs
- **Astro/Preact island split** — correct use of islands architecture, static by default, interactive only where needed
- **Nanostore state management** (`src/lib/state.ts`) — SSR-safe, persistence-safe, well-tested, singleton pattern is necessary and well-documented
- **i18n utils and locale files** — clean, flat, interpolation works, key-parity enforced by tests
- **Testing structure** — BDD-style names, shared helpers, contract tests, follows KCD Testing Trophy principles
- **CI/CD workflows** — reusable quality-gates pattern, Dependabot auto-merge, supply-chain security settings
- **Configuration files** — all clean, minimal, no unused config blocks
- **Preact islands** (CompareButton, CompareTray, SortToggle) — well-scoped, receive pre-localized strings from Astro, minimal runtime logic
- **`BaseLayout.astro`** — clean shell with proper semantic structure, build-time route detection for tray CTA
- **`PreschoolCard.astro`** — proper component composition with score badge tone logic
- **Global CSS** — clean Tailwind v4 `@theme` token definitions
- **Package.json** — exact version pins, proper engine constraints, correct script definitions

---

## Summary

| Priority | Item                                             | Type                | Effort       |
| -------- | ------------------------------------------------ | ------------------- | ------------ |
| High     | Archive 19 completed plan docs to `completed/`   | Reduce noise        | Small        |
| High     | Import `OVERALL_ASSESSMENT_GROUP` in detail page | Fix constant drift  | Trivial      |
| High     | Extract `RESPONSE_ROWS` to shared module         | Prepare for Step 7  | Small        |
| Medium   | Trim completed task files in memory-bank         | Reduce noise        | Small        |
| Medium   | Verify `about.body` i18n key parity              | Pattern consistency | Trivial      |
| Medium   | Document `/sv/om/` page purpose                  | Clarity             | Trivial      |
| Lower    | Reduce plan-file granularity for future steps    | Process improvement | N/A (future) |
| Lower    | Review memory bank after Step 7 starts           | Maintenance         | N/A (future) |
