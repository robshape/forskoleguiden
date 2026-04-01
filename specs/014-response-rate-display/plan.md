# Implementation Plan: Response Rate Display

**Branch**: `014-response-rate-display` | **Date**: 2026-04-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-response-rate-display/spec.md`

## Summary

Surface the existing `totalRespondentsPercent` field from preschool survey data in two UI locations: the preschool detail page hero metadata row and the comparison page ComparisonCard name/info area. Uses purely static Astro rendering on the detail page and passes the existing field through the ComparisonCard Preact island on the comparison page. Three new i18n keys (one per locale). No data model changes, no new dependencies, no new JS islands.

## Technical Context

**Language/Version**: TypeScript (strict), Astro 5.x, Preact
**Primary Dependencies**: Astro, Preact, @nanostores/preact, Tailwind CSS v4
**Storage**: N/A (static JSON at build time)
**Testing**: Vitest (unit), Playwright + axe-core (e2e), post-build page-weight checks
**Target Platform**: Static site (GitHub Pages), mobile-first (iPhone 17, 393×852)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Lighthouse perf ≥ 0.90, page weight ≤ 100 KB uncompressed
**Constraints**: Zero runtime JS for static content, zero external APIs, WCAG 2.1 AA
**Scale/Scope**: ~60 preschools, 3 locales, 7 files modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Design Status | Post-Design Status |
|-----------|-------------------|---------------------|
| I. Performance by Default | ✅ PASS — Detail page change is pure Astro (zero JS). Comparison card already ships as part of existing island. No new JS added. | ✅ PASS — Confirmed no new islands or JS bundles. |
| II. Accessibility First | ✅ PASS — Response rate uses semantic HTML with icons marked `aria-hidden`. Screen reader will read label + value naturally. | ✅ PASS — Uses same accessible pattern as existing metadata items. |
| III. Data Integrity | ✅ PASS — Reads existing `totalRespondentsPercent` field. No new data transformations. Existing contract tests cover field presence. | ✅ PASS — No changes to data loading or scoring logic. |
| IV. Testing Standards | ✅ PASS — Existing e2e tests cover detail and comparison pages. New behavior testable via existing accessibility and content contract tests. | ✅ PASS — No new test infrastructure needed. Existing tests validate the pages. |
| V. Architecture Discipline | ✅ PASS — Astro for static rendering on detail page. Existing Preact island for comparison card. No new abstractions. | ✅ PASS — Minimal changes to existing components. |
| VI. Internationalization | ✅ PASS — New key added to all three locale files. i18n key parity test enforces structural consistency. | ✅ PASS — `detail.responseRate` key in sv/en/ar with identical structure. |
| VII. Privacy by Design | ✅ PASS — No new data collection, no external requests, no tracking. Displays existing build-time data. | ✅ PASS — No changes to privacy posture. |

**Gate result**: ALL PASS. No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/014-response-rate-display/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: data model documentation
├── quickstart.md        # Phase 1: implementation quickstart (step-by-step with cross-refs)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files to modify)

```text
src/
├── i18n/
│   ├── sv.json                    # Add detail.responseRate key
│   ├── en.json                    # Add detail.responseRate key
│   └── ar.json                    # Add detail.responseRate key
├── components/
│   ├── astro/
│   │   └── page-shells/
│   │       ├── DetailPage.astro   # Add response rate to hero metadata row
│   │       └── ComparisonPage.astro # Pass responseRate label via ComparisonView labels
│   └── preact/
│       ├── ComparisonView.tsx     # Add responseRateLabel to ComparisonViewLabels, pass to ComparisonCard
│       └── ComparisonCard.tsx     # Add responseRateLabel prop, render in preschoolInfo block
```

**Structure Decision**: No new files or directories. All changes are additions to existing files following established patterns.

## Core Implementation Sequence

Tasks are ordered by dependency: i18n keys have no dependencies and are consumed by all other steps; the detail page depends only on i18n; the comparison chain flows top-down (Astro shell → Preact orchestrator → Preact card). See [quickstart.md](quickstart.md) for exact insertion points, code patterns, and per-step verification.

| Order | Task | Files | Depends on | Details |
|-------|------|-------|------------|---------|
| 1 | Add i18n keys | `sv.json`, `en.json`, `ar.json` | — | [quickstart.md Step 1](quickstart.md#step-1-add-i18n-keys-all-three-locale-files), [research.md Decision 3](research.md#decision-3-i18n-key-naming), [data-model.md i18n keys](data-model.md#i18n-keys-new) |
| 2 | Detail page hero metadata | `DetailPage.astro` | Task 1 | [quickstart.md Step 2](quickstart.md#step-2-detail-page--hero-metadata-row), [research.md Decision 1 & 2](research.md#decision-1-display-strategy--pure-static-vs-island) |
| 3a | Comparison shell labels | `ComparisonPage.astro` | Task 1 | [quickstart.md Step 3a](quickstart.md#3a-srccomponentsastropage-shellscomparisonpageastro) |
| 3b | ComparisonView plumbing | `ComparisonView.tsx` | Task 3a | [quickstart.md Step 3b](quickstart.md#3b-srccomponentspreactcomparisonviewtsx) |
| 3c | ComparisonCard rendering | `ComparisonCard.tsx` | Task 3b | [quickstart.md Step 3c](quickstart.md#3c-srccomponentspreactcomparisoncardtsx) |
| 4 | Full validation | — | All above | [quickstart.md Step 4](quickstart.md#step-4-full-validation) — `pnpm validate` |

**Key design decisions that apply across all tasks**: [research.md](research.md) — Decision 1 (static Astro vs. island), Decision 2 (plain text, no tier coloring), Decision 3 (single i18n key reused in both contexts).
