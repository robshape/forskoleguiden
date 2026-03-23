# Förskoleguiden Constitution

## Core Principles

### I. Performance by Default

Ship zero JavaScript unless a component requires client-side state or event handlers. Astro renders static HTML; Preact islands hydrate only where interactivity is needed.

- Every page must stay under the **100 KB uncompressed** page-weight budget (enforced by post-build test).
- Total island JS budget: **~3–5 KB** (Preact runtime + island code, tree-shaken and code-split).
- **No runtime external APIs, CDNs, or third-party scripts.** All data is embedded at build time. No map tiles, no analytics, no chart CDNs, no font CDNs.
- Lighthouse performance score must remain **≥ 0.90** (enforced by `pnpm audit:lighthouse`).
- Prefer CSS over JS for visual effects. Use Tailwind utility classes, not JS-driven animations.
- Every new island must justify its JS cost. If it can be an Astro component, it must be.

### II. Accessibility First

WCAG 2.1 AA is the minimum. Accessibility is not a polish step — it is a design constraint applied from the start.

- Lighthouse accessibility score must remain **≥ 0.95** (enforced by CI).
- All interactive elements must be **keyboard navigable** with visible focus indicators.
- Visualizations must use **pattern fills and non-color encodings**, not color alone. Every chart must have an equivalent `<table>` text alternative in static HTML.
- Color palette must be **color-blind-safe** across protanopia, deuteranopia, and tritanopia.
- Touch targets must be **≥ 44×44 px** (matching `.impeccable.md` design principles).
- `@axe-core/playwright` e2e tests validate wcag2a and wcag2aa rules on every page.
- ARIA attributes must be correct and minimal — use semantic HTML first, ARIA only when native semantics are insufficient.
- `prefers-reduced-motion` must be respected. No essential information may be conveyed through animation alone.

### III. Data Integrity

All preschool data flows through a static, build-time-only pipeline. There is no runtime data fetching.

- Data lives in `data/` as static JSON files, read via `readFileSync` at Astro build time.
- TypeScript strict mode enforces data shape at compile time. All data interfaces live in `src/lib/types.ts`.
- **Contract tests** (`malmo-survey-files-contract.test.ts`, `malmo-directory-index-contract.test.ts`) validate every JSON file against type contracts, field ranges, and structural invariants. Adding a new preschool JSON automatically triggers these validations.
- Scoring logic (`computeAgreeShare`, `computeOverallScore`, `byOverallScoreDesc`) is **deterministic** — same input always produces same output. Scoring functions have dedicated unit tests.
- Comparison summaries use **neutral template phrases** with fixed thresholds (≥ 5 pp = "higher", ≤ −5 pp = "lower", otherwise "similar"). No AI-generated or subjective language.
- Data provenance is visible to users: source attribution links to the official Malmö municipality survey page on every relevant view.

### IV. Testing Standards

Follow Kent C. Dodds's testing trophy: fewer, longer tests that test behavior, not implementation.

- **Three test layers**, each with a clear purpose:
  - **Unit** (`tests/unit/`): Pure logic — scoring, data loading, i18n, state management. Vitest, node environment.
  - **E2e** (`tests/e2e/`): User flows, accessibility, component contracts, keyboard navigation. Playwright + axe-core.
  - **Post-build** (`tests/post-build/`): Build output contracts — page-weight budget, static output structure.
- **BDD-style naming**: test files and `describe`/`it` blocks describe behavior and domain, not implementation (e.g., `scoring-overall-score-utilities.test.ts`, not `scoring.test.ts`).
- **Write fewer, longer tests**: each test file should cover a coherent behavior surface. Avoid one-assertion-per-test fragmentation.
- **Bug fixes require a failing test first**: reproduce the bug with a test that fails, then fix and verify the test passes.
- **Shared test helpers** live in `tests/unit/helpers/` and `tests/e2e/helpers.ts` — reuse over duplication.
- `pnpm validate` is the full quality gate (lint, format, check, test, build, e2e, Lighthouse). It must pass before any merge.

### V. Architecture Discipline

Astro by default. Preact only for interactivity. Organize by feature, not by type. No over-engineering.

- **Astro components** for anything that doesn't need client-side state or event handlers. Astro components receive `locale: Locale` as a prop and call `t()` for user-facing text.
- **Preact islands** only when the component requires `useState`, `useEffect`, event handlers, or reads from `sessionStorage`/nanostores. Each island must declare its hydration directive (`client:load`, `client:only="preact"`, `client:visible`, `client:idle`) with a documented reason.
- **nanostores** for cross-island shared state. Never write to internal atoms directly — use exported action functions (`toggleCompare`, `clearCompare`). State persists via `sessionStorage` for MPA navigation.
- **Organize by feature**: domain logic in `src/features/{feature}/`, shared utilities in `src/lib/`, components split between `src/components/astro/` and `src/components/preact/`.
- **No speculative abstractions**: don't create helpers, utilities, or config for hypothetical future requirements. Build for the current phase only.
- **Arrow functions for utilities; named function declarations for components** — named functions produce better DevTools display names and stack traces.
- Base path via `getBasePath()` — never hardcode `/` as root. All internal hrefs use `${getBasePath()}/${locale}/path`.

### VI. Internationalization

Three locales (Swedish, English, Arabic) with enforced structural parity and RTL support.

- Locale files: `src/i18n/sv.json`, `en.json`, `ar.json` — flat dot-path keys, one JSON per locale.
- **Key parity is enforced by unit test** (`i18n-locale-key-parity.test.ts`): all three locale files must have identical key structures. Adding a key to one file without the others fails CI.
- `t(key, locale, params?)` from `src/i18n/utils.ts` handles lookup and interpolation. Returns the key string as fallback if missing.
- Swedish is the default locale on first visit. Language switching preserves application state.
- Arabic requires `dir="rtl"` on `<html>` (set by `BaseLayout.astro`) and `rtl:` Tailwind variants where layout direction matters.
- All user-facing text must go through `t()` — no hardcoded strings in components.
- Route structure: `/{locale}/` prefix for all pages (`/sv/`, `/en/`, `/ar/`).

### VII. Privacy by Design

No accounts, no tracking, no external runtime dependencies. The user's data never leaves their browser.

- **No user accounts or authentication.** All features work anonymously.
- **No analytics, telemetry, or tracking scripts.** Zero third-party runtime JavaScript.
- **No cookies.** Client state uses `sessionStorage` only (cleared when the tab closes).
- **No external runtime network requests.** All data is baked into static HTML at build time. No fetches, no beacons, no WebSocket connections.
- **Shareable URLs encode state in the URL itself** (no server-side storage). URL-encoded payloads must stay under **~2,000 characters** to ensure broad compatibility with browsers, messaging apps, and email clients.
- **`mailto:` links** for email sharing — the user's email client handles sending. The site never sees the email address.

## Quality Gates

### Automated Enforcement

Every principle above is enforced by at least one automated check in the CI pipeline (`pnpm validate` via `.github/workflows/quality-gates.yml`):

| Principle               | Enforcement mechanism                                                          |
| ----------------------- | ------------------------------------------------------------------------------ |
| Performance by Default  | Post-build page-weight budget test (100 KB), Lighthouse perf ≥ 0.90            |
| Accessibility First     | Lighthouse a11y ≥ 0.95, axe-core e2e tests, keyboard navigation e2e tests      |
| Data Integrity          | Contract tests on every JSON file, scoring unit tests, TypeScript strict       |
| Testing Standards       | `pnpm validate` runs all three test layers; pre-commit runs lint-staged        |
| Architecture Discipline | ESLint flat config (import ordering, Tailwind class validation), `astro check` |
| Internationalization    | i18n key parity unit test, TypeScript `Locale` type                            |
| Privacy by Design       | No external dependencies at runtime (verified by static output tests)          |

### Manual Review Checklist

Every PR must be evaluated against these questions:

1. **Does it add JS?** If yes, is a Preact island justified? Could it be an Astro component instead?
2. **Does it stay under budget?** Run `pnpm test:post-build` — page weight must remain ≤ 100 KB uncompressed.
3. **Is it accessible?** Keyboard navigable? Correct ARIA? Color-blind safe? Has a text alternative?
4. **Is it tested?** Unit test for logic, e2e for user-facing behavior. Bug fix includes a regression test.
5. **Does it respect privacy?** No new external requests, no tracking, no cookies.
6. **Are i18n keys added to all three locale files?** CI will catch missing keys, but reviewers should verify translations are meaningful.
7. **Is it the simplest solution?** No speculative abstractions, no premature optimization.

## Governance

### Authority

This constitution is the highest-priority reference for technical decisions in the Förskoleguiden project. When a principle here conflicts with a convenience shortcut, the principle wins.

### Decision-Making

- **Principles guide trade-offs.** When two valid approaches exist, choose the one that better serves these principles in priority order: Privacy → Accessibility → Data Integrity → Performance → Architecture Discipline.
- **Phase planning respects the constitution.** New phases and features must be evaluated against all seven principles before implementation begins. A feature that cannot meet these principles must be redesigned or deferred.
- **PRD alignment.** The constitution operationalizes the PRD's requirements. If the PRD and constitution conflict, raise the conflict explicitly — do not silently ignore either document.

### Amendments

- Any principle may be amended, but amendments require:
  1. A written rationale explaining why the current principle is insufficient.
  2. An updated enforcement mechanism (test, lint rule, or CI check) for the new principle.
  3. A migration plan if the amendment changes existing code or infrastructure.
- Removing a principle requires demonstrating that its concerns are fully covered by remaining principles.

### Compliance

- `pnpm validate` must pass on every commit to `main`. There are no exceptions.
- Pre-commit hooks (`lint-staged`) enforce formatting and type-checking on staged files.
- Lighthouse CI audits run on every deploy pipeline. Score regressions block deployment.
- Constitution violations discovered in production are treated as P0 bugs.

**Version**: 1.0.0 | **Ratified**: 2026-03-23
