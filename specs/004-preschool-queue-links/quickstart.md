# Quickstart: Independent Preschool Queue Links

**Feature**: `004-preschool-queue-links`
**Date**: 2026-03-24
**Branch**: `004-preschool-queue-links`

## Overview

This feature adds a queue registration link to independent preschool detail pages and a passive queue indicator to directory cards. No new Astro pages, no new Preact islands, no new npm packages.

---

## Step-to-Detail Traceability

Use this map during implementation — each step has a single source of truth for its requirements and design decisions.

| Step                                 | Primary outcome                                                                     | Requirement source                                | Implementation detail source                                                                                                                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Extend TypeScript type            | `queueUrl?: string` added to `PreschoolIndexEntry`                                  | [spec.md](spec.md) FR-001, FR-013                 | [data-model.md → PreschoolIndexEntry](data-model.md#preschoolindexentry-extended)                                                                                                                                                                           |
| 2. Write failing tests               | Contract + detail e2e + directory e2e tests — all initially red                     | [spec.md](spec.md) US-1, US-2                     | [data-model.md → Test Contract Extensions](data-model.md#test-contract-extensions) · [research.md → Decision 6](research.md#decision-6-test-strategy) · [research.md → Decision 7](research.md#decision-7-independent-preschool-test-subject-for-e2e-tests) |
| 3. Add i18n keys                     | `detail.queueLink` + `detail.queueIndicator` in all 3 locales                       | [spec.md](spec.md) FR-003, FR-011                 | [data-model.md → i18n Keys](data-model.md#i18n-keys)                                                                                                                                                                                                        |
| 4. Add queue URL data                | `queueUrl` placeholder on all 71 independent `index.json` entries                   | [spec.md](spec.md) FR-001, FR-013                 | [data-model.md → index.json entries](data-model.md#indexjson-entries-data)                                                                                                                                                                                  |
| 5. Render queue link on detail pages | Conditional `<a>` in `DetailPage.astro` Actions section                             | [spec.md](spec.md) FR-001, FR-002, FR-006, FR-007 | [research.md → Decision 1](research.md#decision-1-where-to-place-the-queue-link-on-the-detail-page) · [data-model.md → Data Flow](data-model.md#data-flow-diagram)                                                                                          |
| 6. Add queue indicator to cards      | Passive `<span>` in `PreschoolCard.astro`; prop threaded from `DirectoryPage.astro` | [spec.md](spec.md) FR-008, FR-009, FR-010         | [research.md → Decision 2](research.md#decision-2-how-to-pass-queueurl-to-preschoolcard) · [research.md → Decision 3](research.md#decision-3-queue-indicator-position-within-the-card) · [data-model.md → Component Props](data-model.md#component-props)   |
| 7. Run full quality gate             | All constitution gates pass; feature shippable                                      | [spec.md](spec.md) SC-001 – SC-008                | —                                                                                                                                                                                                                                                           |

_Spec: [`spec.md`](spec.md) · Research: [`research.md`](research.md) · Data model: [`data-model.md`](data-model.md)_

---

## Implementation Order

Work through these steps in sequence. Each step is independently verifiable — run `pnpm build && pnpm check` after each to confirm no regressions before proceeding.

---

### Step 1 — Extend the TypeScript type

**File**: `src/lib/types.ts`

Add `queueUrl?: string` to `PreschoolIndexEntry`:

```typescript
export type PreschoolIndexEntry = {
  id: string
  name: string
  address: string
  operatorType: OperatorType
  queueUrl?: string // URL to independent preschool's queue registration page
}
```

**Verify**: `pnpm check` passes (TypeScript strict mode).

---

### Step 2 — Add failing tests (test-first)

Per the constitution's bug-fix/feature rule, write the tests that will initially fail before touching production code.

#### 2a — Unit test (index contract)

In `tests/unit/malmo-directory-index-contract.test.ts`, inside the existing `describe` block, add:

```typescript
it('should have queueUrl on every independent preschool and no queueUrl on any municipal preschool', () => {
  const parsed = getMalmoIndex()

  for (const [index, entry] of parsed.preschools.entries()) {
    const label = `entry ${index} (${entry.id})`

    if (entry.operatorType === 'independent') {
      expect(
        typeof (entry as { queueUrl?: string }).queueUrl,
        `${label}: independent preschool must have queueUrl`,
      ).toBe('string')
      expect(
        ((entry as { queueUrl?: string }).queueUrl ?? '').length,
        `${label}: queueUrl must be non-empty`,
      ).toBeGreaterThan(0)
      expect(
        (entry as { queueUrl?: string }).queueUrl,
        `${label}: queueUrl must look like a URL`,
      ).toMatch(/^https?:\/\//)
    } else {
      expect(
        (entry as { queueUrl?: unknown }).queueUrl,
        `${label}: municipal preschool must not have queueUrl`,
      ).toBeUndefined()
    }
  }
})
```

Run `pnpm test` — this test should **fail** (no `queueUrl` in the data yet).

#### 2b — E2e test: detail page queue link

In `tests/e2e/preschool-detail-page-contract.spec.ts`, add at the end of the `test.describe` block:

```typescript
test('detail page renders queue link for an independent preschool', async ({
  page,
}) => {
  const firstIndependent = renderedPreschools.find(
    (p) => (p as { operatorType: string }).operatorType === 'independent',
  )
  if (!firstIndependent)
    throw new Error('No rendered independent preschool found in index')

  const url = `/forskoleguiden/sv/forskola/${firstIndependent.id}/`
  await page.goto(url)

  const queueLink = page.getByRole('link', { name: 'Anmäl dig till kö' })
  await expect(queueLink).toBeVisible()
  await expect(queueLink).toHaveAttribute('target', '_blank')
  await expect(queueLink).toHaveAttribute('rel', 'noopener noreferrer')
  const href = await queueLink.getAttribute('href')
  expect(href).toBeTruthy()
  expect(href).toMatch(/^https?:\/\//)
})

test('detail page does not render queue link for a municipal preschool', async ({
  page,
}) => {
  await page.goto(TEST_URL) // almgardens-forskola — canonical municipal

  await expect(
    page.getByRole('link', { name: 'Anmäl dig till kö' }),
  ).not.toBeVisible()
})
```

#### 2c — E2e test: directory card indicator

In `tests/e2e/directory-data-rendering.spec.ts`, add at the end of the `test.describe` block:

> **Pattern**: Use `getDirectoryCard(page, name)` from `./helpers` (already imported in this file) rather than `.filter({ hasText })`. See [research.md → Decision 7](research.md#decision-7-independent-preschool-test-subject-for-e2e-tests) for the test subject selection rationale.

```typescript
test('independent preschool cards display queue indicator', async ({
  page,
}) => {
  await page.goto('/forskoleguiden/sv/')

  // Al-Salamah språkförskola is the first alphabetical independent preschool.
  // getDirectoryCard is already imported from './helpers' in this file.
  const independentCard = getDirectoryCard(page, 'Al-Salamah språkförskola')

  await expect(independentCard.getByText('Har egen kö')).toBeVisible()
})

test('municipal preschool cards do not display queue indicator', async ({
  page,
}) => {
  await page.goto('/forskoleguiden/sv/')

  const municipalCard = getDirectoryCard(page, 'Almgårdens förskola')

  await expect(municipalCard.getByText('Har egen kö')).not.toBeVisible()
})
```

---

### Step 3 — Add i18n keys

Add two keys to all three locale files under the existing `"detail"` namespace.

**`src/i18n/sv.json`**:

```json
"detail": {
  "metaDescription": "Se enkätresultat för {name} i Malmö. Jämför betyg med andra förskolor.",
  "queueLink": "Anmäl dig till kö",
  "queueIndicator": "Har egen kö"
}
```

**`src/i18n/en.json`**:

```json
"detail": {
  "metaDescription": "See survey results for {name} in Malmö. Compare ratings with other preschools.",
  "queueLink": "Register for queue",
  "queueIndicator": "Has own queue"
}
```

**`src/i18n/ar.json`**:

```json
"detail": {
  "metaDescription": "...",   // existing value — keep unchanged
  "queueLink": "سجّل في قائمة الانتظار",
  "queueIndicator": "لها قائمة انتظار خاصة"
}
```

**Verify**: `pnpm test` — i18n key-parity test passes.

---

### Step 4 — Add queue URL data for independent preschools

In `data/malmo/index.json`, add `"queueUrl": "https://example.com/queue/{id}"` to all 71 `"operatorType": "independent"` entries.

Example:

```json
{
  "id": "al-salamah-sprakforskola",
  "name": "Al-Salamah språkförskola",
  "address": "Kvarnbyvägen 18, Malmö",
  "operatorType": "independent",
  "queueUrl": "https://example.com/queue/al-salamah-sprakforskola"
}
```

Update `data/README.md` to note:

```markdown
- `queueUrl` on independent preschool entries — placeholder URLs (`https://example.com/queue/{id}`). Replace with real queue registration URLs when available.
```

**Verify**: `pnpm test` — unit contract test (`malmo-directory-index-contract`) now **passes**.

---

### Step 5 — Render queue link on detail pages

**File**: `src/components/astro/pages/DetailPage.astro`

In the `<!-- Actions -->` `<div>`, after the `CompareButton` component:

```astro
<!-- Queue registration link (independent preschools only) -->{
  preschool.operatorType === 'independent' && preschool.queueUrl && (
    <a
      class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      href={preschool.queueUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        class="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {t('detail.queueLink', locale)}
    </a>
  )
}
```

**Verify**: `pnpm build && pnpm check` — builds without error.

---

### Step 6 — Add queue indicator to directory cards

**File**: `src/components/astro/PreschoolCard.astro`

1. Add `queueUrl?: string` to the `Props` interface and destructure.
2. Inside the card's lower row (in the `flex items-center gap-3` block alongside the score badge legend), render the indicator conditionally:

```astro
{
  operatorType === 'independent' && queueUrl && (
    <span class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
      <svg
        aria-hidden="true"
        class="size-3 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {t('detail.queueIndicator', locale)}
    </span>
  )
}
```

1. Update `DirectoryPage.astro` to pass the new prop:

```astro
<PreschoolCard
  address={preschool.address}
  id={preschool.id}
  locale={locale}
  name={preschool.name}
  operatorType={preschool.operatorType}
  queueUrl={preschool.queueUrl}
  score={preschool.overallScore}
/>
```

**Verify**: `pnpm build` — cards render for all preschools.

---

### Step 7 — Run the full quality gate

```sh
pnpm validate
```

All steps must pass: lint, format, type check, unit tests (incl. new contract assertions), build, e2e tests (incl. new queue link and indicator tests), post-build budget, Lighthouse.

---

## Verification Checklist

After `pnpm validate` passes, manually spot-check:

- [ ] Open `/sv/forskola/al-salamah-sprakforskola/` — queue link "Anmäl dig till kö" is visible and opens in a new tab.
- [ ] Open `/en/forskola/al-salamah-sprakforskola/` — queue link shows "Register for queue".
- [ ] Open `/ar/forskola/al-salamah-sprakforskola/` — queue link shows Arabic text, aligned for RTL, no overflow.
- [ ] Open `/sv/forskola/almgardens-forskola/` — NO queue link present.
- [ ] Open `/sv/` — Al-Salamah card shows "Har egen kö" indicator; Almgårdens card does NOT.
- [ ] Open `/ar/` — queue indicators appear with Arabic text on independent cards, no overflow on narrow viewport.
