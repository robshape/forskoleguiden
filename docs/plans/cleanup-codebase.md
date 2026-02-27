# Codebase Cleanup Plan

**Date:** 2026-02-27
**Scope:** Audit against LLM AI Coding Principles — structure, regenerability, simplicity, quality

## Context

The project is at Step 0 complete (scaffolding only). Zero application code exists — just a placeholder page, a 1-line CSS import, and 3 test files. Meanwhile, `docs/plans/` contains 71 step-completion files and `docs/memory-bank/tasks/` has 6 task files (4 for work that hasn't started). The documentation-to-code ratio is extremely lopsided.

---

## High Priority

### 1. Delete the 71 step-completion files in `docs/plans/`

**Principle violated:** Structure — "Use a consistent, predictable project layout."

These files (`step-0-0-memory-bank-init-plan.md`, `step-0-1-astro-init-phase-1-complete.md`, etc.) document every micro-phase of completed scaffolding. They serve no future purpose — an LLM can't use "phase 2 validation of .gitignore setup" to inform future work. They're historical artifacts that add noise and slow down codebase exploration.

**Action:** Delete all `docs/plans/step-*` files. Keep the `docs/plans/` directory for actual future plans (like this file).

### 2. Enable TypeScript ESLint recommended rules

**Principle violated:** Quality — "Favor deterministic, testable behavior." Also Logging/Errors — "Make errors explicit and informative."

The ESLint config at `eslint.config.js` has `rules: {}` for TypeScript files. The `@typescript-eslint/eslint-plugin` is installed but contributes zero rules. This means the linter catches nothing TypeScript-specific — no unused variables, no `any` leaks, no unsafe returns. Since Astro's strict tsconfig only governs type-checking (not lint rules), this is a gap.

**Action:** Add `...tsPlugin.configs.recommended.rules` (or the flat-config equivalent) to the TS file block in `eslint.config.js`.

### 3. Remove `data/example.pdf`

**Principle violated:** Regenerability — "Prefer clear, declarative configuration."

A binary PDF with no documentation about what it is or how to use it. The PRD says "no PDF parsing in browser" and the tech stack says PDF→JSON conversion is post-MVP. This file just sits in the repo consuming space with no link to anything.

**Action:** Delete `data/example.pdf`. If it's needed later for reference, it can live in a separate branch or wiki.

### 4. Delete `tests/unit/smoke.test.ts`

**Principle violated:** Quality — "Keep tests simple and focused on verifying observable behavior."

```ts
it('verifies Vitest discovers and runs unit tests', () => {
  expect(true).toBe(true)
})
```

This test verifies nothing. It was useful as a one-time check that Vitest was wired up correctly, but that's confirmed and done. It adds clutter and sets a bad pattern for future test files. The gitignore test already proves the test runner works.

**Action:** Delete `tests/unit/smoke.test.ts`.

---

## Medium Priority

### 5. Fix outdated info in `docs/tech-stack.md`

**Principle violated:** Naming/Comments — "Comment only to note invariants, assumptions, or external requirements."

Two inconsistencies:

- Lists `@astrojs/tailwind` as the Tailwind integration, but the project uses `@tailwindcss/vite` directly (correct approach for Tailwind v4).
- Shows `^` semver ranges in the dependency table, but the project correctly uses exact pinning. Misleading for any LLM reading the docs.

**Action:** Update the relevant sections in `docs/tech-stack.md` to match actual usage.

### 6. Scope the `format` script

**Principle violated:** Platform Use — "Use platform conventions directly and simply."

The current script `prettier --ignore-path .gitignore --write .` formats everything not in `.gitignore`, which could touch SVG mockups, the lockfile, or other binary/generated files unexpectedly. The original implementation plan scoped it to specific extensions.

**Action:** Change to `prettier --ignore-path .gitignore --write "**/*.{ts,tsx,astro,css,json,md}"` or add a `.prettierignore` with `pnpm-lock.yaml`, `docs/mockups/`, etc.

### 7. Consolidate completed verification-only tasks

**Principle violated:** Structure — "Group code by feature; keep shared utilities minimal."

`TASK003` (verify Playwright config) and `TASK004` (verify .gitignore) are completed tasks that document trivial verification steps. They add overhead to the task index without providing reusable context. Future LLMs scanning `_index.md` will see 6 tasks and think there's meaningful implementation history when there isn't.

**Action:** Archive or delete `TASK003` and `TASK004` files. Update `_index.md` to remove them or move them to a "Completed (archived)" section with one-line summaries only.

### 8. Fix TASK005 progress inconsistency

**Principle violated:** Naming/Comments — accurate documentation.

TASK005 claims 10% completion but every subtask row says "Not Started". This is misleading — 10% apparently represents creating the task file itself, not actual implementation progress.

**Action:** Set overall progress to 0% or "Not Started" to match the subtask statuses.

---

## Low Priority

### 9. Consider slimming the memory bank for this project stage

The memory bank has 6 files + 6 task files documenting a project with 2 source files and zero features. The overhead is defensible as "preparing for growth," but right now most files are 3-4 sentence stubs that say "see `docs/prd.md`" or "see `docs/tech-stack.md`."

**No action yet** — revisit after Step 1 and Step 2 land. If the memory bank files still just point to other docs rather than containing unique context, consider consolidating.

### 10. Add recommended VS Code extensions

`.vscode/extensions.json` only recommends `astro-build.astro-vscode`. Consider adding `esbenp.prettier-vscode`, `dbaeumer.vscode-eslint`, and `bradlc.vscode-tailwindcss` for a more complete DX.

**Action:** Update `.vscode/extensions.json` with the above extension IDs.

---

## No Change Needed

These areas are fine as-is:

- **`astro.config.ts`** — Clean, well-structured, appropriate TODOs.
- **`tsconfig.json`** — Correctly extends Astro strict config, path aliases are standard.
- **`vitest.config.ts`** — Minimal, correct alias duplication from tsconfig.
- **`playwright.config.ts`** — Minimal and correct.
- **`src/styles/global.css`** — Single Tailwind import is the correct Tailwind v4 pattern.
- **`tests/unit/gitignore.test.ts`** — Functional regression guard, fine to keep.
- **`tests/e2e/smoke.spec.ts`** — Correctly tests `/sv/` route (expected to fail until route work lands).
- **`.prettierrc`** — Minimal and appropriate.
- **`.gitignore`** — Comprehensive and correct.
- **`package.json`** — Exact version pinning, correct scripts, clean dependency list.
- **Project structure** — Feature-organized layout from `copilot-instructions.md` is correct, just not populated yet.

---

## Summary

| Priority | Items                                                                             | Effort  |
| -------- | --------------------------------------------------------------------------------- | ------- |
| High     | Delete 71 plan files, enable TS lint rules, remove example.pdf, delete smoke test | ~15 min |
| Medium   | Fix tech-stack docs, scope format script, clean up tasks, fix TASK005             | ~20 min |
| Low      | Memory bank review (deferred), VS Code extensions                                 | ~5 min  |

The biggest win is deleting the 71 step-completion files. They represent the majority of the repo's file count while contributing zero value to future work. After that, enabling actual TypeScript lint rules closes the most significant quality gap in the tooling setup.
