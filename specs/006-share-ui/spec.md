# Feature Specification: Share UI

**Feature Branch**: `006-share-ui`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Step 6 (6.1 to 6.3) from Phase 2: add share UI to the comparison page (copy shareable link to clipboard with confirmation feedback), restore compare sets from incoming shared URLs with error/warning handling, and add optional share button on preschool detail pages."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Parent Shares Their Comparison via Link (Priority: P1)

A parent has selected 2–5 preschools and is viewing the comparison page. They want to share their selection with their partner so the partner can see the same comparison. The parent clicks a "Share" button, and a shareable link is copied to their clipboard with a brief visual confirmation. They paste the link into a messaging app and send it.

**Why this priority**: Sharing is the core value proposition of this feature. Without a share button that generates and copies a link, the entire sharing flow is inaccessible. This is the minimum viable slice — a single button that produces a working link.

**Independent Test**: Can be tested end-to-end by loading the comparison page with 2+ preschools selected, clicking the share button, and asserting that: (a) a confirmation message appears briefly, (b) the clipboard contains a URL with the encoded share parameter, and (c) the URL is under 2,000 characters.

**Acceptance Scenarios**:

1. **Given** a parent has selected 2 preschools and is on the comparison page, **When** they click the "Share" button, **Then** a shareable URL is copied to their clipboard containing the `?s=` parameter with the encoded selection.
2. **Given** a parent clicks the "Share" button, **When** the link is successfully copied, **Then** a brief confirmation message (e.g., "Länk kopierad!") appears and automatically dismisses after 2–3 seconds.
3. **Given** a parent has selected 5 preschools, **When** they click the "Share" button, **Then** the generated URL (including the base path, locale segment, and query parameter) is under 2,000 characters total.
4. **Given** the Clipboard API is unavailable in the parent's browser, **When** they click the "Share" button, **Then** the shareable URL is displayed in a read-only text field so the parent can select and copy it manually.
5. **Given** a parent is on the comparison page with only 1 preschool selected, **When** they view the comparison page, **Then** the "Share" button is still visible and functional (sharing a single-preschool comparison is valid).

---

### User Story 2 — Partner Opens a Shared Link and Sees the Same Comparison (Priority: P1)

A partner receives a shared link in a messaging app and opens it in their browser. The comparison page loads and automatically restores the preschool selection from the URL, showing the same comparison the original parent saw. If some preschools in the link are no longer in the dataset (stale IDs), the partner sees a clear message explaining which preschools could not be found, while still viewing the valid ones.

**Why this priority**: Without link restoration, the sharing flow is broken — the share button produces a useless link. Restoration is the reciprocal half of the P1 sharing story and equally essential. Stale-ID handling is included here because partial restoration with a warning is a far better experience than silent data loss or a cryptic error.

**Independent Test**: Can be tested end-to-end by constructing a share URL with known preschool IDs, navigating to the URL, and asserting the comparison page displays the expected preschools. A separate test uses an invalid ID to verify the warning message appears.

**Acceptance Scenarios**:

1. **Given** a share URL with 2 valid preschool IDs encoded in the `?s=` parameter, **When** a user navigates to that URL, **Then** the comparison page displays both preschools with their full comparison data.
2. **Given** a share URL with 3 IDs where 1 is no longer in the dataset, **When** a user navigates to that URL, **Then** the comparison page displays the 2 valid preschools and shows a warning message stating that 1 preschool could not be found.
3. **Given** a share URL with a corrupted or invalid `?s=` value, **When** a user navigates to that URL, **Then** the comparison page shows an error message explaining the link could not be read, and provides a link back to the directory page.
4. **Given** a share URL is opened, **When** the compare set is successfully restored from the URL, **Then** the restored IDs replace any preschools the user may have previously had in their local compare set.
5. **Given** a share URL with 0 valid IDs (all stale), **When** a user navigates to that URL, **Then** the comparison page shows the empty state with the error message and a directory link — it does not show a blank comparison with zero preschools.

---

### ~~User Story 3 — Parent Shares a Single Preschool from Its Detail Page (Priority: P2)~~ [REMOVED]

> **Descoped**: Removed because the comparison page does not show a share button when only 1 preschool is selected (`ids.length >= 2`). A detail page share button that creates a single-preschool share link contradicts this behavior. The comparison page share button (US1) covers the core use case.

---

### Edge Cases

- The share button must not throw or produce a broken URL when `compareIds` is empty (0 selected preschools). If 0 preschools are selected on the comparison page, the share button should not be visible (the comparison page already shows the empty state in this case).
- Clipboard API write may fail silently in some browsers due to permission policies, focus requirements, or iframe sandboxing. The fallback (read-only text field) must handle this gracefully.
- The `?s=` query parameter may be modified by URL shorteners, messaging apps, or email clients (e.g., appending tracking parameters, truncating). Decoding must handle these scenarios by returning `null` for any input that does not decode to a valid payload.
- If the user navigates to the comparison page with a `?s=` parameter and also has existing selections in `sessionStorage`, the URL parameter takes precedence — the shared selection replaces the local state. After successful restoration, the `?s=` parameter is stripped from the address bar so that refreshing the page preserves any changes the user makes to their selection.
- The confirmation message must be accessible to screen reader users (announced via a live region), not just visually displayed.
- Share URLs must work across locales. A link shared from `/sv/jamfor/?s=...` must also work if the partner manually changes the locale to `/en/jamfor/?s=...` — the `?s=` payload does not contain locale information.
- Multiple rapid clicks on the share button should not produce multiple confirmation messages or erratic behavior.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The comparison page MUST display a "Share" button when 1 or more preschools are selected. The share button MUST NOT be displayed when 0 preschools are selected (the comparison page shows the empty state in this case).
- **FR-002**: Clicking the share button MUST generate a shareable URL by calling the existing `encodeShareState()` function with the current compare set IDs.
- **FR-003**: The generated share URL MUST follow the pattern `{origin}{basePath}/{locale}/jamfor/?s={encoded}` where `{encoded}` is the output of `encodeShareState()`.
- **FR-004**: The share button MUST copy the generated URL to the user's clipboard using the Clipboard API.
- **FR-005**: After a successful copy, the system MUST display a brief confirmation message that auto-dismisses after 2–3 seconds.
- **FR-006**: If the Clipboard API is unavailable or the copy operation fails, the system MUST fall back to displaying the URL in a read-only text field with a close/dismiss button. The user MUST be able to dismiss the text field when done copying.
- **FR-007**: The confirmation message MUST be announced to screen reader users via an accessible live region.
- **FR-008**: When the comparison page loads with a `?s=` query parameter, the system MUST decode the parameter using the existing `decodeShareState()` function.
- **FR-009**: If decoding succeeds, the system MUST validate the decoded IDs against the known preschool index using the existing `validateShareIds()` function.
- **FR-010**: If all decoded IDs are valid, the system MUST populate the compare set with those IDs, replacing any existing local selections.
- **FR-011**: If some decoded IDs are invalid (stale), the system MUST populate the compare set with only the valid IDs and display a dismissable, localized warning message stating how many preschools could not be found. The user MUST be able to close the warning; once dismissed, it MUST NOT reappear during the same page session.
- **FR-012**: If decoding fails entirely (corrupted payload), the system MUST display a localized error message and provide a link back to the directory page.
- **FR-013**: If all decoded IDs are invalid (none found in the index), the system MUST display the error state with a directory link — not an empty comparison grid.
- ~~**FR-014**~~: [REMOVED — descoped with User Story 3]
- ~~**FR-015**~~: [REMOVED — descoped with User Story 3]
- ~~**FR-016**~~: [REMOVED — descoped with User Story 3]
- **FR-017**: All user-facing text for the share feature (button labels, confirmation message, warning message, error message) MUST be localized via i18n keys for all supported locales.
- **FR-018**: The share button MUST be keyboard accessible and operable (focusable, activatable with Enter/Space).
- **FR-019**: Multiple rapid clicks on the share button MUST NOT produce duplicate confirmation messages or erratic behavior.
- **FR-020**: After the compare set is successfully restored from a `?s=` query parameter, the system MUST remove the `?s=` parameter from the browser's address bar without triggering a page reload, so that a subsequent page refresh uses the locally persisted state rather than re-triggering restoration.

### Key Entities

- **Share URL**: A complete URL consisting of origin, base path, locale segment, comparison route, and the `?s=` query parameter containing the compressed share payload. Produced by the share button; consumed by the share restoration flow.
- **Confirmation message**: A transient, auto-dismissing notification shown after a successful clipboard copy. Must be both visually displayed and announced to assistive technologies.
- **Warning message**: A dismissable in-page notification displayed when a shared link contains stale preschool IDs. Lists the count of preschools that could not be found. Shown alongside the valid comparison results until the user closes it.
- **Error message**: A persistent in-page notification displayed when share link decoding fails entirely. Accompanied by a navigation link back to the directory page.
- **Clipboard fallback**: A read-only text field with a close button, shown when the Clipboard API is unavailable. Contains the share URL for manual selection and copying. Dismissed by the user via the close button.

## Clarifications

### Session 2026-03-25

- Q: Should the share button appear when only 1 preschool is selected? → A: Yes. Sharing a single-preschool link is valid — the recipient can then add more preschools for comparison. The comparison page already supports a 1-selected state with a prompt to add more.
- Q: Should `?s=` be stripped from the address bar after successful restoration? → A: Yes. Strip the `?s=` parameter from the address bar after the compare set is successfully restored. This prevents a page refresh from re-triggering restoration and overwriting any changes the user made post-arrival. Re-sharing requires clicking the Share button.
- Q: Should the stale-ID warning message be dismissable? → A: Yes. The warning is dismissable — the user can close it with a button. Once dismissed, it does not reappear. The user has been informed and there is nothing actionable about a missing preschool.
- Q: How should the clipboard fallback text field be dismissed? → A: The fallback text field has a close/dismiss button the user clicks when done copying. This is consistent with the warning message dismiss pattern.
- Q: Should the `?s=` parameter take precedence over existing `sessionStorage` selections? → A: Yes. When a share URL is opened, the shared selection replaces whatever the user had locally. This matches user intent — they clicked a link specifically to see someone else's selection.
- Q: Where should the share button be positioned on the comparison page? → A: Near the comparison heading or in the page's action area, visually grouped with other actions (if any). The exact placement is a design decision resolved during implementation.
- ~~Q: Should the detail page share button look identical to the comparison page share button?~~ → [REMOVED — descoped with User Story 3]

## Assumptions

- The `encodeShareState()`, `decodeShareState()`, and `validateShareIds()` functions from `src/lib/share.ts` are fully implemented and tested (Step 5 / spec 005 is complete). This feature only adds UI that calls those functions.
- The Clipboard API (`navigator.clipboard.writeText()`) is available in all modern browsers the project targets. The fallback text field is a progressive enhancement for edge cases, not a primary code path.
- The preschool index (list of known IDs) is available to the comparison page component at render time, passed as props from the Astro page. No runtime data fetching is needed for ID validation.
- The live region for the confirmation message can be implemented with standard ARIA attributes (e.g., `role="status"` or `aria-live="polite"`) without additional libraries.
- The confirmation message auto-dismiss timing (2–3 seconds) does not need to be configurable. A fixed duration is sufficient.
- The share URL length for 5 Malmö preschool IDs stays well under 2,000 characters (verified by Step 5 unit tests). No URL-length check is needed in the UI layer.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user on the comparison page with 2+ preschools selected can click the share button and receive a clipboard-copied URL in under 1 second, confirmed by a visible and screen-reader-announced notification.
- **SC-002**: A user navigating to a valid share URL sees the comparison page populated with the shared preschool selection, matching exactly the preschools encoded in the link.
- **SC-003**: A user navigating to a share URL with 1 stale ID out of 3 sees 2 preschools compared and a warning message mentioning 1 missing preschool.
- **SC-004**: A user navigating to a share URL with a corrupted payload sees a clear error message and a working link back to the directory.
- **SC-005**: A user on a preschool detail page can click the share button and receive a clipboard-copied URL that, when opened, shows the comparison page with that single preschool.
- **SC-006**: All share-related UI text renders correctly in all three supported locales (Swedish, English, Arabic) with no missing-translation fallbacks.
- **SC-007**: The share button on both pages is keyboard accessible — focusable with Tab and activatable with Enter or Space.
- **SC-008**: All existing tests (unit, e2e, post-build) pass without regression after the share UI is implemented.
