# Quickstart: Accessibility Audit (Phase 2)

**Feature**: 008-accessibility-audit-phase2
**Branch**: `008-accessibility-audit-phase2`

## Prerequisites

- Node.js (version matching project `.nvmrc` or `engines` field)
- pnpm installed
- Playwright browsers installed (`pnpm exec playwright install`)

## Setup

```bash
git checkout 008-accessibility-audit-phase2
pnpm install
```

## Development Workflow

### 1. Run existing accessibility tests (baseline)

```bash
pnpm test:e2e --grep "accessibility"
```

Verify all existing axe-core tests pass before making changes.

### 2. Run keyboard navigation tests (baseline)

```bash
pnpm test:e2e --grep "keyboard navigation"
```

### 3. Run the full e2e suite

```bash
pnpm test:e2e
```

### 4. Run individual test files during development

```bash
# Axe-core tests only
pnpm exec playwright test tests/e2e/accessibility-axe-core.spec.ts

# Keyboard navigation tests only
pnpm exec playwright test tests/e2e/keyboard-navigation-focus-ring.spec.ts

# Screen reader labeling tests only (new file)
pnpm exec playwright test tests/e2e/accessibility-phase2-screen-reader.spec.ts
```

### 5. Run with debug UI

```bash
pnpm exec playwright test tests/e2e/accessibility-axe-core.spec.ts --ui
```

### 6. Full validation

```bash
pnpm validate
```

## Key Files

| File | Action | Purpose |
|------|--------|---------|
| `tests/e2e/accessibility-axe-core.spec.ts` | MODIFY | Add English locale axe-core scans (directory, detail, comparison) |
| `tests/e2e/keyboard-navigation-focus-ring.spec.ts` | MODIFY | Add keyboard tests for language switcher, share button, queue link |
| `tests/e2e/accessibility-phase2-screen-reader.spec.ts` | CREATE | ARIA landmark, live region, and labeling assertions |
| `tests/e2e/helpers.ts` | READ | URL constants for all locales already defined |
| `tests/e2e/fixtures.ts` | READ | `getFocusRingContract`, `getFocusOutlineContract` helpers |

## Testing Patterns

### Axe-core scanning pattern

```typescript
import { AxeBuilder } from '@axe-core/playwright'

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze()

expect(results.violations).toEqual([])
```

### Hydration guard pattern

Wait for Preact islands to mount before testing:

```typescript
// Directory page: wait for CompareButton
await expect(
  page.getByTestId('preschool-card').first().getByRole('button', { name: /Compare/ })
).toHaveAttribute('aria-pressed', 'false')

// Comparison page: wait for scroll container
await expect(page.getByTestId('comparison-scroll')).toBeVisible()
```

### SessionStorage seeding pattern

```typescript
await page.goto(DIRECTORY_URL_EN)
await page.evaluate((ids) => {
  sessionStorage.setItem('compareIds', JSON.stringify(ids))
}, ['almgardens-forskola', 'augustenborgs-forskola'])
await page.goto(COMPARISON_URL_EN)
```

### Focus ring assertion pattern

```typescript
import { getFocusRingContract } from './fixtures'
import { FOCUS_RING_COLOR } from './helpers'

const focusRing = await getFocusRingContract(element)
expect(focusRing.boxShadow).toContain(FOCUS_RING_COLOR)
expect(focusRing.outlineStyle).toBe('none')
```
