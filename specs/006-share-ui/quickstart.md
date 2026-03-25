# Quickstart: Share UI

**Feature**: 006-share-ui
**Branch**: `006-share-ui`

## Prerequisites

- Node.js (see `.nvmrc`)
- pnpm (enforced by `engines` in `package.json`)
- Feature branch checked out: `git checkout 006-share-ui`

## Setup

```bash
pnpm install
pnpm dev  # http://localhost:4321
```

## What This Feature Adds

1. **Share button on comparison page** — copies a shareable URL to clipboard with confirmation feedback
2. **Share link restoration** — decodes `?s=` query parameter on comparison page load, validates IDs, replaces local compare set

## Key Files to Modify

| File                                              | Change                                                  |
| ------------------------------------------------- | ------------------------------------------------------- |
| `src/lib/state.ts`                                | Add `setCompareIds()` bulk-set action                   |
| `src/lib/clipboard.ts`                            | New — `copyToClipboard()` wrapper                       |
| `src/components/preact/ComparisonView.tsx`        | Add share button, restoration `useEffect`, feedback UI  |
| `src/components/preact/ShareFeedback.tsx`         | New — confirmation/warning/error/fallback sub-component |
| `src/components/astro/pages/ComparisonPage.astro` | Pass new i18n props to ComparisonView                   |
| `src/i18n/sv.json`                                | Add `compare.share.*` keys                              |
| `src/i18n/en.json`                                | Add `compare.share.*` keys                              |
| `src/i18n/ar.json`                                | Add `compare.share.*` keys                              |

## Development Workflow

> **Test-first**: Per the project constitution (Principle IV), write failing tests before implementing production code. Steps below interleave tests and implementation accordingly. See [plan.md → Implementation Phases](plan.md) for the full dependency chain and FR traceability.

### Phase 1: Foundation (test-first, no UI)

#### 1a. Write failing unit tests

Create both test files **before** implementing the production code. They should fail on import (modules don't exist yet).

```bash
# Verify red baseline:
pnpm test -- --run tests/unit/share-ui-state-set-compare-ids.test.ts  # fails
pnpm test -- --run tests/unit/share-ui-clipboard-utility.test.ts      # fails
```

_(plan.md Phase 1, steps 1a–1b; spec FR-010, FR-004, FR-006; constitution IV)_

#### 1b. Add `setCompareIds()` to state module

```typescript
// src/lib/state.ts — add after clearCompare()
export const setCompareIds = (ids: string[]) => {
  compareIdsStore.set(ids.slice(0, MAX_COMPARE))
}
```

**Why a bulk setter?** Calling `clearCompare()` + `toggleCompare()` in a loop would trigger N+1 store updates, N+1 sessionStorage writes, and visual flicker from intermediate renders. A single `setCompareIds()` is atomic — one update, one persist, one render. _(research.md R4; data-model.md → State Management Changes; spec FR-010)_

#### 1c. Create clipboard utility

```typescript
// src/lib/clipboard.ts
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
```

Returns `true` on success, `false` on any failure (API unavailable, permission denied, focus lost). The caller decides whether to show confirmation or fallback UI. _(research.md R1; spec FR-004, FR-006)_

#### 1d. Verify unit tests pass

```bash
pnpm test -- --run tests/unit/share-ui-state-set-compare-ids.test.ts  # green
pnpm test -- --run tests/unit/share-ui-clipboard-utility.test.ts      # green
```

### Phase 2: i18n Keys

Add keys to all three locale files under `compare.share.*`. The full key list with Swedish values is in [data-model.md → i18n Keys table](data-model.md). English and Arabic translations must have identical key structures. _(data-model.md → i18n Keys; spec FR-017; constitution VI)_

```bash
# Verify key parity:
pnpm test -- --run tests/unit/i18n-locale-key-parity.test.ts  # green
```

### Phase 3: Comparison Page Share (User Story 1)

Build the share button and feedback UI inside the existing `ComparisonView` island. **No new island** — the comparison page share button is rendered inline as a child of `ComparisonView` (see [research.md R7](research.md) for why).

#### 3a. Create `ShareFeedback.tsx` sub-component

Renders the appropriate notification based on `FeedbackState`:

- `copied` → confirmation toast with `role="status"` (polite live region), auto-dismiss 2–3s
- `fallback` → read-only `<input>` with share URL + close button
- `warning` → dismissable banner (stale IDs)
- `error` → persistent banner with directory link + `role="alert"` (assertive live region)

_(data-model.md → FeedbackState state machine; research.md R3 — ARIA role mapping; spec FR-005, FR-006, FR-007, FR-011, FR-012)_

#### 3b. Add share button to `ComparisonView.tsx`

- Render share button after the selected-count heading, before the comparison stack
- Click handler: `encodeShareState(ids)` → build URL → `copyToClipboard(url)` → set feedback state
- Rapid-click guard: ignore clicks while `feedbackState.kind !== 'idle'`
- URL pattern: `${window.location.origin}${getBasePath()}/${locale}/jamfor/?s=${encoded}`

_(research.md R5 — placement + debounce; research.md R6 — URL construction; research.md R7 — integration strategy; spec FR-001, FR-002, FR-003, FR-004, FR-018, FR-019)_

#### 3c. Wire up `ComparisonPage.astro`

Pass new i18n string props to `ComparisonView`:

- `shareButtonLabel={t('compare.share.button', locale)}`
- `shareCopiedLabel={t('compare.share.copied', locale)}`
- `shareFallbackLabel={t('compare.share.fallbackLabel', locale)}`
- `shareCloseLabel={t('compare.share.close', locale)}`
- `shareWarningTemplate={t('compare.share.warningTemplate', locale)}`
- `shareErrorMessage={t('compare.share.errorMessage', locale)}`
- `shareErrorDirectoryLink={t('compare.share.errorDirectoryLink', locale)}`

_(research.md R7 — prop list; data-model.md → i18n Keys table)_

### Phase 4: Share Restoration (User Story 2)

Add `useEffect` to `ComparisonView.tsx` that decodes incoming `?s=` parameters and populates the compare set.

#### 4a. Implement restoration logic in `ComparisonView.tsx`

`useEffect([], ...)` runs once on mount:

1. Read `?s=` from `window.location.search` → if absent, no-op
2. Call `decodeShareState(encoded)` → if `null`, set feedback to `error`
3. Call `validateShareIds(payload, knownIds)` → derive `RestorationResult`
4. If all valid: `setCompareIds(valid)`, feedback stays `idle`
5. If partial: `setCompareIds(validIds)`, feedback → `warning` with `invalidCount`
6. If none valid: feedback → `error` (show error state, not empty comparison)
7. Strip `?s=` from address bar: construct a `new URL(window.location.href)`, call `url.searchParams.delete('s')`, then `history.replaceState({}, '', url.pathname + url.search)`

_(research.md R2 — history.replaceState; research.md R7 — integration; data-model.md → RestorationResult type; data-model.md → FeedbackState transitions; spec FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-020)_

#### 4b. Pass `knownIds` prop from `ComparisonPage.astro`

`ComparisonPage.astro` already loads all surveys via `getAllPreschoolSurveys()`. Extract IDs: `surveys.map(s => s.id)` and pass as `knownIds` prop to `ComparisonView`. This is the list `validateShareIds()` checks against.

_(data-model.md → Relationships — knownIds data flow)_

### ~~Phase 5: Detail Page Share (User Story 3)~~ [REMOVED]

> **Descoped**: User Story 3 was removed. The comparison page does not show a share button when only 1 preschool is selected, so a detail page share button creating single-preschool links is contradictory.

### Phase 6: E2e Tests + Full Verification

#### 6a. Write e2e tests

Create `tests/e2e/share-ui-copy-and-restore.spec.ts` covering:

- Share button exists and is clickable on comparison page
- Confirmation message appears after click — use `context.grantPermissions(['clipboard-read', 'clipboard-write'])` to allow Clipboard API in Playwright tests (Chromium only; use `page.evaluate` clipboard read-back to verify URL was copied)
- Restoration from valid `?s=` URL shows correct preschools
- Stale-ID `?s=` URL shows warning + valid preschools
- Corrupted `?s=` URL shows error + directory link
- Detail page share button generates correct URL [REMOVED]
- Keyboard accessibility (Tab + Enter/Space)

_(spec SC-001 to SC-008; spec User Stories 1–3)_

#### 6b. Run full validation

```bash
pnpm validate  # lint + format + check + test + build + e2e + Lighthouse
```

_(spec SC-008; constitution IV)

## Testing

### Unit tests

```bash
pnpm test -- --run tests/unit/share-ui-state-set-compare-ids.test.ts
pnpm test -- --run tests/unit/share-ui-clipboard-utility.test.ts
```

### E2e tests

```bash
pnpm test:e2e -- tests/e2e/share-ui-copy-and-restore.spec.ts
```

### Full validation

```bash
pnpm validate
```

## Manual Testing

1. Navigate to `/sv/` → select 2–3 preschools → go to `/sv/jamfor/`
2. Click "Dela jämförelse" → verify "Länk kopierad!" confirmation appears and auto-dismisses
3. Paste the copied URL in a new tab → verify same preschools appear
4. Modify the `?s=` value to include a fake ID → verify stale-ID warning appears with dismiss button
5. Set `?s=` to garbage → verify error message + directory link appears
6. Test keyboard: Tab to share button → Enter/Space → verify confirmation appears
7. Test with VoiceOver/NVDA: verify confirmation is announced
