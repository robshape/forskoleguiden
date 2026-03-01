# Codebase Cleanup Plan — Round 2

**Date:** 2026-03-01
**Scope:** Audit against LLM AI Coding Principles — structure, regenerability, simplicity, quality

## Context

Since the last cleanup (2026-02-27), Step 1 data-layer foundations were implemented: `src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`, five seed data files in `data/malmo/`, and six unit test files. The project now has real application code. However, the same documentation-bloat pattern from Step 0 has repeated — 26 new step-completion files appeared in `docs/plans/` despite deleting 71 of them two days ago.

---

## High Priority

### 1. Delete the 26 step-completion files in `docs/plans/`

**Principle violated:** Structure — "Use a consistent, predictable project layout."

The exact problem fixed on 2026-02-27 has recurred. Step 1 implementation generated 26 new `step-1-*` files (plan, phase-1-complete, phase-2-complete, phase-3-complete, complete — for each of sub-steps 1.1 through 1.5, plus red-proof files). These are transient process artifacts, not project documentation. They slow down codebase exploration and inflate the file count without aiding future work.

This pattern needs to stop being generated, not just periodically cleaned up. Whatever workflow is producing these files should be changed to not create them.

**Action:** Delete all `docs/plans/step-*` files. Going forward, do not generate per-phase completion files — task progress belongs in `docs/memory-bank/tasks/` only.

### 2. Deduplicate test response-assertion logic

**Principle violated:** Regenerability — "Write code so any file/module can be rewritten from scratch without breaking the system." Also Structure — "Minimize coupling so files can be safely regenerated."

`expectedResponseKeys` is defined in two places:

- `tests/unit/helpers/survey-assertions.ts` — exports `expectedResponseKeys` and `assertResponseShape`
- `tests/unit/malmo-surveys.test.ts` — declares its own `expectedResponseKeys` and `assertResponseContract` function

Both do the same job: verify that a `SurveyResponse` has exactly 5 keys with numeric values. The `malmo-surveys.test.ts` version adds range/sum validation, but the duplication of the key list and basic shape check means a schema change requires fixing two files.

**Action:** Consolidate into the existing `tests/unit/helpers/survey-assertions.ts`. Extend `assertResponseShape` (or add a new `assertResponseContract`) with the range and sum checks from `malmo-surveys.test.ts`. Then import it in `malmo-surveys.test.ts` instead of redeclaring.

### 3. Restore scoping on `format` and `format:check` scripts

**Principle violated:** Platform Use — "Use platform conventions directly and simply."

The scripts were scoped to specific file extensions in the last cleanup but have reverted to:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

Without `--ignore-path .gitignore` or a `.prettierignore`, Prettier will attempt to format `pnpm-lock.yaml` and other files that shouldn't be touched. There are two clean options:

- **Option A:** Add a `.prettierignore` file (simplest, survives script changes)
- **Option B:** Re-add `--ignore-path .gitignore` to both scripts

**Action:** Add a `.prettierignore` file containing `pnpm-lock.yaml` (at minimum). This is more resilient than flag-based approaches since it works regardless of how Prettier is invoked.

---

## Medium Priority

### 4. Enrich memory bank files with actual content

**Principle violated:** Naming/Comments — "Comment only to note invariants, assumptions, or external requirements."

Five of the six memory bank files are 3-4 sentence stubs that say "see `docs/prd.md`" or "see `docs/tech-stack.md`". Now that real code exists, these files should contain genuinely useful context that differs from the main docs:

- **`systemPatterns.md`** — should document actual patterns in use: the `readJsonFile<T>()` helper pattern in `data.ts`, the `null`-return pattern for missing scoring data, the shared test helper pattern in `tests/unit/helpers/`.
- **`techContext.md`** — should note actual dev setup details: `@eslint/compat` is used for gitignore integration, `@tailwindcss/vite` (not `@astrojs/tailwind`), no `.vscode/` directory exists.
- **`productContext.md`** — fine as-is for now (no product features exist yet).

**Action:** Update `systemPatterns.md` and `techContext.md` with concrete patterns and setup details from the actual codebase, rather than just pointers to other docs.

### 5. Update `data/README.md` — types.ts is implemented

**Principle violated:** Naming/Comments — accurate documentation.

The data README says:

> See `src/lib/types.ts` (once implemented) for the TypeScript interfaces.

`types.ts` is now implemented. Remove the "(once implemented)" parenthetical.

**Action:** Update the sentence to remove the future-tense qualifier.

### 6. Update `data/template.json` or document its status

**Principle violated:** Regenerability — "Prefer clear, declarative configuration."

`template.json` still uses the old field name `"address": "Gatunamn 1, Malmö"` but the actual data confirms the real schema uses the same field structure. What's worth noting is that `template.json` is now out of sync with the real data in a subtle way — the real files include `"id"` and `"totalRespondentsPercent"` fields which the template already has, so the template is actually correct structurally. But the purpose of the template file should be clarified: is it machine-readable schema definition, or just a human reference? If it's meant to be programmatically validated against, it needs to be referenced somewhere in code. If it's just documentation, note that.

**Action:** Add a comment in `data/README.md` clarifying that `template.json` is a human-reference template, not a schema enforced in code. TypeScript interfaces are the source of truth.

---

## Low Priority

### 7. Consider restoring `.vscode/` directory

The `.vscode/` directory (previously containing `extensions.json` and `launch.json`) was removed. For a project that explicitly targets LLM + VS Code workflow, having recommended extensions helps new sessions get the right tooling. Low impact but easy to add.

**Action:** Optionally re-add `.vscode/extensions.json` with recommendations for `astro-build.astro-vscode`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, and `bradlc.vscode-tailwindcss`.

### 8. Remove `test-results/` from the gitignore check

The `test-results/` entry in `.gitignore` is correct, but `tests/unit/gitignore.test.ts` only checks 4 paths: `node_modules/`, `dist/`, `.astro/`, `.DS_Store`. Consider adding `test-results/` to the guard so it stays ignored.

**Action:** Add `'test-results/'` to `REQUIRED_PATHS` in `tests/unit/gitignore.test.ts`.

---

## No Change Needed

These areas are clean and well-aligned:

- **`src/lib/types.ts`** — Flat, explicit types. No unnecessary abstraction.
- **`src/lib/data.ts`** — Linear control flow, clear error messages with context, explicit state passing.
- **`src/lib/scoring.ts`** — Well-named constants, dev-only warnings, `null` handling for missing data.
- **`eslint.config.js`** — Clean flat config with `includeIgnoreFile` from `@eslint/compat`. Recommended rules enabled.
- **`astro.config.ts`** — Minimal, correct. TODOs for future steps.
- **`tsconfig.json`**, **`vitest.config.ts`**, **`playwright.config.ts`** — Minimal and correct.
- **`tests/unit/helpers/malmo-data.ts`** — Clean shared test helper.
- **`tests/unit/data.test.ts`**, **`tests/unit/scoring.test.ts`** — Well-structured, deterministic tests with clear names.
- **`data/malmo/`** — Seed data files are consistent with types and template.
- **`.prettierrc`** — Clean with jsonc override.
- **`.markdownlint-cli2.jsonc`** — Correct with globs moved into config file.
- **`package.json`** — Exact version pinning, clean scripts.

---

## Summary

| Priority | Items                                                                        | Effort  |
| -------- | ---------------------------------------------------------------------------- | ------- |
| High     | Delete 26 step-\* files, deduplicate test assertions, restore format scoping | ~15 min |
| Medium   | Enrich memory bank, fix data README, clarify template purpose                | ~15 min |
| Low      | Restore .vscode/, add test-results/ to gitignore guard                       | ~5 min  |

The recurring step-completion file problem is the most important fix — not just deleting the files, but breaking the workflow pattern that creates them. The test assertion duplication is the only actual code-quality issue in the implementation so far.
