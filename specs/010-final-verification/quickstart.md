# Quickstart: Phase 2 Final Verification

**Date**: 2026-03-26

## Prerequisites

- All Phase 2 features (Steps 0–9) are fully implemented and merged
- `pnpm install` has been run (all dependencies including `lz-string` are installed)
- Node.js and pnpm are available

## New File

```
tests/e2e/user-flow-phase2.spec.ts    # Comprehensive Phase 2 user journey test
```

## Running the Phase 2 User Flow Test

```bash
# Run only the new Phase 2 user flow test
pnpm exec playwright test tests/e2e/user-flow-phase2.spec.ts

# Run all e2e tests (includes Phase 1 + Phase 2 + all existing tests)
pnpm test:e2e
```

## Running the Full Validation Pipeline

```bash
# Complete quality gate — this is the primary deliverable of this feature
pnpm validate
```

This runs sequentially: lint → lint:md → format → check → unit tests → build → post-build tests → e2e (Chromium) → e2e (WebKit) → Lighthouse audit.

Exit code 0 = Phase 2 is ready to ship.

## Verifying Post-Build Output Manually

```bash
# Build the site
pnpm build

# Count HTML files per locale
find dist/forskoleguiden/sv -name '*.html' | wc -l
find dist/forskoleguiden/en -name '*.html' | wc -l
find dist/forskoleguiden/ar -name '*.html' | wc -l

# Verify locale attributes
grep -o 'lang="[^"]*"' dist/forskoleguiden/en/index.html
grep -o 'dir="[^"]*"' dist/forskoleguiden/ar/index.html
```

## Key Test Helpers

The e2e test uses existing helpers from `tests/e2e/helpers.ts`:

- `DIRECTORY_URL` / `COMPARISON_URL` / `DETAIL_URL` — locale-scoped URL constants
- `encodeSharePayload(ids)` — creates a v1 share URL payload for testing restore
- `getDirectoryCard(page, name)` — locates a preschool card by name
- `getCompareButton(page, name)` — locates the compare button within a card
- `waitForCompareButtonReady(page, name)` — hydration guard for compare buttons
- `waitForCompareButtonSelected(page, name)` — waits for pressed state
