# Quickstart: Survey PDF Link on Detail Pages

**Branch**: `013-survey-pdf-link`

## Prerequisites

- Node.js (see `.nvmrc` or `engines` in `package.json`)
- pnpm (required — enforced by `engines`)

## Setup

```bash
git checkout 013-survey-pdf-link
pnpm install
```

## Development

```bash
pnpm dev          # Astro dev server at http://localhost:4321
```

Open any preschool detail page to see the PDF link:
`http://localhost:4321/forskoleguiden/sv/forskola/{preschool-id}`

**Canonical test subject**: `almgardens-forskola` (municipal) — used by existing e2e tests in `tests/e2e/preschool-detail-page-contract.spec.ts` and in `tests/e2e/helpers.ts` (`DETAIL_URL`).

**Queue link test subject**: `bellevuegardens-montessoriforskola` (independent with `queueUrl`) — useful for verifying PDF link renders alongside the queue link.

## Key Files to Modify

| File | Change | Detail Reference |
|------|--------|-----------------|
| `src/lib/types.ts` | Add optional `surveyPdfUrl?: string` to `PreschoolSurvey` | [data-model.md § PreschoolSurvey](data-model.md#preschoolsurvey-modified) |
| `src/components/astro/page-shells/DetailPage.astro` | Add PDF link after queue link in actions area | [research.md § Decision 3](research.md#3-implementation-pattern) |
| `src/i18n/sv.json` | Add `detail.surveyPdfLink` key | [data-model.md § i18n Keys](data-model.md#i18n-keys-new) |
| `src/i18n/en.json` | Add `detail.surveyPdfLink` key | [data-model.md § i18n Keys](data-model.md#i18n-keys-new) |
| `src/i18n/ar.json` | Add `detail.surveyPdfLink` key | [data-model.md § i18n Keys](data-model.md#i18n-keys-new) |
| `data/malmo/2025/*.json` | Add `surveyPdfUrl` field to each preschool survey file | [data-model.md § Survey JSON File Format](data-model.md#survey-json-file-format-after-change) |
| `tests/unit/malmo-survey-files-contract.test.ts` | Update contract to accept optional `surveyPdfUrl` | [data-model.md § Contract Test Assertions](data-model.md#contract-test-assertions) |
| `tests/e2e/survey-pdf-link.spec.ts` | New: link presence, href, new-tab, omission | Follow pattern in `tests/e2e/preschool-detail-page-contract.spec.ts` |

## Implementation Pattern

Follow the existing queue link pattern in `DetailPage.astro` (see the `{preschool.operatorType === 'independent' && ...}` block for the full CSS class list and structure):

```astro
{
  survey.surveyPdfUrl &&
    /^https?:\/\//.test(survey.surveyPdfUrl) && (
      <a
        class="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-center text-caption/tight font-semibold text-primary-700 ring-1 ring-border transition-colors ring-inset hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none active:bg-gray-100"
        href={survey.surveyPdfUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <!-- Document/external-link SVG icon (aria-hidden, size-3.5, shrink-0) -->
        {t('detail.surveyPdfLink', locale)}
      </a>
    )
}
```

**Key differences from queue link**: The guard reads from `survey.surveyPdfUrl` (not `preschool.queueUrl`), and there is no operator-type check — PDF links apply to both municipal and independent preschools.

## PDF URL Source

All official PDF URLs are listed at:
`https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten/Resultat-fran-forskoleenkaten-2025.html`

See [research.md § Decision 4](research.md#4-data-population-strategy) for the matching strategy.

## Testing

```bash
pnpm test         # Unit tests (contract validation)
pnpm test:e2e     # E2e tests (link presence, href, new-tab)
pnpm validate     # Full quality gate
```

## Validation Checklist

- [ ] PDF link appears on a detail page with `surveyPdfUrl` set
- [ ] PDF link is absent on a detail page without `surveyPdfUrl`
- [ ] Link opens correct PDF in new tab
- [ ] Link label shows correct text for sv, en, ar locales
- [ ] Arabic RTL layout renders without overflow
- [ ] No horizontal overflow at 320 px viewport width
- [ ] Keyboard navigation: focus ring visible on PDF link
- [ ] `pnpm validate` passes
