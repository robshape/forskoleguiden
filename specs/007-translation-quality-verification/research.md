# Research: Translation Quality Verification

**Feature**: 007-translation-quality-verification
**Date**: 2026-03-26

## R1: Placeholder Extraction Strategy

**Decision**: Extract placeholder tokens using the regex `/\{([a-zA-Z0-9_]+)\}/g` (same pattern used by the production `interpolateTemplate` function in `src/i18n/utils.ts`), collect unique token names as a sorted set, and compare sets across locales per key.

**Rationale**: Using the identical regex the production code uses ensures the test verifies exactly the tokens the interpolation engine will attempt to substitute. Comparing sorted sets (not counts) catches renamed or extra/missing tokens without false positives from intentional duplicate usage of the same token within a single string.

**Alternatives considered**:
- Count-based comparison (require identical occurrence counts of each token): Rejected — a translator may naturally repeat a placeholder (e.g., `{name}` twice in Arabic for grammatical reasons) without causing a bug, since the interpolation engine replaces all occurrences.
- Manual allowlist of keys with placeholders: Rejected — brittle and requires updating whenever a new templated string is added. Automated extraction is self-maintaining.

## R2: Arabic Script Detection Approach

**Decision**: Use Unicode range detection for Arabic script characters (`\u0600-\u06FF`, `\u0750-\u077F`, `\u08A0-\u08FF`, `\uFB50-\uFDFF`, `\uFE70-\uFEFF`) to verify Arabic content. Assert that each Arabic translation value (excluding documented exceptions) contains at least one Arabic script character.

**Rationale**: A regex-based Unicode range check is simple, fast, deterministic, and runs in Node without dependencies. It catches the most common failure mode (Latin-only text where Arabic is expected) without requiring linguistic analysis.

**Alternatives considered**:
- Full Unicode `\p{Script=Arabic}` property escapes: Would work with the `u` flag but the explicit ranges are equally clear and avoid any Unicode property support concerns in older Node versions.
- Character ratio threshold (e.g., >50% Arabic characters): Over-engineered — the goal is to detect values that contain zero Arabic characters, not to assess translation quality at a linguistic level. A simple "contains at least one" check is sufficient given that proper nouns and placeholders are already documented exceptions.

## R3: Exception Handling for Latin Content in Arabic Values

**Decision**: Define an explicit allowlist of dot-path keys whose Arabic values are permitted to contain zero Arabic script characters. Initial allowlist: `locale.sv`, `locale.en` (these are native-script labels in Latin — "Svenska", "English"). All other keys must contain at least one Arabic character.

**Rationale**: The locale name labels are the only keys that intentionally contain pure Latin text in the Arabic file. Rather than applying heuristic "proper noun detection," an explicit allowlist is predictable and easy to maintain. Keys like `attribution.text` do contain Latin proper nouns ("Malmö stad") but also contain surrounding Arabic text, so they pass the "at least one Arabic character" check naturally.

**Alternatives considered**:
- Heuristic proper-noun detection: Rejected — unreliable, over-complex, and unnecessary when the known exceptions are just 2 keys.
- Skip Arabic content checking entirely and rely on key parity alone: Rejected — key parity only proves the key exists, not that the value is in the correct script. A developer could accidentally paste Swedish text into `ar.json`.

## R4: Post-Build Arabic Page Verification Strategy

**Decision**: Extend the existing `static-output-verification.test.ts` with two new assertions: (1) the Arabic directory page `dist/ar/index.html` contains at least one Arabic character in its text content, and (2) a set of known dot-path key patterns (e.g., `directory.heading`, `compare.heading`, `site.title`) do not appear as literal strings in the Arabic page HTML.

**Rationale**: This is a defense-in-depth check after unit tests. Checking for Arabic character presence confirms the build pipeline rendered translations. Checking for raw key strings confirms the `t()` fallback was not triggered. Both are simple string/regex operations on the built HTML file, requiring no browser or DOM.

**Alternatives considered**:
- Full HTML parsing with a DOM library (e.g., `cheerio`): Over-engineered for this purpose — raw string search on the HTML is sufficient and adds no dependency.
- Checking every Arabic page (detail, comparison, about): Checking the directory page is the highest-value single page to verify (it uses the most diverse set of keys). Adding more pages is possible but lower priority and can be added later if needed.

## R5: Test File Organization

**Decision**: Create two new unit test files and extend one existing post-build test:
1. `tests/unit/i18n-placeholder-parity.test.ts` — cross-locale placeholder token comparison (FR-004, User Story 3)
2. `tests/unit/i18n-arabic-translation-quality.test.ts` — Arabic script verification and non-empty resolution (FR-003, FR-005, User Story 2)
3. Extend `tests/post-build/static-output-verification.test.ts` — Arabic build output assertions (FR-006, User Story 4)

**Rationale**: Follows the project convention of one test file per behavioral concern with BDD-style names. Placeholder parity is a cross-locale concern (not Arabic-specific), so it gets its own file. Arabic quality is a locale-specific concern. The post-build test is extended rather than creating a new file because it already verifies locale output structure. FR-001/FR-002 are already covered by the existing `i18n-locale-key-parity.test.ts` — no changes needed there.

**Alternatives considered**:
- Single monolith test file for all new checks: Rejected — violates project convention of domain-scoped test files and makes it harder to identify which concern failed.
- Separate post-build test file for Arabic content: Rejected — the existing `static-output-verification.test.ts` already iterates over locales and checks page existence; Arabic content assertions are a natural extension of that file.
