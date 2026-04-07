---
applyTo: 'tests/**'
description: 'Testing conventions, helpers, and patterns for Vitest unit tests, Playwright e2e tests, and post-build verification.'
---

# Testing

## Unit tests (`tests/unit/`)

- Vitest, node environment. Path aliases `@/` and `@data/` mirrored in `vitest.config.ts`.
- **Shared helpers** (`tests/unit/helpers/`): `malmo-data.ts` loads real index/survey paths; `survey-assertions.ts` provides `assertResponseShape()` and `assertResponseContract()`.
- **Data contract tests**: `malmo-survey-files-contract.test.ts` validates every JSON file in `data/malmo/2025/` against type contracts.
- **BDD-style names**: files use behavior-descriptive names (e.g., `scoring-overall-score-utilities.test.ts`, `i18n-locale-key-parity.test.ts`).

## E2e tests (`tests/e2e/`)

- Playwright. Config auto-starts `pnpm preview` as webserver.
- **All paths include base path**: `page.goto('/forskoleguiden/sv/')` — never use bare `/`.
- **Shared helpers** (`tests/e2e/helpers.ts`): URL constants (`DIRECTORY_URL`, `COMPARISON_URL`, `DETAIL_URL`), card locators (`getDirectoryCard()`, `getCompareButton()`), hydration guards (`waitForCompareButtonReady()`, `waitForCompareButtonSelected()`).
- **WebKit mobile regression**: `pnpm test:e2e:webkit` runs `playwright.webkit.config.ts` targeting iPhone 17 (via iPhone 15 preset).
- **Accessibility**: `accessibility-axe-core.spec.ts` runs `@axe-core/playwright` for wcag2a/wcag2aa.

## Post-build tests (`tests/post-build/`)

- Vitest via `vitest.post-build.config.ts`. Run with `pnpm test:post-build`.
- Enforces page-weight budget (100 KB uncompressed) and static output contracts against `dist/`.

## Key test files

| File                                     | Scope                         |
| ---------------------------------------- | ----------------------------- |
| `user-flow-phase1.spec.ts`               | Full Phase 1 user journey e2e |
| `preschool-card-contract.spec.ts`        | Component contract e2e        |
| `keyboard-navigation-focus-ring.spec.ts` | Keyboard nav e2e              |
| `homepage-routing-smoke.spec.ts`         | Routing smoke e2e             |
