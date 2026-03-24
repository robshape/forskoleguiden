# Research: Independent Preschool Queue Links

**Feature**: `004-preschool-queue-links`
**Date**: 2026-03-24

## Decision Log

### Decision 1: Where to place the queue link on the detail page

**Decision**: Inside the existing `<!-- Actions -->` `<div>` in `DetailPage.astro`, after the `CompareButton` island.

**Rationale**: The Actions section already groups the primary interactive/navigation element for the preschool (the CompareButton). The queue link is the second call-to-action for independent preschools — joining the queue after deciding to compare. Placing it directly below the CompareButton keeps both actions together in one logical area above the survey data fold, which matches FR-007 ("visible without scrolling past the survey question sections").

**Alternatives considered**:

- Above CompareButton: rejected — CompareButton is the primary selection action for all preschools; the queue link is secondary and independent-only.
- Inside the metadata row (address/operator type): rejected — metadata is descriptive, not actionable. Mixing a call-to-action into a metadata strip would violate visual hierarchy expectations.
- At the bottom of the page below the survey results: rejected — FR-007 requires it to be visible without scrolling past the question sections.

---

### Decision 2: How to pass `queueUrl` to `PreschoolCard`

**Decision**: Add `queueUrl?: string` to `PreschoolCard.astro`'s Props interface; pass it from `DirectoryPage.astro` via the spread-constructed preschool object.

**Rationale**: `DirectoryPage.astro` builds each preschool object via `{ ...preschool, overallScore }` where `preschool` comes from `getPreschoolIndex()`. Once `queueUrl?` is added to `PreschoolIndexEntry`, it flows automatically through the spread. `DirectoryPage.astro` then destructures `queueUrl` from the spread object and passes it explicitly as `queueUrl={preschool.queueUrl}` to `PreschoolCard`. This keeps the data flow transparent and type-safe without adding a new data loader or helper.

**Alternatives considered**:

- Passing the full `preschool` object to `PreschoolCard`: rejected — the existing contract passes individual fields to `PreschoolCard` (not the full entry object). Changing this would widen the component's implicit surface and make prop usage harder to trace.
- Fetching `queueUrl` inside `PreschoolCard` by re-reading the index: rejected — components do not call data loaders; only page-level Astro components and `DirectoryPage.astro` do.

---

### Decision 3: Queue indicator position within the card

**Decision**: Add the indicator as a new flex-row element inside the card's lower row (after the score badge legend text and before the CompareButton), or as a small inline element near the operator type label.

**Rationale**: The lower row of the card already uses `flex-wrap items-start justify-between` — the score badge and legend text are on the left, the CompareButton is on the right. The queue indicator sits between them: a small passive signal that does not compete with the score badge or the compare action. It is rendered inline, not as a separate row. For RTL (Arabic), `flex-wrap` correctly mirrors the order without additional `rtl:` adjustments needed.

**Alternatives considered**:

- Separate third row below the score/compare row: rejected — adds too much visual weight and spatial cost to a compact card. The indicator is informational, not a primary action.
- Badge overlapping the card header (top-right corner): rejected — the card already uses an absolutely-positioned `before:` pseudo-element for the full-card link hit area; adding a badge in the top-right risks z-index conflicts and readability issues on narrow screens.

---

### Decision 4: Icon choice for queue link and indicator

**Decision**: Use an inline SVG icon. For the detail-page queue link: a person+ or list-check icon communicating "join / register". For the directory card indicator: a small clock or queue icon. Both icons are `aria-hidden="true"` since the visible text label serves as the accessible label (FR-010 / clarification Q1).

**Rationale**: The project uses inline SVG icons throughout (see `DetailPage.astro` metadata section with path/map-pin SVGs). This is consistent with the zero-CDN constraint. Icons that imply queuing or registration are universally understood and supplement the text label without replacing it.

**Alternatives considered**:

- Icon font (e.g., heroicons via CDN): rejected — constitution prohibits runtime CDN resources.
- Emoji (📋, ⏳): rejected — emoji rendering varies across OS/browser and can appear low-fidelity in small sizes; inline SVG provides predictable, scalable rendering.

---

### Decision 5: i18n key placement

**Decision**: New keys are placed under the existing `"detail"` namespace for both the detail-page link label and the directory card indicator label.

**Rationale**: Both text strings conceptually describe a detail-level attribute of an independent preschool (its queue registration). Reusing the `"detail"` namespace avoids introducing a one-key namespace. The indicator text on directory cards is also the same concept — it hints that queue details are available on the detail page.

**Key names chosen**:

- `detail.queueLink` — the call-to-action text on the detail page ("Anmäl dig till kö" / "Register for queue" / Arabic)
- `detail.queueIndicator` — the short descriptor on the directory card ("Har egen kö" / "Has own queue" / Arabic)

**Alternatives considered**:

- Separate `"queue"` namespace: rejected — two keys do not warrant a new namespace; it would be over-organised.
- Reusing or concatenating `directory.operatorType.independent`: rejected — the indicator is not the operator type; it is a specific operational note about queue availability.

---

### Decision 6: Test strategy

**Decision**: Extend two existing test files rather than creating a new one.

- `tests/unit/malmo-directory-index-contract.test.ts` — add assertions inside the existing `describe` block that validate `queueUrl` presence/absence per `operatorType`. This is the natural home: the file already validates the full structural contract of `index.json`.
- `tests/e2e/preschool-detail-page-contract.spec.ts` — add two new `test()` blocks: one for an independent preschool (queue link present, correct attributes), one asserting absence on the canonical municipal preschool (`almgardens-forskola`).
- `tests/e2e/directory-data-rendering.spec.ts` — add two new `test()` blocks: queue indicator visible on an independent preschool card, absent on a municipal card.

**Rationale**: Matches the project convention of "write fewer, longer tests" and tests that describe behavior and domain. Adding to existing files avoids file sprawl.

**Alternatives considered**:

- New e2e spec `queue-links-contract.spec.ts`: rejected — behavior is tightly related to what the existing contract specs already cover; splitting would fragment coverage.

---

### Decision 7: Independent preschool test subject for e2e tests

**Decision**: Dynamically select the first rendered independent preschool from `data/malmo/index.json` filtered by `isPlaceholderSurveyFile`. Specifically, `al-salamah-sprakforskola` is the first independent preschool alphabetically and is expected to have real survey data (non-placeholder). The test will read the index at spec-file scope (same pattern as `preschool-detail-page-contract.spec.ts`) and pick the first rendered independent entry.

**Rationale**: Hard-coding a preschool ID creates fragility when data changes. The dynamic approach mirrors the existing pattern used in `preschool-detail-page-contract.spec.ts` for `renderedPreschools`.

**Alternatives considered**:

- Hard-code `al-salamah-sprakforskola`: acceptable fallback if the dynamic approach adds complexity; the test can note the assumption.

---

## No Blockers

All NEEDS CLARIFICATION items were resolved in specification. No external API integrations, no new dependencies, no architectural unknowns. Implementation can proceed to Phase 1 immediately.
