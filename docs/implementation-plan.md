# Implementation Plan: Förskoleguiden MVP (Phase 1)

> Scope: Phase 1 from the PRD — static site skeleton, Malmö directory, compare tray, side-by-side comparison, charts, summaries, and data attribution. Swedish-only (i18n structure prepared but not populated for en/ar). No shortlist, no sharing, no guided flow.

---

## Step 0: Project Scaffolding & Memory Bank

### 0.0 — Initialize the memory bank

Create the `docs/memory-bank/` directory with the following core files (required by the project's agent instructions for LLM continuity between sessions):

- `projectbrief.md` — Foundation document. Summarize the PRD: static Swedish preschool comparison site, Malmö 2025 survey data, zero-backend, no accounts, mobile-first, accessible.
- `productContext.md` — Why this project exists, problems it solves, user experience goals. Draw from PRD §1–§3.
- `systemPatterns.md` — Architecture overview: Astro static output, Preact islands, nanostores, Tailwind v4, feature-organized `src/features/`. Draw from tech-stack.md.
- `techContext.md` — Technologies, versions, dev setup, constraints. Summarize from tech-stack.md dependency list and build output sections.
- `activeContext.md` — Current work focus: "Phase 1 implementation beginning. No code exists yet. Next step: project scaffolding."
- `progress.md` — Status: "Phase 1 not started. All steps pending."
- `tasks/_index.md` — Empty task index with section headers: In Progress, Pending, Completed, Abandoned.

Each file should be concise (1–2 paragraphs) and reference the PRD/tech-stack for full details.

**Test:** Verify all 7 files exist: `ls docs/memory-bank/projectbrief.md docs/memory-bank/productContext.md docs/memory-bank/systemPatterns.md docs/memory-bank/techContext.md docs/memory-bank/activeContext.md docs/memory-bank/progress.md docs/memory-bank/tasks/_index.md`. All paths resolve without error.

### 0.1 — Initialize the Astro project

Create a new Astro project in the repo root using `pnpm create astro@latest` with the following choices:

- Template: empty (minimal starter)
- TypeScript: strict
- Package manager: pnpm

Ensure the resulting `package.json` has `astro` as a dependency and that `tsconfig.json` exists with `"strict": true`.

**Test:** Run `pnpm dev`. The Astro dev server starts without errors and serves a page at `http://localhost:4321`.

### 0.2 — Install core dependencies

Install all production dependencies in one command:

```
pnpm add @astrojs/preact preact @nanostores/preact nanostores lz-string @astrojs/sitemap
```

**Test:** Run `pnpm ls --depth 0`. All seven packages appear in the dependency list. No peer dependency warnings for Astro or Preact.

### 0.3 — Install dev dependencies

Install all dev tooling in one command:

```
pnpm add -D tailwindcss@^4 @tailwindcss/vite@^4 vitest @playwright/test @axe-core/playwright eslint eslint-plugin-astro prettier prettier-plugin-astro
```

**Test:** Run `pnpm ls --dev --depth 0`. All packages appear. Run `npx vitest --version` and `npx playwright --version` to verify CLIs work.

### 0.4 — Configure Astro (`astro.config.ts`)

Edit `astro.config.ts` to:

1. Set `output: 'static'`.
2. Add the Preact integration (`@astrojs/preact`).
3. Add the Sitemap integration (`@astrojs/sitemap`).
4. Add vite plugin for Tailwind CSS v4 (`@tailwindcss/vite`).
5. Configure i18n routing with three locales (`sv`, `en`, `ar`), `defaultLocale: 'sv'`, and `routing.prefixDefaultLocale: true` (all routes get a locale prefix).

Do NOT add `@astrojs/tailwind` — Tailwind v4 uses the Vite plugin directly.

**Test:** Run `pnpm dev`. No config errors. Visit `http://localhost:4321/sv/` — you should get a 404 page (no pages created yet), confirming i18n routing is active.

### 0.5 — Configure Tailwind CSS v4

Create `src/styles/global.css` with a single Tailwind import:

```css
@import "tailwindcss";
```

No `tailwind.config.ts` file is needed for Tailwind v4 — theme customization will be done via CSS `@theme` blocks in this file later.

**Test:** Temporarily create a `src/pages/sv/index.astro` page that imports `../styles/global.css` and contains `<h1 class="text-2xl font-bold">Test</h1>`. Run `pnpm dev` and verify the heading is styled (large, bold text). Delete the temp page after confirming.

### 0.6 — Configure TypeScript paths

In `tsconfig.json`, add path aliases:

- `@/*` → `./src/*`
- `@data/*` → `./data/*`

This lets any file import from `@/lib/types` or `@data/malmo/index.json` without relative path gymnastics.

**Test:** Create a temporary `.ts` file that imports from `@/lib/types` (the file doesn't need to exist yet). Run `pnpm astro check` — it should report "module not found" for the import target but NOT "cannot resolve path alias". This confirms the alias itself works. Clean up the temp file.

### 0.7 — Add npm scripts

Add the following scripts to `package.json`:

- `"dev": "astro dev"`
- `"build": "astro build"`
- `"preview": "astro preview"`
- `"check": "astro check"`
- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:e2e": "playwright test"`
- `"lint": "eslint ."` (ESLint v9 flat config controls file extensions via `files` globs in the config — do NOT use the removed `--ext` flag)
- `"format": "prettier --write \"src/**/*.{ts,tsx,astro,css,json}\""`

**Test:** Run `pnpm build`. The build completes and produces a `dist/` folder (likely empty or with just a 404 page). Run `pnpm check` — should succeed with no type errors.

### 0.8 — Configure ESLint and Prettier

Create ESLint config (flat config format, `eslint.config.js`) that includes:

- TypeScript support
- `eslint-plugin-astro` for `.astro` files

Create `.prettierrc` with:

- `"plugins": ["prettier-plugin-astro"]`
- Consistent settings (e.g., `singleQuote: true`, `semi: false` or your preference — just be consistent)

**Test:** Run `pnpm lint` — should exit cleanly (no files to lint yet, no errors). Run `pnpm format` — should exit cleanly.

### 0.9 — Configure Vitest

Create `vitest.config.ts` at the project root:

- Use Vite's `defineConfig`.
- Set `test.include` to `['tests/unit/**/*.test.ts']`.
- Add the path aliases from `tsconfig.json` so imports like `@/lib/types` resolve in tests.

Create a placeholder test file `tests/unit/smoke.test.ts` with a single passing assertion (e.g., `expect(true).toBe(true)`).

**Test:** Run `pnpm test`. The smoke test passes.

### 0.10 — Configure Playwright

Run `pnpm exec playwright install` to download browsers.

Create `playwright.config.ts`:

- Set `baseURL` to `http://localhost:4321`.
- Set `webServer.command` to `pnpm preview` and `webServer.port` to `4321`.
- Set test directory to `tests/e2e/`.

Create a placeholder e2e test `tests/e2e/smoke.spec.ts` that navigates to `/sv/` and asserts: (a) the HTTP response status is 200, and (b) the page title does not contain "404".

**Test:** Run `pnpm build && pnpm test:e2e`. The smoke e2e test passes. (Note: it will fail until a real `/sv/` page is created in Step 3.1, which is expected — re-run after Step 3.1 to confirm it passes.)

### 0.11 — Add `.gitignore` entries

Ensure `.gitignore` includes: `node_modules/`, `dist/`, `.astro/`, and any OS files (`.DS_Store`).

**Test:** Run `git status`. None of the ignored directories appear as untracked.

---

## Step 1: Data Layer

### 1.1 — Define TypeScript interfaces for preschool data

Create `src/lib/types.ts` with interfaces that exactly match the JSON template shape:

- `SurveyResponse` — the five percentage fields (`completelyAgreePercentage`, `partlyAgreePercentage`, `neitherAgreeNorDisagreePercentage`, `partlyDisagreePercentage`, `completelyDisagreePercentage`). All fields are `number`.
- `SurveyQuestion` — `text: string` and `response: SurveyResponse`.
- `QuestionGroup` — `name: string` and `questions: SurveyQuestion[]`.
- `PreschoolSurvey` — `preschoolName: string`, `address: string`, `surveyYear: number`, `questionGroups: QuestionGroup[]`.
- `PreschoolIndexEntry` — `id: string` (slug), `name: string`, `address: string`, `operatorType: 'municipal' | 'independent'`.
- `PreschoolIndex` — `city: string`, `year: number`, `preschools: PreschoolIndexEntry[]`.

**Test:** Write a unit test in `tests/unit/types.test.ts` that creates a sample object conforming to `PreschoolSurvey` and asserts it has the expected property names and types. The test must compile and pass.

### 1.2 — Create seed data: directory index

Create `data/malmo/index.json` conforming to `PreschoolIndex`. Include at least 5 preschools with realistic Malmö names, addresses, and a mix of `municipal` and `independent` operator types. Each entry needs a unique `id` slug (e.g., `"trollslandarnas-forskola"`).

**Test:** Write a unit test that reads `data/malmo/index.json`, parses it, and asserts: (a) it has a `preschools` array with length ≥ 5, (b) every entry has `id`, `name`, `address`, and `operatorType`, (c) `operatorType` is always `'municipal'` or `'independent'`.

### 1.3 — Create seed data: individual preschool survey files

For each preschool in the directory index, create a corresponding JSON file at `data/malmo/2025/{id}.json` conforming to `PreschoolSurvey`. Use realistic but varied percentage values for the two "Helhetsbedömning" questions (not all zeros, not all the same). The `preschoolName` in each file must match the `name` in the index. At least 5 files.

**Test:** Write a unit test that: (a) reads the index, (b) for each preschool, reads the corresponding survey JSON, (c) asserts the file exists and has valid `questionGroups` with at least one group named `"Helhetsbedömning"` containing exactly 2 questions, (d) asserts all five response percentages are numbers between 0 and 100, (e) asserts the five percentages for each question sum to between 99 and 101 (allowing ±1 for rounding). This sum constraint is critical — stacked bar charts in Step 8 will be visually broken if the values don't sum to ~100.

### 1.4 — Create a data-loading utility

Create `src/lib/data.ts` with functions:

- `getPreschoolIndex(): PreschoolIndex` — reads and returns `data/malmo/index.json`.
- `getPreschoolSurvey(id: string): PreschoolSurvey` — reads and returns `data/malmo/2025/{id}.json`.
- `getAllPreschoolSurveys(): PreschoolSurvey[]` — reads all survey files for the current city/year.

These functions use Node.js `fs` (available at Astro build time). They should throw a clear error if a file is missing.

**Test:** Write a unit test that calls `getPreschoolIndex()` and asserts it returns an object with 5+ preschools. Call `getPreschoolSurvey('some-known-id')` and assert it returns a valid `PreschoolSurvey`. Call `getPreschoolSurvey('nonexistent-id')` and assert it throws.

### 1.5 — Create an "agree share" computation utility

Create `src/lib/scoring.ts` with a function:

- `computeAgreeShare(response: SurveyResponse): number` — returns `completelyAgreePercentage + partlyAgreePercentage`.
- `computeOverallScore(survey: PreschoolSurvey): number` — computes the average agree share across all questions in the "Helhetsbedömning" group. Returns `-1` if the group is missing (a detectable sentinel that will not silently corrupt sort order like `NaN` would). The directory ranking (Step 4.3) must sort preschools with a `-1` score to the bottom of the list.

**Test:** Write unit tests:
- Given a response with `completelyAgreePercentage: 60` and `partlyAgreePercentage: 25`, `computeAgreeShare` returns `85`.
- Given a survey with two questions whose agree shares are `80` and `90`, `computeOverallScore` returns `85`.
- Given a survey with no "Helhetsbedömning" group, `computeOverallScore` returns `-1`.
- Sorting: given a list containing scores `[85, -1, 72]`, sorting descending with `-1` pushed to the bottom produces `[85, 72, -1]`.

---

## Step 2: i18n Foundation

### 2.1 — Create Swedish translation file

Create `src/i18n/sv.json` with keys for all user-facing strings needed in Phase 1:

- Site title, site description/tagline
- Navigation labels (e.g., "Förskolor", "Jämför")
- Directory page (heading, sort labels, "Lägg till i jämförelse")
- Compare tray labels ("Jämför X förskolor", "Visa jämförelse", "Rensa")
- Comparison page (heading, question labels, "Instämmer helt", "Instämmer delvis", etc.)
- Summary phrases (higher/lower/similar templates)
- Attribution text and link label
- Footer, about text

Keep values as Swedish strings.

**Test:** Write a unit test that imports `sv.json`, asserts it is a valid object, and checks that specific required keys exist (e.g., `site.title`, `directory.heading`, `compare.heading`). The key structure is up to you — just verify it's consistent.

### 2.2 — Create placeholder translation files for en and ar

Create `src/i18n/en.json` and `src/i18n/ar.json` with the same key structure as `sv.json`, but with placeholder English and Arabic values respectively. For Arabic, use placeholder text (real translation comes in Phase 2).

**Test:** Write a unit test that imports all three JSON files and asserts they have exactly the same set of top-level keys.

### 2.3 — Create the `t()` helper and locale utilities

Create `src/i18n/utils.ts` with:

- `getLocaleFromURL(url: URL | string): 'sv' | 'en' | 'ar'` — extracts the locale from the URL path prefix. Defaults to `'sv'`.
- `t(key: string, locale: 'sv' | 'en' | 'ar'): string` — looks up a dot-separated key (e.g., `'site.title'`) in the correct locale JSON. Returns the key itself as fallback if not found.
- `type Locale = 'sv' | 'en' | 'ar'` — exported type.

**Test:** Write unit tests:
- `getLocaleFromURL('/sv/')` returns `'sv'`, `getLocaleFromURL('/en/compare')` returns `'en'`, `getLocaleFromURL('/ar/')` returns `'ar'`, `getLocaleFromURL('/')` returns `'sv'`.
- `t('site.title', 'sv')` returns the Swedish title string from `sv.json`.
- `t('nonexistent.key', 'sv')` returns `'nonexistent.key'`.

---

## Step 3: Layout and Static Shell

### 3.1 — Create the base layout

Create `src/layouts/BaseLayout.astro`:

- Accepts props: `title: string`, `locale: Locale` (from `src/i18n/utils.ts`).
- Renders a full HTML document (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
- Sets `<html lang={locale}>` and `dir="rtl"` when `locale === 'ar'`.
- Includes `<meta charset="UTF-8">`, `<meta name="viewport" ...>`, and `<title>`.
- Imports `src/styles/global.css`.
- Provides a `<slot />` for page content.
- Includes a `<header>`, `<main>`, and `<footer>` semantic structure.

**Test:** Create a minimal page `src/pages/sv/index.astro` that uses `BaseLayout` with `locale="sv"` and `title="Test"`. Run `pnpm build` — the build succeeds and `dist/sv/index.html` contains `<html lang="sv">`, a `<header>`, a `<main>`, and a `<footer>`.

### 3.2 — Create the navigation component

Create `src/components/astro/Nav.astro`:

- Accepts prop: `locale: Locale`.
- Renders the site name/logo linking to `/{locale}/`.
- Shows a static city indicator: "Malmö" (selected, not a dropdown in MVP — just text or a disabled selector showing "Malmö" as active and "Stockholm", "Göteborg" as disabled/grayed out "coming soon" items).
- Shows the survey year "2025" as static text (not changeable).
- Placeholder for a language switcher (can be empty/non-functional for now — Phase 2).

Include the Nav in `BaseLayout.astro` inside the `<header>`.

**Test:** Run `pnpm build`. View the built HTML for `/sv/index.html`. Assert it contains: the site name, the text "Malmö", and the text "2025". Check that "Stockholm" and "Göteborg" appear as visible-but-disabled items (e.g., with `aria-disabled="true"` or a CSS class indicating disabled).

### 3.3 — Create the footer component

Create `src/components/astro/Footer.astro`:

- Accepts prop: `locale: Locale`.
- Renders data attribution text (in Swedish for now) crediting Malmö stad.
- Includes a link to the official source: `https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten.html`.

Include the Footer in `BaseLayout.astro` inside the `<footer>`.

**Test:** Run `pnpm build`. Inspect `dist/sv/index.html`. Assert it contains a link to the Malmö stad URL and attribution text. Run an axe accessibility check on the page (or manually verify the link has accessible text).

### 3.4 — Add a root redirect

Add a redirect in `astro.config.ts` using Astro's native `redirects` config: `redirects: { '/': '/sv/' }`. This produces a proper HTTP redirect in the static output. Do NOT use `<meta http-equiv="refresh">` — it is an accessibility anti-pattern that can disorient screen reader users.

**Test:** Run `pnpm build`. Open `dist/index.html`. It should contain a redirect mechanism (meta refresh or JS redirect generated by Astro's redirect config) pointing to `/sv/`.

---

## Step 4: Directory Page

### 4.1 — Create the directory page route

Create `src/pages/sv/index.astro` (replacing the test page from Step 3.1 if it exists):

- Uses `BaseLayout` with `locale="sv"`.
- At build time, calls `getPreschoolIndex()` to load the directory data.
- For each preschool, calls `getPreschoolSurvey(id)` to load survey data and `computeOverallScore()` to compute the ranking score.
- Passes the combined data to the page template.

**Test:** Run `pnpm build`. The build succeeds (no errors importing data or computing scores). `dist/sv/index.html` is a non-empty HTML file.

### 4.2 — Create the preschool card component

Create `src/components/astro/PreschoolCard.astro`:

- Accepts props: `id: string`, `name: string`, `address: string`, `operatorType: 'municipal' | 'independent'`, `score: number`, `locale: Locale`.
- Renders a card showing: preschool name (as a link to the detail page `/{locale}/forskola/{id}/`), address, operator type badge (e.g., "Kommunal" or "Fristående"), and the overall score as a percentage.
- Includes a button/control to add the preschool to the compare set. This button is a Preact island placeholder for now — render a static `<button>` with `data-id={id}` and text like "Jämför" that will become interactive in Step 5.

**Test:** Run `pnpm build`. Check `dist/sv/index.html` contains at least 5 preschool cards. Each card shows a name, address, operator type label, and a score. Each name is a link with an `href` matching the pattern `/sv/forskola/{id}/`.

### 4.3 — Render the directory list with default ranking

In `src/pages/sv/index.astro`, render the preschool list sorted by `computeOverallScore()` descending (highest agree share first). Display the ranking position for each card (1, 2, 3…). Include a visible explanation of the ranking method: "Rangordnat efter andel instämmande svar i Helhetsbedömningen" (or similar).

**Test:** Run `pnpm build`. In the output HTML for `/sv/index.html`, extract the preschool names in order. Verify they are sorted by descending overall score by comparing against manually computed scores from the seed data. Verify the ranking explanation text is present.

### 4.4 — Add client-side sort toggle (alphabetical)

Create a small Preact island component `src/components/preact/SortToggle.tsx`:

- Renders two buttons/tabs: "Ranking" (default, by score) and "A–Ö" (alphabetical).
- When toggled, re-sorts the displayed list.
- The sorted data should be passed as a prop to this island (the full preschool list as a serializable array).

Embed this island in the directory page with `client:load`.

**Test:** Run `pnpm build` and `pnpm preview`. Open the page in a browser. Click "A–Ö" — the list re-sorts alphabetically. Click "Ranking" — it re-sorts by score. Verify both orders are correct. Write an e2e test that: loads `/sv/`, clicks the alphabetical sort button, and asserts the first preschool's name is alphabetically first.

---

## Step 5: Compare Tray (Client State)

### 5.1 — Create nanostores atoms for compare state

Create `src/lib/state.ts` with:

- `compareIds` — a nanostore `atom<string[]>` initialized to `[]`. Holds the list of preschool IDs currently selected for comparison.
- A helper function `toggleCompare(id: string)` that adds the ID if not present, removes it if present.
- A helper `clearCompare()` that resets to `[]`.
- A constant `MAX_COMPARE = 5`. The PRD and UX are designed around comparing 2–5 preschools (matching the municipality application process). The store hard-caps at 5. The UI should show a message explaining the limit when a user tries to add a 6th.
- `toggleCompare` should not add beyond `MAX_COMPARE`.

Also add persistence: on every change, write `compareIds` to `sessionStorage` so it survives MPA page navigations. On init, read from `sessionStorage` if available. **Critical: all `sessionStorage` access must be guarded with `typeof window !== 'undefined'`** because this module may be imported during Astro's SSR pre-rendering phase where `sessionStorage` is undefined. Alternatively, use nanostores' `persistentAtom` from `@nanostores/persistent` if available, which handles this internally.

**Test:** Write unit tests for the store:
- `toggleCompare('abc')` adds `'abc'` to the list. Calling again removes it.
- `clearCompare()` empties the list.
- Adding `MAX_COMPARE + 1` items: the last one is not added.
- Persistence: mock `sessionStorage`, set a value, create the store, assert it loads the value.

### 5.2 — Create the "Add to Compare" button island

Create `src/components/preact/CompareButton.tsx`:

- Accepts prop: `id: string`, `name: string`.
- Subscribes to `compareIds` store using `useStore()` from `@nanostores/preact`.
- Renders a `<button>` that toggles the preschool in `compareIds`.
- Visual state: shows "Jämför" when not selected, "Tillagd ✓" (or similar) when selected.
- `aria-pressed` attribute reflects the toggle state.

**Test:** Write an e2e test: load `/sv/`, click the compare button on two preschool cards, verify both buttons show the "selected" state. Click one again — it deselects.

### 5.3 — Create the Compare Tray island

Create `src/components/preact/CompareTray.tsx`:

- Subscribes to `compareIds` store.
- If the list is empty, render nothing (or a hidden element).
- If 1+ preschools selected, render a fixed-position bar at the bottom of the viewport showing:
  - Count of selected preschools (e.g., "2 förskolor valda").
  - A "Visa jämförelse" button/link that navigates to `/{locale}/jamfor/` (the comparison page).
  - A "Rensa" button that calls `clearCompare()`.
- The tray must be keyboard accessible (focusable, operable via Enter/Space).

Embed this island in `BaseLayout.astro` with `client:load` so it appears on every page.

**Test:** Write an e2e test: load `/sv/`, add 2 preschools to compare. Assert the tray appears with text "2" and a link to `/sv/jamfor/`. Click "Rensa" — the tray disappears and all compare buttons reset to unselected.

### 5.4 — Persist compare state across page navigations

Verify that `sessionStorage` persistence works across Astro's MPA navigations.

**Test:** Write an e2e test: load `/sv/`, add 2 preschools to compare. Navigate to another page (e.g., click a preschool card link to go to its detail page). Navigate back to `/sv/`. Assert the compare tray still shows 2 preschools selected and the compare buttons reflect the correct state.

---

## Step 6: Preschool Detail Page

### 6.1 — Create dynamic detail page route

Create `src/pages/sv/forskola/[id].astro`:

- Uses `getStaticPaths()` to generate a page for each preschool in the index.
- Fetches the preschool's survey data via `getPreschoolSurvey(id)`.
- Uses `BaseLayout` with `locale="sv"` and the preschool name as the title.

The page should show:

- Preschool name (as `<h1>`).
- Address.
- Operator type.
- Survey year.
- The "Helhetsbedömning" question group results: for each question, display the question text and the five response percentages.
- A "Jämför" (CompareButton) island for this preschool.
- Attribution linking to the Malmö stad source.

**Test:** Run `pnpm build`. For each preschool ID in the index, assert that `dist/sv/forskola/{id}/index.html` exists. Open one and verify it contains the preschool name as an `<h1>`, the address, the operator type, and the two question texts with percentage values.

### 6.2 — Display response percentages in a readable format

On the detail page, for each question in "Helhetsbedömning", render the five response categories and their percentages as a structured list or table. Use the canonical Swedish response category labels (these must be defined as i18n keys in `sv.json` in Step 2.1 and used everywhere — detail pages, charts, legends, ARIA labels):

1. "Instämmer helt" (`completelyAgreePercentage`)
2. "Instämmer delvis" (`partlyAgreePercentage`)
3. "Varken eller" (`neitherAgreeNorDisagreePercentage`)
4. "Instämmer inte delvis" (`partlyDisagreePercentage`)
5. "Instämmer inte alls" (`completelyDisagreePercentage`)

These five labels are the single source of truth for all response category rendering across the entire application.

**Test:** Inspect the built HTML for a detail page. Assert all five response labels appear exactly as specified above and their associated percentage values match the source JSON file.

---

## Step 7: Comparison Page

### 7.1 — Create the comparison page route

Create `src/pages/sv/jamfor/index.astro` (note: use `/jamfor/index.astro`, not `/jamfor.astro`, to produce the URL `/sv/jamfor/` with trailing slash — matching the links generated by the CompareTray in Step 5.3):

- Uses `BaseLayout` with `locale="sv"`.
- This page is a shell that renders a Preact island for the interactive comparison content, since the compared preschools are determined by client-side state (`compareIds`).
- At build time, load ALL preschool survey data and pass it as a serialized JSON prop to the island. (The island then filters to only the selected IDs at runtime.)

**Test:** Run `pnpm build`. Assert `dist/sv/jamfor/index.html` exists and contains the Preact island mount point. The page should render even with an empty compare set (showing a message like "Välj förskolor att jämföra").

### 7.2 — Create the ComparisonView Preact island

Create `src/components/preact/ComparisonView.tsx`:

- Accepts prop: `allSurveys: PreschoolSurvey[]` (all survey data, serialized).
- Subscribes to `compareIds` store.
- Filters `allSurveys` to only the selected IDs.
- If 0 selected: show a message encouraging the user to add preschools (with a link back to the directory).
- If 1 selected: show that preschool's results and a message suggesting to add more for comparison.
- If 2–5 selected: show the side-by-side comparison table.
- If >5 selected: still show the comparison but consider a note about optimal comparison count.

For 2+ preschools, render a comparison table:

- Rows: one per question in "Helhetsbedömning" (2 rows for MVP).
- Columns: one per selected preschool.
- Cells: show the agree share percentage (`completelyAgree + partlyAgree`).

**Test:** Write an e2e test: load `/sv/`, add 3 preschools to compare, click "Visa jämförelse" to navigate to `/sv/jamfor/`. Assert the comparison table is visible with 3 columns (one per preschool) and 2 rows (one per question). Assert the displayed percentages match the seed data.

### 7.3 — Handle the empty and single-preschool states

- When 0 preschools selected, the comparison page shows a clear message and a link or button to go back to the directory.
- When 1 preschool selected, show its results and a prompt to add more.

**Test:** Write an e2e test: navigate directly to `/sv/jamfor/` without selecting any preschools. Assert the empty-state message appears with a link to `/sv/`. Add 1 preschool (go back, select one, return), assert the single-preschool view appears.

### 7.4 — Make the comparison table responsive for mobile

The comparison table must remain usable on small screens (375px width, iPhone 13 mini). Options:

- Use a horizontally scrollable container with `overflow-x: auto`.
- Or reflow the table into a card-per-preschool layout on narrow screens.

Choose one approach and implement it.

**Test:** Write an e2e test with a viewport set to 375×812 (iPhone 13 mini). Load the comparison page with 4 preschools. Assert all 4 preschool names and all question data are reachable (either visible or scrollable). No content should be clipped or invisible.

---

## Step 8: Accessible SVG Charts

### 8.1 — Create the BarChart Preact component

Create `src/components/preact/BarChart.tsx`:

- Accepts props: `responses: SurveyResponse[]` (one per preschool for a single question), `labels: string[]` (preschool names), `questionText: string`.
- Renders a horizontal stacked bar chart using `<svg>`:
  - Each bar represents one preschool.
  - Each bar is divided into 5 segments (the 5 response categories).
  - Each segment is colored differently AND uses a unique SVG `<pattern>` fill (stripes, dots, crosshatch, etc.) for non-color encoding.
  - Each segment has a `<title>` element for hover/screen-reader access showing the category name and percentage.
- The SVG has `role="img"` and an `aria-label` describing the chart.

**Test:** Run `pnpm build` and render the chart in the comparison page. Inspect the SVG in DevTools: assert it contains `<pattern>` definitions, `<rect>` elements with `fill="url(#pattern-...)"`, `<title>` elements with percentage text, and `role="img"` on the `<svg>`.

### 8.2 — Define a color-blind-safe palette with pattern fills

Define 5 distinct colors for the 5 response categories that are distinguishable by colorblind users (e.g., using a ColorBrewer palette). Additionally, define 5 unique SVG patterns:

1. Completely agree — solid fill (e.g., dark blue)
2. Partly agree — diagonal stripes (e.g., medium blue)
3. Neither — dots (e.g., gray)
4. Partly disagree — horizontal lines (e.g., orange)
5. Completely disagree — crosshatch (e.g., red)

These patterns should be defined as reusable `<defs>` in the SVG.

**Test:** Visually inspect the chart in a grayscale rendering (e.g., using browser DevTools CSS filter `grayscale(100%)`). Assert that all 5 segments are distinguishable even without color. Alternatively, write a test that asserts 5 unique `<pattern>` elements exist in the SVG.

### 8.3 — Add a chart legend

Below or beside each chart, render a legend mapping each color+pattern to its category name.

**Test:** Inspect the built comparison page. Assert the legend contains all 5 canonical category names as defined in Step 6.2: "Instämmer helt", "Instämmer delvis", "Varken eller", "Instämmer inte delvis", "Instämmer inte alls" (using the Swedish labels from the i18n file).

### 8.4 — Add a `<table>` fallback for screen readers

The `<table>` fallback must be rendered **inside the `ComparisonView` Preact island** (not at the Astro level), because which preschools appear in the comparison is determined entirely by client-side `compareIds` state — Astro has no knowledge of the selection at build time.

Inside `ComparisonView`, for each question/chart, render a `<table>` alongside the `<svg>` chart. The table should be visually de-emphasized (e.g., with a `sr-only` class or placed below the chart) but always present in the DOM when the island is hydrated.

The table should have:
- Column headers: preschool names
- Row headers: the 5 canonical response categories (from Step 6.2)
- Cells: percentage values

Note: because this is inside a Preact island, it requires JavaScript to render. For the true no-JS case, the comparison page's Astro shell should show a `<noscript>` message directing users to individual preschool detail pages (which are fully static and accessible without JS).

**Test:** Run `pnpm build` and `pnpm preview`. Open the comparison page with 2+ preschools selected. Inspect the DOM: assert a `<table>` element exists alongside the SVG chart with the correct column/row structure. Assert the `<noscript>` fallback message is present in the raw HTML.

### 8.5 — Add ARIA attributes to charts

Ensure:

- The `<svg>` element has `role="img"` and `aria-label` (e.g., "Jämförelsediagram för frågan: [question text]").
- Each bar `<rect>` inside the SVG does NOT need individual roles if the `<title>` approach is used, but verify screen reader output.
- The `<table>` fallback is always linked from the chart using `aria-describedby` pointing to the table's `id`.

**Test:** Run `pnpm test:e2e` with `@axe-core/playwright`. Assert zero accessibility violations on the comparison page. Specifically check that axe does not flag missing alt text or ARIA attributes on the chart elements.

---

## Step 9: Comparison Summaries

### 9.1 — Implement the deterministic summary logic

Create `src/features/comparison/summary.ts` with:

- `computeSummary(surveys: PreschoolSurvey[]): ComparisonSummary` — takes 2+ surveys and produces a structured summary.
- For each question in "Helhetsbedömning", compute each preschool's agree share.
- For each pair of preschools and each question, compute the delta. Classify:
  - Delta ≥ 5 percentage points → `'higher'`
  - Delta ≤ −5 percentage points → `'lower'`
  - Otherwise → `'similar'`
- Return a structured object (define `ComparisonSummary` type) containing per-question, per-preschool-pair comparisons with the classification and the actual percentages.

**Test:** Write unit tests:
- Two preschools: school A has 80% agree share, school B has 74%. Delta is 6 → A is "higher" than B, B is "lower" than A.
- Two preschools: school A has 80%, school B has 78%. Delta is 2 → "similar".
- Three preschools: verify all pairwise comparisons are computed correctly.

### 9.2 — Create comparison summary text templates

Create `src/features/comparison/summaryText.ts`:

- Takes a `ComparisonSummary` and a locale, and produces an array of human-readable summary sentences.
- Template examples (Swedish):
  - Higher: "{preschoolA} har en högre andel instämmande svar ({X}%) än {preschoolB} ({Y}%) för frågan om {questionShort}."
  - Similar: "{preschoolA} ({X}%) och {preschoolB} ({Y}%) har liknande resultat för frågan om {questionShort}."
  - Lower: "{preschoolA} har en lägre andel instämmande svar ({X}%) än {preschoolB} ({Y}%) för frågan om {questionShort}."
- Use neutral, factual language. No superlatives. No subjective wording.

**Test:** Write unit tests that pass known inputs and assert the output strings match expected patterns (e.g., contain the correct preschool names, correct percentages, and the correct classification word).

### 9.3 — Render summaries in the comparison page

In the `ComparisonView` component, below the chart and table, render the text summary sentences. Each sentence should be a `<p>` or `<li>` element.

**Test:** Write an e2e test: load the comparison page with 2 preschools that have different agree shares. Assert the summary text contains both preschool names and the correct classification language (e.g., "högre" or "liknande").

---

## Step 10: Data Attribution

### 10.1 — Add attribution to the comparison page

On the comparison page, include a visible attribution section:

- Text: "Data från Malmö stads förskoleenkät 2025."
- Link to the official source page.
- This should be in the static HTML (Astro), not inside the Preact island.

**Test:** Inspect the built HTML for `/sv/jamfor/index.html`. Assert it contains the attribution text and a clickable link to the Malmö stad URL.

### 10.2 — Add attribution to detail pages

Each preschool detail page should include the same attribution section.

**Test:** Inspect the built HTML for any preschool detail page. Assert the attribution text and source link are present.

### 10.3 — Verify attribution in the footer

The footer (created in Step 3.3) already has attribution. Verify it is present on all pages.

**Test:** Run a build and spot-check 3 pages (index, a detail page, the comparison page). All three should contain the footer attribution link.

---

## Step 11: Accessibility Audit

### 11.1 — Run axe-core on all key pages

Create e2e tests that run `@axe-core/playwright` accessibility checks on:

- `/sv/` (directory page)
- `/sv/forskola/{any-id}/` (detail page)
- `/sv/jamfor/` (comparison page with 2+ preschools selected)

**Test:** All three pages pass with zero violations at the `wcag2a` and `wcag2aa` levels.

### 11.2 — Keyboard navigation audit

Write e2e tests that verify:

- On the directory page: Tab navigates through preschool cards, compare buttons, and sort toggle. All interactive elements receive visible focus.
- On the comparison page: Tab navigates through the table/chart area and summary. The compare tray buttons are keyboard-operable.
- The compare tray "Visa jämförelse" and "Rensa" buttons are reachable via Tab and activatable via Enter and Space.

**Test:** E2e tests that use `page.keyboard.press('Tab')` to navigate and assert `document.activeElement` matches expected elements. All assertions pass.

### 11.3 — Run Lighthouse performance check

Run Lighthouse CI or a manual Lighthouse audit on the built site.

**Test:** Accessibility score ≥ 95. Performance score ≥ 90. Total page weight for `/sv/` is under 100 KB (HTML + CSS + JS).

---

## Step 12: Build and Deploy Pipeline

### 12.1 — Create GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

- Triggers on push to `main`.
- Steps: checkout → install pnpm → `pnpm install` → `pnpm build` → deploy to GitHub Pages using the official `actions/deploy-pages` action.
- Include a step to run `pnpm test` (unit tests) before building.

**Test:** Push a commit to `main` (or manually trigger the workflow). The action completes successfully and the site is accessible at the GitHub Pages URL.

### 12.2 — Create a CI workflow for PRs

Create `.github/workflows/ci.yml`:

- Triggers on pull requests.
- Steps: checkout → install pnpm → `pnpm install` → `pnpm lint` → `pnpm check` → `pnpm test` → `pnpm build` → `pnpm test:e2e`.

**Test:** Open a PR with a trivial change. The CI workflow runs all steps and passes.

---

## Step 13: Final Verification

### 13.1 — Full build and static output check

Run `pnpm build`. Verify:

- `dist/` contains:
  - `index.html` (root redirect)
  - `sv/index.html` (directory page)
  - `sv/forskola/{id}/index.html` for each preschool
  - `sv/jamfor/index.html` (comparison page)
- Total `dist/` size is reasonable (< 500 KB excluding images).

**Test:** Run `find dist -name '*.html' | wc -l`. Count should be at least 1 (root redirect) + 1 (directory) + 5 (detail pages) + 1 (comparison) = 8 HTML files.

### 13.2 — End-to-end user flow test

Write a comprehensive e2e test that simulates the full Phase 1 user flow:

1. Load `/sv/`.
2. See the directory with preschools sorted by ranking.
3. Click the sort toggle to switch to alphabetical, then back.
4. Add 3 preschools to the compare set.
5. Verify the compare tray shows "3 förskolor valda".
6. Click "Visa jämförelse" to navigate to the comparison page.
7. Verify the comparison table shows 3 columns with correct preschool names.
8. Verify a chart is rendered (SVG exists with `<rect>` elements).
9. Verify comparison summary text is present and mentions the 3 preschool names.
10. Verify attribution link is present.
11. Navigate back to `/sv/`, verify compare state persists.
12. Click on a preschool name to open its detail page.
13. Verify the detail page shows the preschool's data.
14. Navigate back, verify compare state still persists.

**Test:** This single e2e test passes end-to-end without errors.

---

## Summary of deliverables

After completing all 13 steps, the project will have:

- A fully scaffolded Astro + Preact + Tailwind + TypeScript project
- Seed data for 5+ Malmö preschools
- A Swedish-language directory page with ranked listing and alphabetical sort
- Individual preschool detail pages
- A client-side compare tray with persistent selection
- A comparison page with side-by-side table and accessible SVG charts
- Deterministic text comparison summaries
- Data attribution on every relevant page
- Passes accessibility audits (axe-core, keyboard navigation)
- CI/CD pipeline for testing and GitHub Pages deployment
- Foundation ready for Phase 2 (shortlist, sharing, multilingual)
