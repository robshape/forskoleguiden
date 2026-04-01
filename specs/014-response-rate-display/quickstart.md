# Quickstart: Response Rate Display

**Feature**: 014-response-rate-display
**Date**: 2026-04-01

## Prerequisites

- Node.js and pnpm installed
- Repository cloned and on the `014-response-rate-display` branch

## Setup

```bash
pnpm install
pnpm dev
```

## What to Implement

Implementation follows a bottom-up dependency order: i18n keys first (no dependencies), then the detail page (depends only on i18n), then the comparison chain (depends on i18n and flows top-down from Astro shell → Preact orchestrator → Preact card).

### Step 1. Add i18n keys (all three locale files)

> **Decision ref**: [research.md — Decision 3](research.md#decision-3-i18n-key-naming) — single `detail.responseRate` key reused in both detail and comparison contexts.

Add `detail.responseRate` under the existing `"detail"` section in each locale file. Insert alphabetically among existing `detail.*` keys.

**`src/i18n/sv.json`** — add inside the `"detail"` object:
```json
"responseRate": "Svarsfrekvens"
```

**`src/i18n/en.json`** — add inside the `"detail"` object:
```json
"responseRate": "Response rate"
```

**`src/i18n/ar.json`** — add inside the `"detail"` object:
```json
"responseRate": "معدل الاستجابة"
```

**Verify step**: `pnpm test -- --run tests/unit/i18n-locale-key-parity.test.ts` — this enforces all three locales have identical key structures.

---

### Step 2. Detail page — hero metadata row

> **Decision ref**: [research.md — Decision 1](research.md#decision-1-display-strategy--pure-static-vs-island) — pure Astro static rendering, zero JS.
> **Decision ref**: [research.md — Decision 2](research.md#decision-2-visual-presentation--plain-text-in-metadata-row) — icon + translated label + percentage, no tier coloring.

Edit **`src/components/astro/page-shells/DetailPage.astro`**.

**Insertion point**: The hero metadata row is the `<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 ...">` block (~line 62). It currently contains two items: address (icon + text) and operator type (icon + text), separated by a `<span aria-hidden="true">•</span>` bullet. Add a third item after operator type following the same pattern:

1. Add a bullet separator `<span aria-hidden="true" class="...">•</span>`
2. Add a new `<div class="flex items-center gap-1.5">` containing:
   - An SVG icon (e.g., a users/group icon) with `aria-hidden="true"`, matching existing icon sizing (`size-4`)
   - Text: `{t('detail.responseRate', locale)}: {survey.totalRespondentsPercent}%`

The `survey` prop is already available in scope (type `PreschoolSurvey`, see [data-model.md](data-model.md#existing-entities-no-changes-required)). The `totalRespondentsPercent` field is an integer 0–100; `-1` placeholder surveys are already filtered by `isPlaceholderSurvey()` before reaching this page.

**Verify step**: `pnpm dev` → navigate to any preschool detail page (e.g., `/forskoleguiden/sv/forskola/arrie-forskola/`) → confirm response rate appears in the metadata row between address and operator, with correct label and percentage.

---

### Step 3. Comparison page — label plumbing (Astro shell → Preact orchestrator)

> **Decision ref**: [research.md — Decision 1](research.md#decision-1-display-strategy--pure-static-vs-island) — pass value through existing ComparisonCard Preact island.

This step threads the translated label through the component chain. Work top-down: Astro shell → ComparisonView → ComparisonCard.

#### 3a. `src/components/astro/page-shells/ComparisonPage.astro`

In the `labels={{...}}` object passed to `<ComparisonView>` (~line 46), add:

```astro
responseRate: t('detail.responseRate', locale),
```

Insert alphabetically among the existing label entries.

#### 3b. `src/components/preact/ComparisonView.tsx`

Add `responseRate: string` to the `ComparisonViewLabels` interface (~line 30). Insert alphabetically.

Then, where `<ComparisonCard>` is rendered (~line 246), add the new prop:

```tsx
responseRateLabel={labels.responseRate}
```

#### 3c. `src/components/preact/ComparisonCard.tsx`

Add `responseRateLabel: string` to the `Props` interface (~line 12–22). Destructure it in the component function.

In the `preschoolInfo` const (~lines 59–98), after the preschool name `<a>` link, add a small text element:

```tsx
<span class="text-xs text-gray-500">
  {responseRateLabel}: {survey.totalRespondentsPercent}%
</span>
```

The `survey` prop already contains `totalRespondentsPercent` (see [data-model.md](data-model.md#existing-entities-no-changes-required)).

**Verify step**: `pnpm dev` → navigate to `/forskoleguiden/sv/jamfor/` → select 2+ preschools → confirm each card shows response rate below the name.

---

### Step 4. Full validation

```bash
pnpm validate
```

This runs: lint → lint:md → format → astro check → unit tests → build → e2e → Lighthouse. All must pass.

## Files to Touch (ordered by implementation sequence)

| # | File | Change | Step |
|---|------|--------|------|
| 1 | `src/i18n/sv.json` | Add `detail.responseRate` key | 1 |
| 2 | `src/i18n/en.json` | Add `detail.responseRate` key | 1 |
| 3 | `src/i18n/ar.json` | Add `detail.responseRate` key | 1 |
| 4 | `src/components/astro/page-shells/DetailPage.astro` | Render response rate in hero metadata row | 2 |
| 5 | `src/components/astro/page-shells/ComparisonPage.astro` | Add `responseRate` to labels object | 3a |
| 6 | `src/components/preact/ComparisonView.tsx` | Add to `ComparisonViewLabels` interface + pass prop | 3b |
| 7 | `src/components/preact/ComparisonCard.tsx` | Add prop + render in preschoolInfo block | 3c |
