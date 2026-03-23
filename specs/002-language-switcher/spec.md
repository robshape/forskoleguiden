# Feature Specification: Language Switcher

**Feature Branch**: `002-language-switcher`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "Language switcher: Replace the disabled language switcher placeholder in the Nav with a functional component that lets users switch between Swedish, English, and Arabic while staying on the equivalent page. The switcher replaces the current locale segment in the URL path. Each locale link has proper ARIA attributes (aria-current, aria-label, lang). i18n keys for locale names are added to all three locale files."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — A Non-Swedish Speaker Switches Language on the Directory Page (Priority: P1)

An English-speaking parent is on the Swedish directory page because that is the site default. They see a language switcher in the navigation bar and click "English". The page reloads in English at the equivalent URL. All headings, labels, and preschool metadata are now displayed in English. The switcher visually indicates that English is now the active language.

**Why this priority**: The language switcher is the primary discovery mechanism for non-Swedish speakers. Without it, users who landed on the Swedish version have no obvious path to their preferred language. This is the core user-facing value of the entire feature.

**Independent Test**: Can be fully tested by loading the Swedish directory page, clicking the English switcher link, and confirming: (a) the URL changes to the English locale path, (b) English headings are visible, (c) the English option in the switcher appears visually active.

**Acceptance Scenarios**:

1. **Given** the user is on the Swedish directory page, **When** they look at the navigation bar, **Then** they see three language options: "Svenska", "English", and "العربية".
2. **Given** the user is on the Swedish directory page, **When** they click "English", **Then** the browser navigates to the English directory page.
3. **Given** the user is on the English directory page, **When** they inspect the language switcher, **Then** "English" is visually distinguished as the active language (e.g., highlighted, underlined, or bold) and "Svenska" and "العربية" are plain navigable links.
4. **Given** the user is on any directory page, **When** they view the language switcher, **Then** the currently active locale is not a clickable link (it represents the current page).

---

### User Story 2 — A User Switches Language While on a Specific Preschool Detail Page (Priority: P1)

A parent is reading details about a specific preschool in Swedish. They decide they want to read it in English. They click "English" in the language switcher. They land on the same preschool's detail page in English — the same preschool, same survey data, now with English labels and UI text.

**Why this priority**: Locale preservation on dynamic pages (preschool detail) is the most technically tricky aspect of the switcher and is critical for a seamless experience. A switcher that drops users back to the directory when on a detail page would be jarring and unhelpful.

**Independent Test**: Can be tested by loading a Swedish preschool detail page, clicking the English switcher link, and asserting: (a) the URL changes to the English equivalent of the same preschool path, (b) English UI labels are present, (c) the preschool name and data match the Swedish version.

**Acceptance Scenarios**:

1. **Given** the user is on the Swedish detail page for preschool "Alma Förskola", **When** they click "English" in the switcher, **Then** they are taken to the English detail page for the same preschool.
2. **Given** the user is on the English detail page, **When** they inspect the language switcher, **Then** "English" is shown as active and the Swedish and Arabic options link to the same preschool's detail page in their respective locales.
3. **Given** the user is on the Arabic comparison page, **When** they click "Svenska" in the switcher, **Then** they are taken to the Swedish comparison page (not the Swedish directory).

---

### User Story 3 — A Screen Reader User Operates the Language Switcher (Priority: P2)

A screen reader user navigates through the page. They reach the language navigation area, which is announced as a distinct navigation landmark (e.g., "Language navigation" or the localized equivalent). They hear the currently active locale announced as the current page. Each locale link includes a language hint so the screen reader pronounces "العربية" and "English" in their respective languages rather than the page's primary language.

**Why this priority**: Accessibility is a core product requirement. A language switcher that is not screen-reader-friendly excludes users with visual impairments from changing their language preference.

**Independent Test**: Can be tested by inspecting the language switcher markup: (a) the switcher is wrapped in a navigation landmark with a descriptive label, (b) the active locale has the "current page" marker, (c) each locale link has a `lang` attribute matching the target locale's language code.

**Acceptance Scenarios**:

1. **Given** the user is on the Swedish directory page, **When** a screen reader reaches the language switcher, **Then** it announces a navigation landmark with a label indicating it is the language selector.
2. **Given** the user is on the Swedish directory page, **When** a screen reader reads the Swedish option, **Then** it is announced as the current page (not as a link to navigate to).
3. **Given** the user is on the Swedish directory page, **When** a screen reader reads the Arabic option, **Then** the word "العربية" is announced using Arabic phonetics, not Swedish phonetics.
4. **Given** the automated accessibility checker runs against any page with the switcher, **Then** zero violations are reported.

---

### User Story 4 — i18n Keys for All Locale Names Are Available in All Translations (Priority: P3)

The locale name labels ("Svenska", "English", "العربية") are defined as translation keys in all three locale files. This ensures the labels are centrally managed and the i18n parity test continues to pass.

**Why this priority**: Key parity is enforced by an automated test. Adding keys in only some locale files would cause a CI failure. This is an infrastructure hygiene story that enables the switcher to reference locale names through the standard translation system.

**Independent Test**: Can be fully tested by running the i18n key parity unit test after adding the new locale name keys — the test must pass for all three locale files.

**Acceptance Scenarios**:

1. **Given** the locale name keys are added to the Swedish locale file, **When** the i18n parity test runs, **Then** it passes, confirming English and Arabic locale files also contain the same keys with the same structure.
2. **Given** each locale file has locale name keys, **When** the locale names are rendered in the switcher, **Then** each locale's name appears in its own native script: Swedish in Latin script, English in Latin script, Arabic in Arabic script.

---

### Edge Cases

- What happens when the current URL path does not contain a recognized locale segment? The switcher should fall back gracefully — linking to the target locale's root directory rather than producing a broken URL.
- What happens when a user is on the root redirect page (`/`)? The switcher should not be visible on the redirect page (it has no Nav).
- What happens if a user somehow lands on a page with an unrecognized locale in the URL? The switcher should still render with valid links for the three supported locales.
- What happens in a right-to-left layout (Arabic)? The switcher must read naturally right-to-left; the active locale indicator must still be visually clear.
- What happens when the current URL contains query parameters (e.g., `?from=compare`)? Query params are dropped on locale switch — the target URL is the clean locale-equivalent path only.
- What happens to the compare set when a user switches locale? The compare set is preserved — `sessionStorage` persists across MPA navigations by design, so preschools already selected remain selected in the new locale.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The site navigation bar MUST display exactly three language options at all times: one for each supported locale (Swedish, English, Arabic). Each option MUST include a flag icon alongside the locale label.
- **FR-002**: Each non-active language option MUST be a clickable link that navigates the user to the equivalent page in the target locale by replacing the locale segment in the current URL path. Query parameters MUST be stripped — the target URL contains only the locale-replaced path with no query string.
- **FR-003**: The currently active locale MUST be visually distinguished from the non-active options (e.g., via bold weight, underline, filled background, or border treatment).
- **FR-014**: On narrow mobile viewports (≤375 px wide), each locale option MUST display as an uppercase ISO code (`SV`, `EN`, `AR`) accompanied by its flag icon. On wider viewports, the full native locale name (`Svenska`, `English`, `العربية`) MUST be shown alongside the flag icon. Flag icons MUST be decorative only (`aria-hidden="true"`) — the visible text and the `lang` attribute on each link carry the accessible meaning.
- **FR-004**: The currently active locale MUST NOT be a navigable link (it represents the current page context).
- **FR-005**: The language switcher MUST be wrapped in a navigation landmark element with a descriptive accessible label that identifies it as the language selection control. The label MUST be translated into the current page's locale using the same i18n system used for all other accessible labels on the page (e.g., a new `nav.languageSwitcherAriaLabel` key in all three locale files).
- **FR-006**: The active locale option MUST carry an "is current page" accessibility marker so assistive technologies announce it as the current page.
- **FR-007**: Each locale link MUST carry a language attribute set to the **target** locale's language code so screen readers pronounce the locale name in the correct language.
- **FR-008**: The disabled language switcher placeholder currently in the navigation bar MUST be removed and replaced by the functional switcher.
- **FR-009**: Three locale name translation keys (`locale.sv`, `locale.en`, `locale.ar`) MUST be present in all three locale translation files with identical key structure and native-script values ("Svenska", "English", "العربية").
- **FR-010**: The automated i18n key parity test MUST continue to pass after the new keys are added.
- **FR-011**: The automated accessibility test suite (wcag2a / wcag2aa) MUST report zero violations on any page containing the language switcher.
- **FR-012**: On detail pages with preschool-specific path segments, clicking a locale link MUST navigate to the same preschool in the target locale (locale segment replaced, path tail preserved).
- **FR-013**: The language switcher MUST render correctly in both left-to-right (Swedish/English) and right-to-left (Arabic) layouts.

### Key Entities

- **Locale**: One of three supported language codes (`sv`, `en`, `ar`). Each has a canonical display name in its own script.
- **Current path**: The full URL pathname of the active page, used to compute the target locale URL by replacing the locale segment.
- **Language switcher**: The navigation element containing the three locale options, rendered in the site-wide navigation bar on every page.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user on any Swedish page can reach the equivalent English page in one click, with zero page reloads beyond the navigation itself.
- **SC-002**: A user on any Swedish page can reach the equivalent Arabic page in one click.
- **SC-003**: On preschool detail pages, clicking a locale link lands the user on the same preschool in the target locale — not on the directory page — in 100% of cases.
- **SC-004**: The automated accessibility audit (wcag2a/wcag2aa) reports zero new violations introduced by the language switcher on the Swedish, English, and Arabic directory pages.
- **SC-005**: The i18n key parity unit test passes after the locale name keys are added.
- **SC-006**: The language switcher is visible and operable on all four page types (directory, detail, comparison, about) in all three locales.
- **SC-007**: The visual treatment of the active locale is unambiguous — at least one visual property (weight, underline, color, background) differentiates it from the non-active options.

## Clarifications

### Session 2026-03-23

- Q: When a user switches locale, should query parameters in the current URL be carried over to the target locale URL? → A: Drop all query params — target URL contains only the path with locale replaced.
- Q: Should the `aria-label` on the language switcher navigation landmark be translated into the current page's locale, or fixed in one language? → A: Translate per locale using the i18n system (matches existing `Nav.astro` aria-label pattern).
- Q: When a user switches locale, should the compare set (preschools selected for comparison) be preserved or cleared? → A: Preserve — `sessionStorage` compare set survives locale switch unchanged.
- Q: On narrow mobile viewports, how should the three locale names be displayed in the switcher? → A: Abbreviate to uppercase ISO codes (`SV`, `EN`, `AR`) on narrow viewports with a flag icon per locale; show full native names on wider viewports.

## Assumptions

- The multi-locale page routes (Step 0) are already built and deployed — `/sv/`, `/en/`, and `/ar/` pages all exist at build time. The language switcher links presuppose these routes exist.
- Locale name labels are intentionally **not** translated into the current page language. "English" appears as "English" on the Arabic page, not "الإنجليزية". This is a deliberate accessibility choice so users can always recognize their own language regardless of what locale is currently active.
- The switcher does not attempt to remember or persist a user's language preference across sessions (e.g., no cookie or local storage). Navigation is handled purely through URL structure.
- All four page types (directory, detail, comparison, about) include the site navigation bar and will therefore all include the language switcher automatically.
- The base path prefix (e.g., `/forskoleguiden/` for GitHub Pages) is already handled by the existing path-building utility used throughout the site — the switcher relies on the same utility and does not need special-case logic for the base path.
- The compare set (`sessionStorage`-backed `compareIds` store) is not affected by locale switching. It persists across page navigations within a session by design, and preschool IDs are locale-agnostic.
- Flag icons are decorative — they supplement the text label and must be hidden from assistive technologies. The choice of flag for the Arabic locale (Arabic is spoken across many countries) is a design decision to be resolved at implementation time; a commonly understood regional flag or a generic globe symbol is acceptable. The spec does not mandate a specific flag.
