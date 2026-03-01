# Codebase Cleanup Plan — Round 3

**Date:** 2026-03-01
**Scope:** Audit against LLM AI Coding Principles — structure, regenerability, simplicity, quality

## Context

Since the last cleanup (earlier today), Step 2 i18n foundations were implemented: `src/i18n/utils.ts`, three locale JSON files (`sv.json`, `en.json`, `ar.json`), and three i18n test files with a shared test helper. The project now has both the data layer (Step 1) and i18n layer (Step 2) complete. The same step-completion file pattern from rounds 1 and 2 has recurred a third time — 14 new `implement-step-2-*` files appeared in `docs/plans/`.

Additionally, the `.vscode/extensions.json` file from the round 2 fix was not persisted. The `techContext.md` memory bank file references it but it doesn't exist on disk.

---

## High Priority

### 1. Delete the 14 step-completion files in `docs/plans/`

**Principle violated:** Structure — "Use a consistent, predictable project layout."

This is the third time this exact problem has been cleaned up. Step 2 implementation generated 14 new files:

- `implement-step-2-1-swedish-i18n-{plan,phase-1-complete,phase-2-complete,phase-3-complete}.md`
- `implement-step-2-2-placeholder-locales-{plan,complete,phase-1-complete,phase-2-complete,phase-3-complete}.md`
- `implement-step-2-3-i18n-utilities-{plan,complete,phase-1-complete,phase-2-complete,phase-3-complete}.md`
- Plus the `implement-step-2-1-swedish-i18n-complete.md`

These are transient process artifacts. Task progress belongs in `docs/memory-bank/tasks/` only, not as individual completion files.

**Action:** Delete all `docs/plans/implement-step-*` files. The only files that should remain in `docs/plans/` are the two cleanup plans (`cleanup-codebase.md`, `cleanup-codebase-round-2.md`) and this file.

### 2. Create missing `.vscode/extensions.json`

**Principle violated:** Regenerability — "Prefer clear, declarative configuration."

`docs/memory-bank/techContext.md` documents `.vscode/extensions.json` with specific extension recommendations, but the file doesn't exist. The round 2 fix attempted to create it but it wasn't persisted to disk.

**Action:** Create `.vscode/extensions.json` with recommendations: `astro-build.astro-vscode`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`.

---

## Medium Priority

### 3. Fix stale field names in `docs/implementation-plan.md`

**Principle violated:** Naming/Comments — accurate documentation.

The implementation plan uses `*Percentage` suffix (e.g., `completelyAgreePercentage`) in Steps 1.1 and 6.2, but the actual code uses `*Percent` suffix (e.g., `completelyAgreePercent`). It also specifies `totalRespondents: number` on `SurveyQuestion`, but the actual type puts `totalRespondentsPercent: number` on `PreschoolSurvey` instead.

Affected locations:

- Step 1.1 (line ~164): `SurveyResponse` field names
- Step 1.1 (line ~165): `SurveyQuestion` type definition
- Step 1.1 (line ~171): `totalRespondents` rationale
- Step 6.2 (lines ~436-440): response category to field name mapping

These mismatches mean a future agent reading the plan would produce code that doesn't compile. The implementation plan is the primary planning document — it should reflect what was actually built.

**Action:** Update the field name references in `docs/implementation-plan.md` Steps 1.1 and 6.2 to match the actual types in `src/lib/types.ts`.

### 4. Remove inline TODO from `astro.config.ts`

**Principle violated:** Structure — "Simple entry points." Also: task tracking should live in memory-bank, not source code.

`astro.config.ts` contains:

```typescript
// TODO: Step 3.4 — add redirects: { '/': '/sv/' } after replacing src/pages/index.astro.
```

This is already tracked as TASK002 in the memory bank. Inline TODOs in config files create a parallel tracking system that can go stale.

**Action:** Remove the TODO comment. TASK002 already tracks this work.

### 5. Clean up `_index.md` archived task references

**Principle violated:** Naming/Comments — accurate documentation.

The tasks `_index.md` lists TASK003 and TASK004 under "Completed" with a note "(archived — verification-only task)" but no corresponding task files exist. This is confusing: a reader sees them listed but can't find the files for context.

Two clean options:

- **Option A (recommended):** Move TASK003/TASK004 to their own "Archived" section with a note explaining they were verification-only tasks whose files were removed during cleanup.
- **Option B:** Remove them from the index entirely.

**Action:** Add an "Archived" section to `_index.md` and move TASK003/TASK004 there with a brief note.

---

## Low Priority

### 6. Mark planned directories as such in `docs/tech-stack.md`

**Principle violated:** Naming/Comments — accurate documentation.

The architecture tree in `tech-stack.md` shows directories that don't exist yet (`src/layouts/`, `src/components/astro/`, `src/components/preact/`, `src/features/directory/`, `src/features/comparison/`, etc.) without any annotation. A new reader would assume they exist. Compare with `.github/copilot-instructions.md` which correctly uses `[planned]` annotations.

**Action:** Add `# planned` comments to the non-existent directories in the architecture tree, consistent with the copilot-instructions style.

### 7. Duplicated dot-path traversal logic

**Principle violated:** Regenerability — "Write code so any file/module can be rewritten from scratch."

`src/i18n/utils.ts` `t()` and `tests/unit/helpers/i18n.ts` `getByPath()` implement identical dot-separated key lookup algorithms. If a bug were found in the traversal, it would need fixing in two places.

This is low priority because both implementations are 5 lines and independently correct. However, if either needs modification, consider extracting a shared `getByPath` into `src/lib/` and importing it in both places.

**Action:** No change required now. Note for future: if either implementation needs updating, deduplicate at that time.

---

## No Change Needed

These areas are clean and well-aligned:

- **`src/lib/types.ts`** — Flat, explicit types with no unnecessary abstraction.
- **`src/lib/data.ts`** — Linear control flow, contextual errors, well-tested.
- **`src/lib/scoring.ts`** — Simple, deterministic, dev-only warnings, null handling.
- **`src/i18n/utils.ts`** — Clean hand-rolled i18n with no framework dependency.
- **`src/i18n/*.json`** — Parity-tested locale files, consistent structure.
- **All unit tests** — Thorough contract testing, shared helpers, infrastructure guards.
- **`eslint.config.js`** — Clean flat config with gitignore integration.
- **`astro.config.ts`** — Minimal and correct (aside from the TODO comment).
- **`package.json`** — Exact version pinning, clean scripts, Prettier reads `.gitignore` automatically.
- **`tsconfig.json`**, **`vitest.config.ts`**, **`playwright.config.ts`** — Minimal, correct.
- **`.prettierrc`**, **`.markdownlint-cli2.jsonc`**, **`.gitignore`** — All clean.
- **`data/`** — Seed data consistent with types, contract-tested, well-documented.
- **Memory bank** (mostly) — `systemPatterns.md`, `progress.md`, `activeContext.md`, `productContext.md`, `projectbrief.md` all accurate.
- **`tests/unit/helpers/`** — Good reuse patterns, no duplication.

---

## Summary

| Priority | Items                                                                                        | Effort  |
| -------- | -------------------------------------------------------------------------------------------- | ------- |
| High     | Delete 14 step-completion files, create `.vscode/extensions.json`                            | ~5 min  |
| Medium   | Fix stale field names in implementation plan, remove astro.config TODO, clean up `_index.md` | ~15 min |
| Low      | Annotate planned dirs in tech-stack.md, note dot-path duplication                            | ~5 min  |

The codebase is in good shape overall. The recurring step-completion file pattern is the only systemic issue — the workflow generating these files needs to stop creating them, not just have them cleaned up each round. All application code (`src/lib/`, `src/i18n/`, `tests/`) is clean, well-tested, and well-aligned with LLM coding principles.
