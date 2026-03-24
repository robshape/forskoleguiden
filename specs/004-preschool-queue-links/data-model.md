# Data Model: Independent Preschool Queue Links

**Feature**: `004-preschool-queue-links`
**Date**: 2026-03-24

## Entities

### PreschoolIndexEntry (extended)

**File**: `src/lib/types.ts`

**Change**: Add `queueUrl?: string` field.

```typescript
export type PreschoolIndexEntry = {
  id: string
  name: string
  address: string
  operatorType: OperatorType
  queueUrl?: string // NEW — only present for independent preschools with a known queue URL
}
```

**Validation rules**:

- `queueUrl` is optional on the TypeScript type; its presence is a runtime/data concern.
- When present, `queueUrl` MUST be a non-empty string.
- `queueUrl` MUST NOT be present on `municipal` preschool entries (enforced by contract test).
- `queueUrl` MAY be absent on `independent` preschool entries (data gap → graceful omission).

**State transitions**: No lifecycle state — `queueUrl` is a static data attribute, present or absent at build time.

---

### index.json entries (data)

**File**: `data/malmo/index.json`

**Change**: Add `"queueUrl"` to each of the 71 `"operatorType": "independent"` entries.

**Placeholder format**: `"https://example.com/queue/{preschool-id}"` — e.g.:

```json
{
  "id": "al-salamah-sprakforskola",
  "name": "Al-Salamah språkförskola",
  "address": "Kvarnbyvägen 18, Malmö",
  "operatorType": "independent",
  "queueUrl": "https://example.com/queue/al-salamah-sprakforskola"
}
```

Municipal entries remain unchanged (no `queueUrl` field added).

---

## i18n Keys

**Files**: `src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`

**Change**: Extend the `"detail"` namespace with two new keys.

<!-- markdownlint-disable MD060 -->

| Key                     | sv                    | en                     | ar                         |
| ----------------------- | --------------------- | ---------------------- | -------------------------- |
| `detail.queueLink`      | `"Anmäl dig till kö"` | `"Register for queue"` | `"سجّل في قائمة الانتظار"` |
| `detail.queueIndicator` | `"Har egen kö"`       | `"Has own queue"`      | `"لها قائمة انتظار خاصة"`  |

<!-- markdownlint-enable MD060 -->

**Key invariant**: All three locale files must have both new keys at the identical path. The i18n key-parity unit test (`i18n-locale-key-parity.test.ts`) enforces this at CI.

---

## Component Props

### PreschoolCard.astro — Props interface (extended)

**File**: `src/components/astro/PreschoolCard.astro`

**Change**: Add `queueUrl?: string` to the Props destructure.

```typescript
interface Props {
  id: string
  name: string
  address: string
  operatorType: OperatorType
  score: number | null
  locale: Locale
  queueUrl?: string // NEW
}
```

`queueUrl` is passed as `undefined` for municipal preschools (by omission); the render guard `operatorType === 'independent' && queueUrl` handles both.

### DirectoryPage.astro — PreschoolCard invocation (extended)

**File**: `src/components/astro/pages/DirectoryPage.astro`

**Change**: Add `queueUrl={preschool.queueUrl}` to the `<PreschoolCard ... />` call. The `preschool` object already carries `queueUrl` via `{ ...preschool, overallScore }` spread once the type is extended.

---

## Data Flow Diagram

```text
data/malmo/index.json
       │
       │  readFileSync (build time only)
       ▼
getPreschoolIndex()          ← returns PreschoolIndex (includes queueUrl? per entry)
       │
       │  flatMap + spread
       ▼
DirectoryPage.astro          ← destructures preschool fields incl. queueUrl
       │
       │  prop: queueUrl={preschool.queueUrl}
       ▼
PreschoolCard.astro          ← renders queue indicator when operatorType=independent && queueUrl

data/malmo/index.json
       │
       │  readFileSync (via getStaticPaths)
       ▼
[locale]/forskola/[id].astro ← props: { preschool: PreschoolIndexEntry, survey }
       │
       │  prop: preschool (includes queueUrl?)
       ▼
DetailPage.astro             ← renders queue link when operatorType=independent && preschool.queueUrl
```

---

## Test Contract Extensions

### Unit: `malmo-directory-index-contract.test.ts`

New assertions added inside the existing `describe` block:

- Every entry with `operatorType === 'independent'` MUST have `queueUrl` as a non-empty string matching `/^https?:\/\//`.
- Every entry with `operatorType === 'municipal'` MUST NOT have a `queueUrl` property.

### E2e: `preschool-detail-page-contract.spec.ts`

Two new `test()` blocks:

- `'detail page renders queue link for an independent preschool'` — navigates to the first rendered independent preschool's Swedish detail page; asserts a link with the Swedish `detail.queueLink` text is visible, has `target="_blank"`, `rel="noopener noreferrer"`, and `href` matching a non-empty URL.
- `'detail page does not render queue link for a municipal preschool'` — navigates to `almgardens-forskola` (canonical municipal); asserts no element with the `detail.queueLink` text is present.

### E2e: `directory-data-rendering.spec.ts`

Two new `test()` blocks:

- `'independent preschool cards display queue indicator'` — loads `sv/` directory; finds the first card matching a known independent preschool; asserts the queue indicator text (Swedish `detail.queueIndicator` value `"Har egen kö"`) is visible inside the card.
- `'municipal preschool cards do not display queue indicator'` — loads `sv/` directory; finds the `almgardens-forskola` card; asserts `"Har egen kö"` text is NOT present.
