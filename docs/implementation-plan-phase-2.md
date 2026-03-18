# Implementation Plan: Förskoleguiden Phase 2

> Scope: Phase 2 from the PRD — multilingual page routes (Swedish/English/Arabic), functional language switcher, RTL layout for Arabic, shareable URL with versioned payload, email shortlist via `mailto:`, and independent preschool queue links. Builds on the fully complete Phase 1 foundation (Steps 0–13).

## Prerequisites

Phase 1 is complete. The following infrastructure already exists and is assumed working:

- Static Astro site with Swedish-only pages at `/sv/`, `/sv/forskola/[id]/`, `/sv/jamfor/`, `/sv/om/`
- Preact islands: `SortToggle`, `CompareButton`, `CompareTray`, `ComparisonView`, `DetailsBarChart`
- nanostores `compareIds` with `sessionStorage` persistence and `MAX_COMPARE = 5`
- i18n files for all three locales (`sv.json`, `en.json`, `ar.json`) with identical key structures and complete translations
- `t(key, locale, params?)` helper with interpolation support
- `BaseLayout.astro` with `lang` and `dir="rtl"` support
- `Nav.astro` with a disabled language switcher placeholder
- CI/CD pipeline via `quality-gates.yml` → `deploy.yml`
- `lz-string` is NOT installed (listed in Phase 1 plan but unused; must be installed in this phase)

## Design Decision: Unified Compare/Shortlist

The PRD describes the "compare set" and "pick-five shortlist" as potentially separate features. In this implementation, they are **unified**: the `compareIds` store serves as both the comparison selection and the municipality shortlist, capped at `MAX_COMPARE = 5`. This matches the real-world Malmö application process (select up to 5 preschools) and avoids UI complexity from managing two separate lists. The share URL encodes this single unified list. If user testing reveals a need for separate lists, that can be added as a follow-up — but the base product ships with one list.

---

## Step 0: Multi-Locale Page Routes

> **Goal:** Generate English and Arabic versions of all existing Swedish pages so every route has a `/{locale}/` equivalent. This is the foundation for the language switcher and RTL work that follows.

### 0.1 — Create a locale-aware page generation strategy

Decide on the page duplication approach. The recommended strategy for this project size (4 routes) is **explicit page files per locale** — create `src/pages/en/` and `src/pages/ar/` directories mirroring the `src/pages/sv/` structure. Each locale page file sets `const locale = 'en'` (or `'ar'`) and reuses the same Astro components and data loaders. This avoids complex dynamic routing and keeps each page independently buildable.

Do NOT use Astro's `i18n` config option — the project's manual file-based routing is simpler for this scope and already works in Phase 1.

**Test:** Verify no Astro config changes are needed. Run `pnpm build` — it should succeed with the existing Phase 1 output unchanged.

### 0.2 — Create English page routes

Create `src/pages/en/` with the following files, each setting `const locale = 'en'`:

- `src/pages/en/index.astro` — English directory page. Uses the same `getPreschoolIndex()` and `computeOverallScore()` data loading as the Swedish version. All user-facing strings use `t(key, 'en')`.
- `src/pages/en/forskola/[id].astro` — English preschool detail page. Same `getStaticPaths()` pattern as the Swedish version, with `locale = 'en'`.
- `src/pages/en/jamfor/index.astro` — English comparison page. Same Preact island pattern as the Swedish version, with `locale = 'en'` passed to `ComparisonView`.
- `src/pages/en/om/index.astro` — English about page. Same layout pattern as the Swedish version.

Each file should follow the same front-matter pattern as its Swedish counterpart — only the `locale` constant changes. All data loading, scoring, and component usage remain identical.

**Test:** Run `pnpm build`. Assert:

- `dist/en/index.html` exists and contains `<html lang="en">` and does NOT contain `dir="rtl"`.
- `dist/en/forskola/{any-id}/index.html` exists for at least one preschool.
- `dist/en/jamfor/index.html` exists.
- `dist/en/om/index.html` exists.
- The English directory page heading uses the English translation (e.g., "Preschools" not "Förskolor").

### 0.3 — Create Arabic page routes

Create `src/pages/ar/` mirroring the same structure as Step 0.2, with `const locale = 'ar'`.

**Test:** Run `pnpm build`. Assert:

- `dist/ar/index.html` exists and contains `<html lang="ar">` AND `dir="rtl"`.
- `dist/ar/forskola/{any-id}/index.html` exists for at least one preschool.
- `dist/ar/jamfor/index.html` exists.
- `dist/ar/om/index.html` exists.
- The Arabic directory page contains Arabic text from `ar.json`.

### 0.4 — Add locale-aware internal links

Review all Astro components and Preact islands that generate internal links (Nav site title link, PreschoolCard detail link, CompareTray comparison link, ComparisonView back link, Footer about link, detail page back link). Ensure every link uses `${base}/${locale}/...` so navigation stays within the current locale.

Specifically verify:

- `Nav.astro` site title links to `/${locale}/` (not hardcoded `/sv/`).
- `PreschoolCard.astro` links to `/${locale}/forskola/{id}/`.
- `CompareTray.tsx` links to `/${locale}/jamfor/`.
- `ComparisonView.tsx` back link goes to `/${locale}/`.
- Detail page back link goes to `/${locale}/`.

**Test:** Run `pnpm build`. Inspect `dist/en/index.html` — all internal links should use `/en/` prefix. Inspect `dist/ar/index.html` — all internal links should use `/ar/` prefix. No link should hardcode `/sv/`. Write an e2e test that loads `/en/`, clicks a preschool card link, and asserts the URL path starts with the base path followed by `/en/forskola/`.

### 0.5 — Update the root redirect

The current root redirect sends `/` to `/sv/`. Keep this behavior (Swedish is the default on first visit per PRD §5.1). No changes needed unless the redirect is broken by the new routes.

**Test:** Run `pnpm build`. Open `dist/index.html`. Assert it redirects to the Swedish locale path (`/sv/` or `${base}/sv/`).

### 0.6 — Update static output verification

Update the post-build static output verification test to assert that all three locale directories exist in `dist/` with the expected page count per locale.

**Test:** Run `pnpm test:post-build`. The updated test passes, verifying `dist/sv/`, `dist/en/`, and `dist/ar/` all contain the expected HTML files.

---

## Step 1: Language Switcher

> **Goal:** Replace the disabled language switcher placeholder in the Nav with a functional component that lets users switch between Swedish, English, and Arabic while staying on the equivalent page.

### 1.1 — Implement the language switcher in Nav

Replace the disabled placeholder in `Nav.astro` with a functional language switcher. The switcher should:

- Display all three locale options: "Svenska", "English", "العربية".
- Highlight the currently active locale with a visual indicator (e.g., bold text, underline, or a filled/active style).
- Each non-active locale is a plain `<a>` link pointing to the equivalent page in the target locale.
- The equivalent page URL is computed by replacing the locale segment in the current path. For example, if the user is on `/sv/forskola/alma-forskola/`, clicking "English" navigates to `/en/forskola/alma-forskola/`.

The switcher should accept `locale: Locale` and `currentPath: string` as props. `currentPath` is `Astro.url.pathname` passed from the page.

**Test:** Run `pnpm build`. Inspect `dist/sv/index.html` — the nav should contain links to `/en/` and `/ar/` (or the base path equivalent). The "Svenska" option should appear with an active/selected visual treatment. Inspect `dist/en/index.html` — "English" should appear active, with links to `/sv/` and `/ar/`. Write an e2e test that loads `/sv/`, clicks the English switcher link, and asserts the browser navigated to `/en/`.

### 1.2 — Preserve locale context in the language switcher on detail pages

Verify the language switcher produces correct cross-locale links on dynamic pages. On `/sv/forskola/alma-forskola/`, the English link should point to `/en/forskola/alma-forskola/`, not `/en/`.

**Test:** Write an e2e test that loads a Swedish preschool detail page, clicks the English switcher link, and asserts: (a) the URL is the English equivalent of the same preschool, (b) the page renders with English text, (c) the preschool data is the same (same name, same scores).

### 1.3 — Add i18n keys for locale names

Add i18n keys for the full locale names used in the language switcher (e.g., `locale.sv`, `locale.en`, `locale.ar`) to all three locale files. These should be the locale's own name in its own script ("Svenska", "English", "العربية") — not translated into the current locale, so they remain recognizable to native speakers regardless of which locale is active.

**Test:** Run the existing i18n key parity unit test. It should pass, confirming all three locale files have the new keys with identical structure.

### 1.4 — Accessibility for the language switcher

The language switcher should be wrapped in a `<nav>` element with `aria-label` describing its purpose (e.g., `aria-label="Language"` or the localized equivalent). The current locale link should have `aria-current="page"`. Each link should include a `lang` attribute matching its target locale (e.g., `<a href="/en/" lang="en">English</a>`) so screen readers pronounce the locale name correctly.

**Test:** Run `@axe-core/playwright` on the Swedish directory page. Assert zero accessibility violations. Manually inspect the switcher markup for `aria-label`, `aria-current`, and `lang` attributes.

---

## Step 2: RTL Layout for Arabic

> **Goal:** Ensure the Arabic locale pages render correctly in right-to-left layout. `BaseLayout.astro` already sets `dir="rtl"` for Arabic; this step focuses on component-level RTL adjustments using Tailwind v4's `rtl:` variant.

### 2.1 — Audit and fix shell components for RTL

Review `Nav.astro`, `Footer.astro`, and `BaseLayout.astro` for any directional CSS that needs RTL variants. Common issues:

- Replace `ml-*` with `ms-*` and `mr-*` with `me-*` (logical margin properties) or add `rtl:` overrides.
- Replace `pl-*` / `pr-*` with `ps-*` / `pe-*` (logical padding) or add `rtl:` overrides.
- Replace `left-*` / `right-*` with `start-*` / `end-*` or add `rtl:` overrides.
- Ensure `text-left` becomes `text-start` and `text-right` becomes `text-end`.
- Check that flexbox layouts using `flex-row` do not need reversal (CSS flexbox respects `dir="rtl"` automatically, so `flex-row` already reverses in RTL — verify this is the desired behavior for each layout).

**Test:** Run `pnpm build`. Open `dist/ar/index.html` in a browser. Visually verify: nav items flow right-to-left, footer attribution text is right-aligned, and spacing/padding mirrors the Swedish LTR layout correctly.

### 2.2 — RTL adjustments for directory page components

Review `PreschoolCard.astro`, `SortToggle.tsx`, and `CompareButton.tsx` for directional CSS. Apply RTL variants:

- Score badge position (if absolutely positioned on one side of the card).
- Sort toggle tab order (visual order should reverse).
- Compare button icon/checkmark position.
- Card internal layout (text alignment, flex direction).

**Test:** Write an e2e test that loads `/ar/` and captures a screenshot or asserts: (a) preschool cards render with right-aligned text, (b) the sort toggle is visible and operable, (c) compare buttons are visible and clickable. Click a compare button and verify it toggles to the selected state.

### 2.3 — RTL adjustments for detail pages

Review `QuestionCard.astro` and the detail page layout for directional issues:

- Bar chart labels and legend alignment.
- Back navigation arrow direction (should point right in RTL).
- Metadata layout (address, operator type).
- Response percentage list alignment.

**Test:** Run `pnpm build`. Open an Arabic detail page in a browser. Verify: back arrow points right (→ in LTR becomes ← in RTL, which CSS flips automatically if using logical properties or `rtl:` variants), question cards have right-aligned text, and bar chart legends are readable.

### 2.4 — RTL adjustments for comparison page

Review `ComparisonView.tsx` and `CompareTray.tsx` for directional CSS:

- Comparison table scroll direction (horizontal scroll should start from the right edge).
- Score cards internal layout.
- Summary text alignment.
- Compare tray button positions (CTA on the left in RTL, clear on the right).

**Test:** Write an e2e test that loads `/ar/`, adds 2 preschools to compare, navigates to `/ar/jamfor/`, and asserts: (a) the comparison view renders with RTL layout, (b) the compare tray is visible with Arabic text, (c) summary text (if 2+ preschools) is right-aligned.

### 2.5 — Verify RTL does not break LTR locales

Confirm that all RTL-specific CSS changes are properly scoped with `rtl:` variants or logical properties and do NOT affect Swedish or English pages.

**Test:** Run the full existing e2e test suite (Chromium). All Phase 1 tests pass without regression. Specifically run `user-flow-phase1.spec.ts` — it must still pass on `/sv/`.

---

## Step 3: Data Model Extension (Queue Links)

> **Goal:** Add optional queue/homepage URL support to the data model for independent preschools, enabling Phase 2 queue link display.

### 3.1 — Extend PreschoolIndexEntry with an optional queueUrl field

In `src/lib/types.ts`, add an optional `queueUrl` field to the `PreschoolIndexEntry` type:

- `queueUrl?: string` — the URL to the independent preschool's queue registration page or homepage. Only present for independent preschools. Municipal preschools use the city's central queue (kö.malmo.se) and should NOT have this field.

Do not change the `PreschoolSurvey` type — queue URLs are an index-level concern (organizational metadata), not survey data.

**Test:** Write or update a unit test that creates a `PreschoolIndexEntry` with and without `queueUrl`. The type should compile in both cases (the field is optional). Assert that the existing data contract test in `tests/unit/malmo-directory-index-contract.test.ts` still passes (the field is optional, so existing data without it remains valid).

### 3.2 — Add queue URLs to the Malmö index data

For each independent preschool in `data/malmo/index.json`, add a `queueUrl` field with a realistic placeholder URL (e.g., `"https://example.com/ko"` for now). For municipal preschools, omit the field entirely.

Use placeholder URLs consistently (e.g., `"https://example.com/queue/{id}"`). These will be replaced with real URLs when the data is available. Include a note in `data/README.md` explaining that queue URLs are placeholders.

**Test:** Write or update the Malmö directory index contract test to assert: (a) every `independent` preschool has a `queueUrl` string that is a valid URL, (b) no `municipal` preschool has a `queueUrl` field, (c) the overall index structure remains valid.

### 3.3 — Update the data loader

Update `getPreschoolIndex()` in `src/lib/data.ts` to include the `queueUrl` field in its return type. No logic changes needed — the JSON is read as-is and the new optional field will be included automatically.

**Test:** Write a unit test that calls `getPreschoolIndex()`, finds an independent preschool, and asserts it has a `queueUrl` string. Find a municipal preschool and assert it does NOT have a `queueUrl`.

---

## Step 4: Independent Preschool Queue Links UI

> **Goal:** For independent preschools, display a clear link to the preschool's queue registration page. This helps parents who need to register directly with independent preschools outside the municipality's central queue system.

### 4.1 — Add queue link to preschool detail pages

On the detail page for independent preschools (`src/pages/{locale}/forskola/[id].astro`), display a prominent link to the queue URL if present:

- Show the link in the metadata/action area of the detail page.
- Use clear, localized text (e.g., Swedish: "Anmäl dig till kö", English: "Register for queue", Arabic equivalent).
- The link opens in a new tab (`target="_blank"`) with `rel="noopener noreferrer"`.
- For municipal preschools (no `queueUrl`), show nothing — or optionally show a note that municipal preschools use Malmö stad's central queue with a link to the city's queue page.
- The link should be visually distinct (e.g., a button or a prominently styled link) so parents don't miss it.

Add the necessary i18n keys for the queue link text to all three locale files.

**Test:** Run `pnpm build`. Find an independent preschool's detail page in each locale — assert it contains a link with `target="_blank"` and `rel="noopener noreferrer"` pointing to the queue URL. Find a municipal preschool's detail page — assert no queue link appears (or the city queue fallback appears). Run `pnpm test` — i18n key parity test passes with the new keys.

### 4.2 — Add queue link indicator to directory cards

On the directory page, for each independent preschool card, add a small visual indicator (e.g., an icon or a "Kö" badge) that signals this preschool has its own queue. This indicator does NOT need to be a link itself (the detail page has the full link) — it should just hint that the preschool has queue information available.

**Test:** Run `pnpm build`. Inspect the Swedish directory page HTML. Assert that independent preschool cards contain the queue indicator element. Assert that municipal preschool cards do NOT contain the queue indicator.

---

## Step 5: Share State Encoding

> **Goal:** Create the infrastructure for encoding and decoding the compare set (shortlist) into a URL-safe string, enabling shareable links. The PRD requires a versioned, resilient payload format that stays under ~2,000 characters.

### 5.1 — Install lz-string

Install `lz-string` as a production dependency (it was listed in the Phase 1 plan but never installed):

```sh
pnpm add lz-string
```

Pin to an exact version (no `^` or `~`).

Also install its type declarations if not bundled:

```sh
pnpm add -D @types/lz-string
```

**Test:** Run `pnpm ls lz-string`. The package appears at the installed version. Import `lz-string` in a test file — TypeScript compiles without errors.

### 5.2 — Define the share payload schema

Create `src/lib/share.ts` with a versioned payload schema:

- Define a `SharePayload` type with fields: `v: number` (schema version, starting at `1`), `city: string`, `year: number`, `ids: string[]` (the selected preschool IDs).
- The `ids` array represents the unified compare/shortlist. Its maximum length is `MAX_COMPARE` (5).
- Version `1` is the initial schema. Future versions can add fields without breaking existing links.

The schema intentionally does NOT include locale — locale is part of the URL path (`/sv/jamfor/`, `/en/jamfor/`), not the payload. This keeps the payload small and avoids encoding UI preferences into shareable state.

**Test:** Write a unit test that creates a `SharePayload` object with `v: 1`, `city: 'Malmö'`, `year: 2025`, and `ids: ['abc', 'def']`. Assert it conforms to the type. Assert that `ids.length <= MAX_COMPARE`.

### 5.3 — Create the share state encoder

In `src/lib/share.ts`, create an `encodeShareState(ids: string[]): string` function:

1. Construct a `SharePayload` from the given IDs (using the current city/year constants).
2. Serialize to JSON.
3. Compress with `lz-string`'s `compressToEncodedURIComponent()` (URL-safe, no special characters).
4. Return the compressed string.

The encoded string will be used as a URL query parameter (e.g., `?s=<encoded>`).

**Test:** Write unit tests:

- Encode 5 preschool IDs. Assert the result is a non-empty string containing only URL-safe characters (`[A-Za-z0-9_-]` plus any lz-string URI characters).
- Encode an empty array. Assert the result is still a valid encoded string (edge case: sharing an empty list should work without errors).
- Encode 5 IDs and assert the total URL (base URL + `?s=` + encoded string) is under 2,000 characters.

### 5.4 — Create the share state decoder

In `src/lib/share.ts`, create a `decodeShareState(encoded: string): SharePayload | null` function:

1. Decompress the string with `lz-string`'s `decompressFromEncodedURIComponent()`.
2. Parse the JSON.
3. Validate the payload: check `v` is a supported version, `ids` is an array of strings, `city` is a string, `year` is a number.
4. If validation fails (corrupted link, unsupported version, invalid JSON), return `null` — do NOT throw.

**Test:** Write unit tests:

- Round-trip: encode 3 IDs, decode, assert the decoded IDs match the originals.
- Decode with a corrupted string: returns `null`.
- Decode with an empty string: returns `null`.
- Decode with a future version number (e.g., `v: 99`): returns `null` (unsupported version; graceful degradation).

### 5.5 — Validate decoded IDs against the index

Create a `validateShareIds(payload: SharePayload): { valid: string[], invalid: string[] }` function:

1. Load the preschool index for the payload's city/year.
2. Check each ID in `payload.ids` against the index.
3. Return a list of valid IDs (found in the index) and invalid IDs (not found — preschool may have been removed or renamed).

This separation lets the UI explain what could not be restored (PRD §5.3: "show graceful fallback and explain what changed").

**Test:** Write unit tests:

- Given 3 IDs where 2 exist in the index and 1 does not: `valid` has 2 entries, `invalid` has 1.
- Given all valid IDs: `invalid` is empty.
- Given all invalid IDs: `valid` is empty.

---

## Step 6: Share UI

> **Goal:** Add a "Share" button to the comparison page that generates a shareable URL and copies it to the clipboard. Handle incoming shared links by restoring the compare set.

### 6.1 — Add share button to the comparison page

In `ComparisonView.tsx`, when 1+ preschools are selected, render a "Share" button (or "Dela" in Swedish, localized for all locales). Position it near the comparison heading or in the action area.

When clicked, the button should:

1. Call `encodeShareState()` with the current `compareIds`.
2. Construct the full share URL: `{origin}{base}/{locale}/jamfor/?s={encoded}`.
3. Copy the URL to the clipboard using the Clipboard API (`navigator.clipboard.writeText()`).
4. Show a brief confirmation message (e.g., "Länk kopierad!" / "Link copied!" / Arabic equivalent) that auto-dismisses after 2–3 seconds.

If the Clipboard API is unavailable (older browsers), fall back to selecting text in a hidden input (or show the URL in a read-only text field for manual copying).

Add the necessary i18n keys for the share button label and confirmation message to all three locale files.

**Test:** Write an e2e test: load `/sv/`, add 2 preschools, navigate to `/sv/jamfor/`, click the Share button. Assert: (a) the confirmation message appears, (b) the clipboard contains a URL matching the pattern `*/sv/jamfor/?s=*`. If clipboard access is restricted in the test environment, at minimum assert the share button exists and is clickable without errors.

### 6.2 — Restore compare set from shared URL

When the comparison page loads and the URL contains a `?s=` query parameter:

1. Decode the parameter with `decodeShareState()`.
2. Validate the IDs with `validateShareIds()`.
3. If valid IDs exist, populate the `compareIds` store with the valid IDs (replacing any existing selections).
4. If some IDs are invalid, show a message listing the preschools that could not be found (e.g., "1 förskola kunde inte hittas" / "1 preschool could not be found").
5. If decoding fails entirely, show an error message and render the empty comparison state with a link back to the directory.

The restoration should happen on the client side (inside `ComparisonView.tsx`) since the compare state is managed by the Preact island.

Add the necessary i18n keys for the restoration messages (success with warnings, and error) to all three locale files.

**Test:** Write e2e tests:

- Encode 2 valid preschool IDs into a share URL. Navigate to that URL. Assert the comparison page shows both preschools.
- Encode 3 IDs where 1 is invalid. Navigate to the URL. Assert the comparison page shows 2 preschools and displays a warning message mentioning the invalid preschool.
- Navigate to `/sv/jamfor/?s=INVALID_GARBAGE`. Assert the comparison page shows the error state with a link back to the directory.

### 6.3 — Share button on detail pages (optional but recommended)

On each preschool detail page, add a small "Share" button that generates a share URL with just that one preschool pre-selected. This lets parents share a specific preschool link that opens the comparison page with that school.

**Test:** Run `pnpm build`. Inspect a detail page HTML — assert a share button or share action element exists. Write an e2e test: load a detail page, click the share button, assert the generated URL contains the preschool's ID in the encoded payload.

---

## Step 7: Email Shortlist

> **Goal:** Let users email their shortlist (compare set) to themselves or a partner using a `mailto:` link. No server-side email — everything is handled by the user's email client.

### 7.1 — Create the mailto URL generator

Create `src/lib/email.ts` with an `buildMailtoUrl(ids: string[], locale: Locale): string` function:

1. Look up the preschool names and addresses from the index for each ID.
2. Construct a `mailto:` URL with:
   - Empty `to` field (the user fills in the recipient).
   - `subject`: localized (e.g., "Min förskolelista — Förskoleguiden" / "My Preschool Shortlist — Preschool Guide").
   - `body`: a formatted list of selected preschools (name + address, one per line), followed by a share link URL that restores the selection.
3. Properly encode the subject, body, and share link for the `mailto:` URI scheme (use `encodeURIComponent` for each field).

The total `mailto:` URL should remain functional — most email clients support up to ~2,000 characters in the URL. If 5 preschools with long names/addresses approach this limit, truncate the body and keep the share link.

**Test:** Write unit tests:

- Given 2 preschool IDs, assert the generated `mailto:` URL starts with `mailto:?subject=` and contains the two preschool names in the body.
- Assert the body contains a share link (starts with `http` or the site URL).
- Assert the subject matches the expected localized string for each locale.
- Assert all special characters are properly encoded (no raw `&`, `=`, `#`, or newlines in the URL — only `%0A` for line breaks).

### 7.2 — Add email button to the comparison page

In `ComparisonView.tsx`, next to the Share button, add an "Email" button (or "Skicka via e-post" / "Send via email" / Arabic equivalent). When clicked, it should:

1. Call `buildMailtoUrl()` with the current `compareIds` and `locale`.
2. Open the generated URL (either via `window.location.href = mailtoUrl` or `window.open(mailtoUrl)`).

The button should be an `<a>` element with `href` set to the `mailto:` URL for progressive enhancement (works without JS if the href is pre-computed). However, since the compare set is dynamic (client-side state), the href must be computed at render time.

Add the necessary i18n keys for the email button label to all three locale files.

**Test:** Write an e2e test: load `/sv/`, add 2 preschools, navigate to `/sv/jamfor/`, assert the email button exists and its `href` starts with `mailto:?`. Assert the href contains the expected preschool names (URL-encoded).

---

## Step 8: Translation Quality Verification

> **Goal:** Verify that all i18n keys added in Phase 2 are complete, consistent, and correctly used across all three locales.

### 8.1 — Add all Phase 2 i18n keys

Review all new user-facing strings added in Steps 0–7 and ensure they are present in all three locale files. New keys include (at minimum):

- Language switcher: `locale.sv`, `locale.en`, `locale.ar`
- Queue link: `detail.queueLink`, `detail.municipalQueueNote` (or similar)
- Share: `share.button`, `share.copied`, `share.restored`, `share.restoredWithWarning`, `share.error`
- Email: `email.button`, `email.subject`, `email.bodyIntro`

The exact key names should follow the existing flat dot-path convention used in Phase 1.

**Test:** Run the existing i18n key parity unit test (`tests/unit/i18n-locale-key-parity.test.ts`). It must pass, confirming all three locale files have identical key structures.

### 8.2 — Verify Arabic translations render correctly

Arabic translations should be reviewed for:

- Correct text direction (reads right-to-left).
- Proper use of Arabic script (no Latin character fallbacks in user-facing text).
- Interpolation placeholders (`{count}`, `{name}`, etc.) work correctly in Arabic text.

**Test:** Write a unit test that calls `t(key, 'ar')` for every key in `ar.json` and asserts: (a) the result is a non-empty string, (b) the result does NOT equal the key itself (would indicate a missing translation), (c) any interpolation placeholders in the Arabic text match the placeholders in the Swedish text. Run `pnpm build` — the Arabic pages should render without missing translation fallbacks.

---

## Step 9: Accessibility Audit (Phase 2)

> **Goal:** Verify all Phase 2 features pass accessibility standards. Focus on RTL layout, new interactive elements, and multi-locale consistency.

### 9.1 — Run axe-core on English and Arabic pages

Extend the existing `tests/e2e/accessibility-axe-core.spec.ts` suite to also scan:

- `/en/` (English directory page)
- `/en/forskola/{any-id}/` (English detail page)
- `/en/jamfor/` (English comparison page with 2+ preschools seeded)
- `/ar/` (Arabic directory page)
- `/ar/forskola/{any-id}/` (Arabic detail page)
- `/ar/jamfor/` (Arabic comparison page with 2+ preschools seeded)

All scans should pass at `wcag2a` and `wcag2aa` levels with zero violations.

**Test:** Run `pnpm test:e2e`. All new accessibility test cases pass.

### 9.2 — Keyboard navigation for Phase 2 features

Write e2e tests verifying:

- The language switcher links are reachable via Tab and activatable via Enter.
- The Share button on the comparison page is reachable via Tab and activatable via Enter/Space.
- The Email button on the comparison page is reachable via Tab and activatable via Enter.
- Queue links on detail pages are reachable via Tab.
- Focus management after clicking Share (the confirmation message should not steal focus or trap it).

**Test:** E2e tests that use `page.keyboard.press('Tab')` to navigate and assert focus lands on the expected elements. All assertions pass.

### 9.3 — Screen reader labeling for new elements

Verify:

- The Share button has an accessible label (e.g., `aria-label` or visible text).
- The Email button has an accessible label.
- The share confirmation message uses `role="status"` or `aria-live="polite"` so screen readers announce it.
- Queue links have descriptive text (not just "Click here").
- The language switcher navigation has `aria-label`.

**Test:** Run `@axe-core/playwright` on the comparison page with share/email buttons visible. Assert zero violations. Manually inspect DOM attributes for `aria-live` on the share confirmation, `aria-label` on the language nav.

---

## Step 10: CI Pipeline Updates

> **Goal:** Extend the CI pipeline to cover new Phase 2 pages and features.

### 10.1 — Update quality-gates workflow for multi-locale e2e

The existing `quality-gates.yml` runs Playwright e2e tests. Verify that the new e2e tests added in Phase 2 (Steps 0.4, 1.1, 1.2, 2.2, 2.4, 6.1, 6.2, 7.2, 9.1, 9.2) are picked up automatically by the existing test configuration (they should be, since Playwright config targets `tests/e2e/`).

**Test:** Push a commit (or run locally) and verify all Phase 2 e2e tests execute and pass in the CI pipeline. Run `pnpm validate` — all checks pass.

### 10.2 — Update page weight budget for multi-locale output

The Phase 1 post-build test enforces a 100 KB uncompressed budget for `/sv/`. Consider whether the same budget should apply to `/en/` and `/ar/` pages. If the budget should be consistent across locales, update the test to check all three.

**Test:** Run `pnpm test:post-build`. The updated page weight test passes for all locale index pages.

### 10.3 — Update Lighthouse audit for multi-locale

The Phase 1 Lighthouse audit targets the Swedish directory page. Extend `.lighthouserc.json` to also audit `/en/` and `/ar/` index pages.

**Test:** Run `pnpm audit:lighthouse`. All three locale index pages pass with accessibility ≥ 0.95.

---

## Step 11: Final Verification

### 11.1 — Full build and static output check

Run `pnpm build`. Verify:

- `dist/` contains locale directories for `sv/`, `en/`, and `ar/`.
- Each locale directory contains: `index.html`, `forskola/{id}/index.html` for every preschool, `jamfor/index.html`, and `om/index.html`.
- Total HTML file count is approximately 3× the Phase 1 count (3 locales × Phase 1 page count).
- `dist/` size is reasonable (< 1.5 MB excluding images — roughly 3× Phase 1).

**Test:** Run `find dist -name '*.html' | wc -l`. Count should be at least 3 × (1 root redirect + 1 directory + N detail pages + 1 comparison + 1 about) where N is the number of preschools in the index.

### 11.2 — End-to-end user flow test for Phase 2

Write a comprehensive e2e test that simulates the full Phase 2 user flow:

1. Load `/sv/`. See the directory page with the language switcher showing "Svenska" as active.
2. Click the English switcher link. Assert the browser navigates to `/en/`.
3. Verify the directory page renders with English text.
4. Add 3 preschools to the compare set.
5. Click a preschool card link. Assert the detail page is in English.
6. If the preschool is independent, verify a queue link is visible.
7. Navigate back to `/en/`. Verify compare state persists.
8. Navigate to `/en/jamfor/`.
9. Verify the comparison view shows 3 preschools with English text.
10. Click the Share button. Assert the confirmation message appears.
11. Extract the share URL from the clipboard (or from the button's generated URL).
12. Click the Email button. Assert the `mailto:` href is present and contains preschool names.
13. Open the share URL in a new context (or navigate to it). Assert the comparison page restores the 3 preschools.
14. Switch to Arabic via the language switcher. Assert the page switches to `/ar/jamfor/` with RTL layout.
15. Verify Arabic text renders and the layout is mirrored.
16. Navigate back to `/ar/`. Verify compare state persists in Arabic locale.

**Test:** This single e2e test passes end-to-end without errors.

### 11.3 — Run full validation

Run `pnpm validate`. All steps pass:

- ESLint: 0 errors
- Markdown linting: 0 errors
- Prettier: 0 issues
- Type checking: 0 errors
- Unit tests: all pass (including new Phase 2 tests)
- Build: succeeds
- Post-build tests: pass for all locales
- E2e tests (Chromium): all pass
- Lighthouse: accessibility ≥ 0.95 for all locale index pages

**Test:** `pnpm validate` exits with code 0.

---

## Summary of deliverables

After completing all 11 steps, the project will have:

- English and Arabic versions of all pages (`/en/`, `/ar/`) with full translations
- A functional language switcher in the navigation that preserves page context across locale switches
- Correct RTL layout for all Arabic pages
- Optional queue link URLs in the data model for independent preschools
- Queue registration links on detail pages for independent preschools
- URL-encoded share links with a versioned payload schema (lz-string compression)
- A Share button that copies the share URL to the clipboard
- Share link restoration with graceful fallback for missing/renamed preschools
- An Email button that opens the user's email client with a pre-filled shortlist
- Extended accessibility audits covering all locales and new features
- CI/CD pipeline auditing all three locale pages
- Foundation ready for Phase 3 (guided "pick five" flow, distance/operator filtering)
