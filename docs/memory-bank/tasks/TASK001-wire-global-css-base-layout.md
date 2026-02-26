# [TASK001] - Implement Step 3.1-3.3 layout shell

**Status**: Pending
**Added**: 2026-02-26
**Updated**: 2026-02-26

## Original Request

Track unfinished work for implementation plan Steps 3.1-3.3: create BaseLayout, Nav, and Footer; move Tailwind v4 global stylesheet wiring from the temporary root placeholder into BaseLayout.

## Thought Process

Global Tailwind CSS is temporarily imported in `src/pages/index.astro` to ensure CSS enters the module graph immediately. Steps 3.1-3.3 are the intended integration point for persistent structure: BaseLayout should import global CSS, and Nav/Footer should be composed in that layout for all locale pages.

## Implementation Plan

- Implement Step 3.1: create BaseLayout for localized pages and move global CSS import into the layout.
- Implement Step 3.2: add Nav component and include it in BaseLayout header.
- Implement Step 3.3: add Footer component with attribution and include it in BaseLayout footer.
- Confirm all routed pages receive expected Tailwind styles and remove redundant per-page global CSS imports.

## Progress Tracking

**Overall Status**: Not Started - 0%

### Subtasks

| ID  | Description                                     | Status      | Updated    | Notes                                                  |
| --- | ----------------------------------------------- | ----------- | ---------- | ------------------------------------------------------ |
| 1.1 | Create BaseLayout for locale pages (Step 3.1)   | Not Started | 2026-02-26 | Includes `title`/`locale` props and semantic structure |
| 1.2 | Move global stylesheet import into BaseLayout   | Not Started | 2026-02-26 | Keep import single-source                              |
| 1.3 | Create and wire Nav in BaseLayout (Step 3.2)    | Not Started | 2026-02-26 | Include Malmö/2025 static indicators                   |
| 1.4 | Create and wire Footer in BaseLayout (Step 3.3) | Not Started | 2026-02-26 | Include attribution link text                          |
| 1.5 | Validate styles/layout across locale routes     | Not Started | 2026-02-26 | Run `pnpm build` and spot-check pages                  |

## Progress Log

### 2026-02-26

- Created task from review feedback to track Step 3.1-3.3 layout shell work and CSS integration.
- Confirmed current temporary state: stylesheet is imported in `src/pages/index.astro` until BaseLayout/Nav/Footer are introduced.
