# Research: Share UI

**Feature**: 006-share-ui
**Date**: 2026-03-25

## R1: Clipboard API Usage Pattern

**Decision**: Use `navigator.clipboard.writeText()` with try/catch, falling back to a read-only text field when the API is unavailable or the write fails.

**Rationale**: `navigator.clipboard.writeText()` is supported in all modern browsers the project targets (Chrome 66+, Firefox 63+, Safari 13.1+, Edge 79+). It returns a Promise, making error handling straightforward. The fallback covers: (a) browsers without the API, (b) non-secure contexts (HTTP, though GitHub Pages is HTTPS), (c) permission denials in sandboxed iframes, (d) user agent–specific focus requirements.

**Alternatives considered**:

- `document.execCommand('copy')` — deprecated, inconsistent behavior, requires creating a temporary textarea and selecting text. Would work as a fallback but adds complexity for an edge case. The read-only text field is simpler and more accessible.
- Third-party clipboard libraries (e.g., clipboard.js) — unnecessary dependency for a single `writeText()` call. Violates the project's zero-external-runtime-dependency principle.

**Implementation**:

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

## R2: URL Parameter Stripping via history.replaceState

**Decision**: Use `window.history.replaceState()` to remove the `?s=` query parameter from the address bar after successful share restoration, without triggering a page reload.

**Rationale**: `history.replaceState()` modifies the current history entry's URL without navigating. This is the standard pattern for removing consumed query parameters in SPAs and hydrated islands. It works in all target browsers and does not trigger Astro page transitions or Preact re-renders (it's a browser-level operation outside the framework's scope).

**Alternatives considered**:

- `history.pushState()` — adds a new history entry, which would make the Back button go to the `?s=` URL again (and re-trigger restoration). `replaceState` is the correct choice since the parameter is consumed.
- Leaving `?s=` in the URL — violates FR-020. A page refresh would re-trigger restoration, overwriting any changes the user made to their selection.
- Server-side redirect — not possible in a static site.

**Implementation**:

```typescript
const stripShareParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('s')
  window.history.replaceState({}, '', url.pathname + url.search)
}
```

## R3: Accessible Confirmation/Warning/Error Notifications

**Decision**: Use ARIA live regions with appropriate roles for transient and persistent notifications.

**Rationale**: Screen readers must announce share UI feedback. The W3C WAI-ARIA pattern for notifications maps directly:

- **Confirmation** ("Link copied!"): `role="status"` (equivalent to `aria-live="polite"`) — non-urgent, announced after current speech.
- **Warning** (stale IDs): `role="status"` with `aria-live="polite"` — informational, not blocking.
- **Error** (corrupted payload): `role="alert"` (equivalent to `aria-live="assertive"`) — requires immediate attention.

The live region container must exist in the DOM before content is inserted for consistent announcements across screen readers (NVDA, VoiceOver, JAWS).

**Alternatives considered**:

- `aria-live="assertive"` for all messages — too aggressive for success confirmations. Would interrupt the user unnecessarily.
- Toast library (react-hot-toast, etc.) — unnecessary dependency. The notification is simple enough to implement with a `<div>` and a `setTimeout`.
- `<dialog>` element — too heavy for a transient confirmation. Appropriate for the clipboard fallback (modal-like), but the fallback is simple enough as an inline read-only field.

## R4: Bulk Compare Set Update (setCompareIds)

**Decision**: Add a `setCompareIds(ids: string[])` action to `src/lib/state.ts` that replaces the entire compare set atomically.

**Rationale**: The existing API only has `toggleCompare(id)` (one at a time) and `clearCompare()`. Share restoration needs to set 1–5 IDs at once. Calling `clearCompare()` + `toggleCompare()` in a loop would:

1. Trigger `N + 1` store updates and `N + 1` sessionStorage writes (wasteful).
2. Cause intermediate renders where the compare set is partially populated (visual flicker in `ComparisonView`).
3. Race with the nanostore `listen()` callback that persists to sessionStorage.

A single `setCompareIds()` action encapsulates the operation, triggers exactly one store update, one persist, and one re-render.

**Alternatives considered**:

- `clearCompare()` then loop `toggleCompare()` — causes flicker and unnecessary re-renders as described above.
- Direct atom access (`compareIdsStore.set()`) — bypasses the module's encapsulation. The state module intentionally exposes only action functions.
- Adding a batch mode to `toggleCompare()` — overcomplicates the API for a one-time use case. A simple setter is cleaner.

**Implementation**:

```typescript
// Added to src/lib/state.ts
export const setCompareIds = (ids: string[]) => {
  compareIdsStore.set(ids.slice(0, MAX_COMPARE))
}
```

## R5: Share Button Placement and Debounce

**Decision**: The comparison page share button is rendered inside `ComparisonView` (after the selected-count heading, before the comparison stack). On the detail page, a `ShareButton` Preact island is rendered in the hero actions area. Multiple rapid clicks are handled by ignoring clicks while a confirmation is already visible.

**Rationale**: The comparison page share button belongs logically with the comparison content, not the tray. It should be visible when preschools are selected. The detail page needs an independently hydrated island because the surrounding markup is static Astro.

For debounce: rather than a time-based debounce, the share button ignores clicks while `feedbackState !== 'idle'`. This is simpler and more predictable — the user sees the confirmation, and the button is effectively disabled until it auto-dismisses.

**Alternatives considered**:

- Share button in `CompareTray` — the tray is a navigation bar, not a content area. Adding a share button there would crowd the already-dense mobile layout.
- `setTimeout`-based debounce — more complex, doesn't tie to the visual state. The user could still see duplicate confirmations if timing is unlucky.
- `disabled` attribute on the button — disabling is an anti-pattern for accessibility (screen readers may skip disabled elements). Better to accept the click but no-op.

## R6: Share URL Construction

**Decision**: Build the share URL as `${window.location.origin}${getBasePath()}/${locale}/jamfor/?s=${encodeShareState(ids)}`. The locale is passed as a prop to the share component.

**Rationale**: Uses the current origin (handles localhost, GitHub Pages, custom domains). `getBasePath()` handles the `/forskoleguiden` prefix. The locale comes from props (set at build time by the Astro page). The comparison route is hardcoded as `jamfor` since it's the same across locales.

**Alternatives considered**:

- Using `window.location.pathname` to infer locale — fragile, depends on URL structure staying constant. Props are explicit and type-safe.
- Encoding locale in the share payload — the spec explicitly states share URLs work cross-locale (the `?s=` payload is locale-agnostic). The URL's locale segment determines display language, not the payload.

## R7: ComparisonView Integration Strategy

**Decision**: Add share restoration logic and share UI to the existing `ComparisonView` component rather than creating a wrapper island.

**Rationale**: `ComparisonView` already reads `compareIds` store, manages the comparison lifecycle, and receives all survey data as props. Share restoration (reading `?s=`, decoding, validating, calling `setCompareIds()`) is a side effect that runs once on mount — a `useEffect` hook in `ComparisonView` is the natural home. The share button and feedback UI are children of the same component tree.

Creating a separate wrapper would require either (a) prop-drilling survey data through another layer, or (b) a second island that reads the same store — both add complexity without benefit.

**Implementation approach**:

1. `ComparisonView` receives new props: `shareButtonLabel`, `shareCopiedLabel`, `shareErrorLabel`, `shareWarningTemplate`, `shareCorruptedLabel`, `directoryLinkLabel`, `knownIds` (for validation).
2. A `useEffect([], ...)` hook reads `?s=` from `window.location.search`, decodes, validates, and calls `setCompareIds()`.
3. A `feedbackState` (`useState`) tracks: `'idle' | 'copied' | 'fallback' | 'warning' | 'error'`.
4. `ShareFeedback` sub-component renders the appropriate notification based on `feedbackState`.
