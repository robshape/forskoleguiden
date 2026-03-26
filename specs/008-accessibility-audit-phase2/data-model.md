# Data Model: Accessibility Audit (Phase 2)

**Feature**: 008-accessibility-audit-phase2
**Date**: 2026-03-26

## Overview

This feature introduces no data model changes. It is a test-only feature that validates existing DOM structure, ARIA attributes, and keyboard behavior across all locale pages.

## Entities Referenced (read-only)

The tests interact with the following existing entities via DOM queries and sessionStorage seeding. No entities are created, modified, or extended.

### Locale Page (test parameter)

| Field | Type | Values |
|-------|------|--------|
| locale | string | `'sv'`, `'en'`, `'ar'` |
| pageType | string | `'directory'`, `'detail'`, `'comparison'` |
| url | string | Composed from base path + locale + route |

Note: The about page (`om/`) is excluded because the routes do not yet exist.

### Compare Seed (sessionStorage fixture)

| Field | Type | Purpose |
|-------|------|---------|
| compareIds | string[] | Array of preschool IDs written to sessionStorage before navigating to comparison page |

Existing pattern: `sessionStorage.setItem('compareIds', JSON.stringify(ids))`

### Interactive Element (test subject)

| Element | Selector Strategy | Source |
|---------|-------------------|--------|
| Language switcher nav | `nav` with aria-label containing language keyword | `LanguageSwitcher.astro` |
| Language toggle | `[data-testid="header-language-toggle"]` | `LanguageSwitcher.astro` |
| Language options | `[data-testid="header-language-options"]` links | `LanguageSwitcher.astro` |
| Active locale | `button[aria-current="page"]` | `LanguageSwitcher.astro` |
| Share button | `[data-testid="share-comparison-button"]` | `ComparisonView.tsx` |
| Share feedback (copied) | `[data-testid="share-feedback-copied"]` with `role="status"` | `ShareFeedback.tsx` |
| Share feedback (warning) | `[data-testid="share-feedback-warning"]` with `role="status"` | `ShareFeedback.tsx` |
| Share feedback (error) | `[data-testid="share-feedback-error"]` with `role="alert"` | `ShareFeedback.tsx` |
| Queue link | `a[target="_blank"][rel="noopener noreferrer"]` in detail page | `DetailPage.astro` |

## State Transitions

No state transitions introduced. Tests observe existing state:

1. **Compare seeding**: Tests write IDs to sessionStorage → navigate to comparison page → ComparisonView reads store
2. **Share flow**: Click share button → feedbackState transitions from `idle` → `copied` (auto-dismiss after 2500ms) or `fallback`/`warning`/`error`
3. **Language switch**: Click toggle → details opens → click locale link → full page navigation to new locale
