# Data Model: Share UI

**Feature**: 006-share-ui
**Date**: 2026-03-25

## Overview

The share UI feature introduces no persistent data model changes. All data flows are client-side and transient. This document describes the runtime entities, their states, and their relationships.

## Entities

### SharePayload (existing — `src/lib/share.ts`)

Already defined by spec 005. No modifications needed.

```typescript
type SharePayload = {
  v: number // Protocol version (always 1)
  city: string // City identifier ("Malmö")
  year: number // Survey year (2025)
  ids: string[] // Preschool IDs (1–5)
}
```

### ShareURL (constructed at runtime)

Not a stored entity — assembled on the fly by the share button.

| Component | Source                   | Example                         |
| --------- | ------------------------ | ------------------------------- |
| origin    | `window.location.origin` | `https://shapelessab.github.io` |
| basePath  | `getBasePath()`          | `/forskoleguiden`               |
| locale    | Component prop           | `sv`                            |
| route     | Hardcoded                | `jamfor`                        |
| encoded   | `encodeShareState(ids)`  | `NobwRA...`                     |

**Pattern**: `{origin}{basePath}/{locale}/jamfor/?s={encoded}`

**Constraint**: Total URL length < 2,000 characters (verified by spec 005 unit tests for 5 Malmö IDs).

### FeedbackState (component state)

Client-side `useState` in `ComparisonView` and `ShareButton` components.

```typescript
type FeedbackState =
  | { kind: 'idle' }
  | { kind: 'copied' }
  | { kind: 'fallback'; url: string }
  | { kind: 'warning'; invalidCount: number }
  | { kind: 'error' }
```

**State transitions**:

```text
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    ▼                                             │
    ┌───────┐  click share  ┌──────────┐  2-3s timeout  ┌───────┐│
    │ idle  │──────────────▶│ copied   │───────────────▶│ idle  ││
    └───────┘               └──────────┘                └───────┘│
        │                                                         │
        │  clipboard fails  ┌──────────┐  dismiss click  ┌───────┘
        └──────────────────▶│ fallback │────────────────▶│
                            └──────────┘                 │
                                                         │
    ┌───────┐  page load    ┌──────────┐  dismiss click  │
    │ idle  │──────────────▶│ warning  │────────────────▶│
    └───────┘  (stale IDs)  └──────────┘                 │
        │                                                 │
        │  page load        ┌──────────┐                 │
        └──────────────────▶│ error    │  (persistent)   │
           (corrupted)      └──────────┘                 │
                                                         │
```

**Rules**:

- `copied` → auto-dismisses after 2–3 seconds (timer); the timer MUST be cleaned up on unmount or state change to prevent stale callbacks
- `fallback` → dismissed by user clicking close button
- `warning` → dismissed by user clicking close button; does not reappear
- `error` → persistent (no dismiss); user must navigate away
- While in `copied` or `fallback`, clicking share again is a no-op (FR-019)

### RestorationResult (transient — computed once on mount)

Result of decoding and validating a `?s=` parameter. Not stored in state — used to derive the initial `FeedbackState`.

```typescript
type RestorationResult =
  | { status: 'none' } // No ?s= parameter
  | { status: 'success'; ids: string[] } // All IDs valid
  | { status: 'partial'; validIds: string[]; invalidCount: number } // Some IDs stale
  | { status: 'error' } // Decode failed or all IDs invalid
```

**Derivation**: `?s=` param → `decodeShareState()` → `validateShareIds()` → `RestorationResult`.

## State Management Changes

### New action: `setCompareIds()` in `src/lib/state.ts`

```typescript
export const setCompareIds = (ids: string[]) => {
  compareIdsStore.set(ids.slice(0, MAX_COMPARE))
}
```

This is the only state.ts modification. The existing `toggleCompare()` and `clearCompare()` remain unchanged.

## i18n Keys (new)

Added under `compare.share.*` and `detail.share.*` namespaces in all three locale files:

| Key                                | sv                                                     | en                                                               | ar                                                        | Purpose                              |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| `compare.share.button`             | Dela jämförelse                                        | Share comparison                                                 | مشاركة المقارنة                                           | Share button label (comparison page) |
| `compare.share.copied`             | Länk kopierad!                                         | Link copied!                                                     | تم نسخ الرابط!                                            | Clipboard success confirmation       |
| `compare.share.fallbackLabel`      | Kopiera länken:                                        | Copy the link:                                                   | انسخ الرابط:                                              | Label for fallback text field        |
| `compare.share.close`              | Stäng                                                  | Close                                                            | إغلاق                                                    | Close/dismiss button label           |
| `compare.share.warningTemplate`    | {count} av förskolorna i länken kunde inte hittas.      | {count} of the preschools in the link could not be found.        | لم يتم العثور على {count} من رياض الأطفال في الرابط.      | Stale-ID warning (interpolated)      |
| `compare.share.errorMessage`       | Länken kunde inte läsas.                               | The link could not be read.                                      | تعذرت قراءة الرابط.                                      | Corrupted payload error              |
| `compare.share.errorDirectoryLink` | Gå till förskolelistan                                 | Go to preschool list                                             | انتقل إلى قائمة رياض الأطفال                              | Error state directory link text      |

## Relationships

```text
ComparisonPage.astro
  └─▶ ComparisonView (Preact, client:only="preact")
       ├─▶ reads compareIds store
       ├─▶ useEffect: restore from ?s= → setCompareIds()
       ├─▶ renders share button (inline, not island)
       ├─▶ renders ShareFeedback (inline, not island)
       └─▶ renders ComparisonCard, ComparisonSummary (existing)

src/lib/clipboard.ts
  └─▶ copyToClipboard(text) → Promise<boolean>

src/lib/share.ts (existing, unchanged)
  ├─▶ encodeShareState(ids) → string
  ├─▶ decodeShareState(encoded) → SharePayload | null
  └─▶ validateShareIds(payload, knownIds) → { valid, invalid }

src/lib/state.ts (modified)
  ├─▶ compareIds (existing)
  ├─▶ toggleCompare() (existing)
  ├─▶ clearCompare() (existing)
  └─▶ setCompareIds() (NEW)
```

## Prop Threading: knownIds

Share restoration requires a list of known preschool IDs to validate against (FR-009). This data flows through build-time props — no runtime fetching.

```text
Build time (Astro):
  ComparisonPage.astro
    → getAllPreschoolSurveys().filter(s => !isPlaceholderSurvey(s))
    → .map(s => s.id)
    → passed as `knownIds: string[]` prop to ComparisonView

Runtime (Preact):
  ComparisonView useEffect([], ...)
    → reads ?s= from URL
    → decodeShareState(encoded) → SharePayload
    → validateShareIds(payload, knownIds) → { valid, invalid }
    → setCompareIds(valid)
```

The detail page `ShareButton` island does **not** need `knownIds` — it only encodes a single preschool ID that is already known-valid (it came from `getStaticPaths()` at build time). No validation is needed on the encoding side.

## Architectural Note: Inline vs. Island

The share button exists in two different hydration contexts:

| Page       | Component                                 | Hydration                                              | Why                                                                                                                                                                        |
| ---------- | ----------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comparison | Inline `<button>` inside `ComparisonView` | None (child of existing `client:only="preact"` island) | `ComparisonView` already has access to `compareIds` store and all survey data. No new island needed. See research.md R7.                                                   |
| Detail     | `ShareButton` island                      | `client:load`                                          | Surrounding markup is static Astro. The share button needs client-side clipboard access and state management. Cannot be a child of an existing island. See research.md R5. |

`ShareFeedback` is a **sub-component** in both cases — rendered by its parent, never hydrated independently.
