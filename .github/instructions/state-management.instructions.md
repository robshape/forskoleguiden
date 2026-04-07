---
applyTo: 'src/lib/state.ts'
description: 'Compare shortlist state management with nanostores + sessionStorage. SSR/MPA safety details and API contract.'
---

# State Management

`src/lib/state.ts` manages the compare shortlist with nanostores + `sessionStorage`.

## API

- `compareIds` — read-only atom of selected preschool IDs (max `MAX_COMPARE = 5`)
- `toggleCompare(id)` — add/remove an ID; silently refuses when at max capacity
- `clearCompare()` — reset all selections
- `setCompareIds(ids)` — bulk-replace all selected IDs (used by share restoration)

## Consumption

Preact islands use `useStore(compareIds)` from `@nanostores/preact`. Never write to the internal atom directly — only use the exported functions above.

## Safety guarantees

- **SSR-safe**: browser guards (`typeof window` / `typeof sessionStorage`) prevent build-time crashes. Safe to import in Astro front matter — returns empty defaults server-side.
- **MPA-safe**: `sessionStorage` survives Astro page navigations. Preact islands re-subscribe on each page's hydration via `listen()` callback.

## Persistence

- `listen()` callback writes to `sessionStorage` on every change
- Hydration reads persisted state on first client mount
