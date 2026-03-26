# Feature Specification: Translation Quality Verification

**Feature Branch**: `007-translation-quality-verification`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Translation quality verification: ensure all Phase 2 i18n keys are complete, consistent, and correctly used across Swedish, English, and Arabic locales. Verify Arabic translations render correctly with proper RTL script and interpolation placeholders."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — All Phase 2 Translation Keys Are Present and Consistent (Priority: P1)

A developer finishes implementing Phase 2 features (multi-locale routes, language switcher, RTL layout, queue links, share UI) and needs confidence that every user-facing string added during Phase 2 exists in all three locale files (Swedish, English, Arabic) with identical key structures. Missing or mismatched keys would cause the site to display raw key paths (e.g., "compare.share.button") to end users instead of translated text.

**Why this priority**: A missing translation key is a user-visible defect. If even one key is absent from a locale file, users in that language see broken text. This is the highest-priority quality gate because it catches the most common and most visible category of i18n errors.

**Independent Test**: Can be fully tested by running the key parity unit test, which loads all three locale JSON files from disk and asserts their recursive key paths are identical. Delivers value by catching missing or extra keys before they reach production.

**Acceptance Scenarios**:

1. **Given** all three locale files exist on disk, **When** the key parity test extracts every dot-path key from each file, **Then** the Swedish, English, and Arabic key sets are identical (same keys in the same nested structure).
2. **Given** a Phase 2 key (e.g., a share-related key or a queue-link key) is present in the Swedish file, **When** the key parity test runs, **Then** the same key exists in both the English and Arabic files.
3. **Given** a developer accidentally adds a key to only one locale file, **When** the key parity test runs, **Then** it fails with a clear diff showing which keys are missing from which locale.

---

### User Story 2 — Arabic Translations Use Proper Arabic Script (Priority: P1)

An Arabic-speaking parent visits the site and expects all user-facing text to appear in Arabic script. No Latin character fallbacks (e.g., English or Swedish text appearing where Arabic should be) are acceptable in user-facing strings. The site must not display raw key paths as translation output for any Arabic key.

**Why this priority**: Arabic-speaking parents are a primary audience for the multilingual expansion. Displaying Latin text in place of Arabic is confusing and signals a broken experience. This is equally critical to key parity because even if keys exist, wrong content is just as bad as missing content.

**Independent Test**: Can be tested by loading the Arabic locale file, resolving every key through the translation function, and asserting each result is a non-empty string that does not equal the raw key path (which would indicate a missing or broken translation lookup).

**Acceptance Scenarios**:

1. **Given** the Arabic locale file is loaded, **When** the translation function is called for every leaf key, **Then** every result is a non-empty string.
2. **Given** the Arabic locale file is loaded, **When** the translation function is called for every leaf key, **Then** no result equals the raw dot-path key itself (which would indicate the fallback path was triggered).
3. **Given** the Arabic locale file contains translations, **When** each value is inspected, **Then** user-facing labels (excluding interpolation placeholders, locale names, and proper nouns) contain Arabic script characters.

---

### User Story 3 — Interpolation Placeholders Are Consistent Across Locales (Priority: P2)

A developer uses template placeholders like `{count}`, `{name}`, `{question}`, `{year}`, `{score}`, and `{percent}` in translation strings. These placeholders must be identical across all three locales so the interpolation engine can substitute values correctly regardless of language. A mismatch (e.g., `{count}` in Swedish but `{nombre}` in Arabic) would cause untranslated placeholder tokens to appear in the rendered text.

**Why this priority**: Placeholder mismatches are subtle bugs that only surface at runtime when specific UI states are reached (e.g., the share warning message with a count). They are harder to catch by manual testing alone, making automated verification valuable. Ranked P2 because they affect fewer strings than total key parity but are equally user-visible when triggered.

**Independent Test**: Can be tested by extracting all `{...}` placeholder tokens from each translation value in every locale file and asserting that, for each key, the set of placeholders is identical across Swedish, English, and Arabic.

**Acceptance Scenarios**:

1. **Given** a Swedish translation value contains placeholders `{count}`, **When** the same key's value is read from the English and Arabic files, **Then** it also contains exactly `{count}` — no more, no fewer, no different names.
2. **Given** all three locale files are loaded, **When** every leaf key's placeholders are compared across locales, **Then** no key has a placeholder mismatch.
3. **Given** a key has zero placeholders in Swedish, **When** the same key is read from English and Arabic, **Then** it also has zero placeholders.

---

### User Story 4 — Built Arabic Pages Render Without Translation Fallbacks (Priority: P2)

After the site is built, the Arabic pages in the output directory contain properly rendered Arabic text. No page displays raw key paths, empty labels, or Latin-only fallback text where Arabic content is expected. This verifies that translations work end-to-end from JSON source through the build pipeline to the final HTML output.

**Why this priority**: Unit tests verify the translation files and the translation function in isolation, but a build-level check confirms the full pipeline works. Ranked P2 because the unit tests catch most issues; this is a defense-in-depth verification.

**Independent Test**: Can be tested by building the site and inspecting the Arabic output pages for the presence of Arabic text content and the absence of raw dot-path key strings.

**Acceptance Scenarios**:

1. **Given** the site is built successfully, **When** the Arabic directory page HTML is inspected, **Then** it contains Arabic text from the Arabic locale file (e.g., the directory heading).
2. **Given** the site is built successfully, **When** the Arabic output pages are scanned for known dot-path key patterns (e.g., "directory.heading", "compare.heading"), **Then** none of these raw key strings appear in the rendered HTML.

---

### Edge Cases

- What happens when a translation value is an empty string? The system should treat empty strings as present keys (key parity passes) but the rendering verification should flag them as potential issues.
- What happens when a placeholder token like `{count}` appears multiple times in a single translation value? The placeholder comparison should count occurrences or at minimum verify the token names match, not require identical counts of repeated tokens.
- What happens when a locale file contains extra keys not present in the Swedish reference? The key parity test should fail, preventing orphaned keys from accumulating.
- What happens when a proper noun (e.g., "Malmö stad", "JavaScript") correctly appears in Latin script within an Arabic translation value? The Arabic script check must allow Latin characters in values that reasonably contain proper nouns or technical terms (e.g., `attribution.text` references "Malmö stad").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST enforce that all three locale files (Swedish, English, Arabic) have identical recursive key structures — same keys, same nesting, same leaf paths.
- **FR-002**: The system MUST verify that every Phase 2 i18n key (language switcher labels, queue link text, share UI text, locale names, ARIA labels) is present in all three locale files.
- **FR-003**: The system MUST verify that the translation function returns a non-empty string (not the raw key path) for every leaf key in every locale.
- **FR-004**: The system MUST verify that interpolation placeholders (e.g., `{count}`, `{name}`) in translation values are identical across all three locales for each key.
- **FR-005**: The system MUST verify that Arabic translation values contain Arabic script characters for user-facing labels (allowing exceptions for proper nouns, locale name labels in Latin script, interpolation tokens, and technical terms).
- **FR-006**: The system MUST verify that built Arabic pages contain Arabic text content and do not display raw key paths as fallback text.

### Key Entities

- **Locale File**: A JSON file containing translation key-value pairs for a single language (Swedish, English, or Arabic). Identified by locale code. All three files must maintain structural parity.
- **Translation Key**: A dot-path string (e.g., `compare.share.button`) that uniquely identifies a user-facing string. Keys are organized into namespaces (e.g., `site`, `nav`, `directory`, `compare`, `detail`).
- **Interpolation Placeholder**: A token in the format `{tokenName}` embedded within a translation value. The interpolation engine replaces these with runtime values. Placeholder names must be identical across locales for a given key.

## Assumptions

- Swedish (sv.json) is the reference locale. All other locales are compared against it for key parity and placeholder alignment.
- The existing `i18n-locale-key-parity.test.ts` test already covers basic key structure parity. This feature extends coverage to include placeholder alignment and Arabic content quality checks.
- Locale name labels (`locale.sv`, `locale.en`, `locale.ar`) intentionally use native script across all locales (e.g., "العربية" appears identically in all three files) and are exempt from Arabic-only script checks in the Swedish and English values.
- The `t()` function's fallback behavior (returning the raw key string when a key is missing) is the mechanism that makes missing translations visible to users, which is why testing for `result !== key` is a valid proxy for "translation exists."

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three locale files pass key parity verification with zero differences — every key in Swedish exists in English and Arabic, and vice versa.
- **SC-002**: 100% of leaf keys in all three locale files resolve to a non-empty string through the translation function, with no raw key path fallbacks.
- **SC-003**: 100% of keys with interpolation placeholders have identical placeholder token sets across all three locales.
- **SC-004**: Arabic translation values for user-facing labels contain Arabic script characters (with documented exceptions for proper nouns and technical terms).
- **SC-005**: Built Arabic pages contain rendered Arabic text and zero instances of raw dot-path key strings in the HTML output.
