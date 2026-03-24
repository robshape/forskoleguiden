# Implementation Plan: Independent Preschool Queue Links

**Branch**: `004-preschool-queue-links` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-preschool-queue-links/spec.md`

## Summary

For independent preschools that have a queue URL, surface two entry points:

1. **Detail page** — a prominent styled link (icon + localized label) in the Actions section of `DetailPage.astro`, rendered as an anchor with `target="_blank"` and `rel="noopener noreferrer"`.
2. **Directory card** — a passive indicator (small icon + short localized text) on `PreschoolCard.astro` for at-a-glance scanning.

The `queueUrl` field is stored in the preschool index data (`data/malmo/index.json`) and flows through the TypeScript type → data loader → Astro components at build time. No runtime logic, no new islands. All user-facing text goes through the existing `t()` i18n system; new keys are added to all three locale files with enforced key parity. Municipal preschools and independent preschools with a missing `queueUrl` show nothing — graceful omission by a Conditional Astro render block.

## Technical Context

**Language/Version**: TypeScript (strict), Astro 5.x
**Primary Dependencies**: Astro (static rendering), Preact islands (none new for this feature), Tailwind CSS v4, nanostores (no changes)
**Storage**: Static JSON files in `data/malmo/` — read via `readFileSync` at build time only
**Testing**: Vitest (unit), Playwright + axe-core (e2e), Vitest post-build (page weight)
**Target Platform**: Static HTML, all modern browsers; primary viewport iPhone 13 mini
**Project Type**: Static site (Astro SSG with Preact islands)
**Performance Goals**: Page-weight budget ≤ 100 KB uncompressed; Lighthouse perf ≥ 0.90
**Constraints**: Zero new JavaScript islands; zero new runtime dependencies; i18n key parity enforced by CI
**Scale/Scope**: 261 preschools total (71 independent, 190 municipal); 3 locales; ~3 affected source files + 3 i18n files + 2 test files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status  | Notes                                                                                                                                                                       |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance by Default  | ✅ PASS | No new JS islands or runtime dependencies. Queue link is a static `<a>` tag. No page-weight risk.                                                                           |
| Accessibility First     | ✅ PASS | Visible text label doubles as the accessible label (FR-010). Link has `rel`/`target` attributes. Touch target will be verified at implementation. Axe-core e2e covers this. |
| Data Integrity          | ✅ PASS | `queueUrl` is an optional field in the TypeScript type. Existing contract tests are extended to validate presence/absence per operator type.                                |
| Testing Standards       | ✅ PASS | Failing tests for queue link and indicator are added before implementation; existing contract tests are updated.                                                            |
| Architecture Discipline | ✅ PASS | No new Preact island needed. Queue link is rendered as static Astro markup. `queueUrl` prop threads through existing component hierarchy without new abstractions.          |
| Internationalization    | ✅ PASS | Two new i18n keys added to all three locale files. Key parity test will catch missing entries.                                                                              |
| Privacy by Design       | ✅ PASS | Queue URL is an external link to a third-party site. `rel="noopener noreferrer"` prevents tab-napping and referrer leakage. No tracking.                                    |

**Post-design re-check**: All gates remain green. The change is additive — no existing behavior is modified, only extended.

## Project Structure

### Documentation (this feature)

```text
specs/004-preschool-queue-links/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

No `contracts/` directory — this is a static site with no API interfaces.

### Source Code (touched files only)

```text
data/
├── README.md                              # Updated: note queueUrl placeholder policy
└── malmo/
    └── index.json                         # Updated: add queueUrl to all 71 independent entries

src/
├── lib/
│   └── types.ts                           # Updated: add queueUrl?: string to PreschoolIndexEntry
├── i18n/
│   ├── sv.json                            # Updated: add detail.queueLink + detail.queueIndicator
│   ├── en.json                            # Updated: same keys in English
│   └── ar.json                            # Updated: same keys in Arabic
└── components/
    └── astro/
        └── pages/
            ├── DetailPage.astro           # Updated: conditional queue link in Actions section
            └── DirectoryPage.astro        # Updated: pass queueUrl prop to PreschoolCard

tests/
├── unit/
│   └── malmo-directory-index-contract.test.ts   # Updated: add queueUrl assertions
└── e2e/
    ├── preschool-detail-page-contract.spec.ts    # Updated: add queue link assertions
    └── directory-data-rendering.spec.ts          # Updated: add queue indicator assertions
```

Note: `PreschoolCard.astro` is also updated (add `queueUrl?` prop + indicator markup). It is instantiated by `DirectoryPage.astro` only.
