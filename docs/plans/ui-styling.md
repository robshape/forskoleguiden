# UI & Styling Plan

> Created: 2026-03-02
> Scope: Design foundations + shell component styling (Steps 0–3), plus a plan for adding UI/styling tasks to the implementation plan for Steps 4+.

---

## Analysis

### Current state

Steps 0–3 are fully implemented and test-covered. The shell components exist with correct semantic HTML, accessibility attributes, and i18n wiring:

- **BaseLayout.astro** — `<html>`, `<head>`, `<body>` with `<header>`, `<main>`, `<footer>`. No visual styling on body/main.
- **Nav.astro** — Site name link, city selector (Malmö active, Stockholm/Göteborg disabled), year text, language placeholder. Has basic flex layout and gray disabled text but doesn't match the mockup.
- **Footer.astro** — Attribution text + source link. Basic text sizing only.
- **global.css** — Only `@import 'tailwindcss'`. No theme tokens, no custom colors, no typography settings.

### What the mockups define

The `docs/mockups/homepage.svg` mockup (375×812, mobile viewport) establishes the visual language:

- **Page background**: `#f9fafb` (Tailwind `gray-50`)
- **Header**: White background, bottom border (`#e5e7eb` / `gray-200`), contains site name (bold, 20px) left-aligned and locale switcher pill top-right
- **City selector**: Horizontal chips — active city has blue background (`#2563eb` / `blue-600`) with white text; disabled cities have gray background (`#f3f4f6` / `gray-100`) with muted text (`#9ca3af` / `gray-400`)
- **Typography**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...`), hierarchy from 24px headings to 11px labels
- **Cards**: White background, rounded corners (`12px`), 1px gray border, consistent padding
- **Color palette**: Primary blue (`#2563eb`), score green (`#166534` on `#dcfce7`), score yellow (`#854d0e` on `#fef08a`), grays for text hierarchy
- **Compare tray**: Fixed bottom bar, white background, drop shadow, blue CTA button with rounded pill shape

### Gap analysis for Steps 0–3

| Component          | What exists                  | What's missing from mockup                                                                                                                           |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.css`       | Tailwind import only         | `@theme` block with color tokens, font stack, page background                                                                                        |
| `BaseLayout.astro` | Semantic structure           | Body background color, page-level layout (min-height, flex column, footer-at-bottom), container max-width pattern                                    |
| `Nav.astro`        | Correct content + basic flex | White header bg, bottom border, proper chip styling for city selector (blue active / gray disabled with rounded pill shapes), layout matching mockup |
| `Footer.astro`     | Correct content + basic text | Visual separation from content (top border or spacing), text color matching mockup, link styling                                                     |

### Gap analysis for Steps 4–13

The implementation plan from Step 4 onward **does not include any dedicated UI/styling step**. Steps mention creating components (cards, charts, tables) with functional descriptions but no visual design specifications. There is no step for:

- Establishing the design token foundation (done here as Phase A)
- Card component visual design (Step 4.2 says "renders a card" but doesn't specify visual styling)
- Compare tray visual design (Step 5.3 says "fixed-position bar" but no mockup-aligned styling)
- Responsive layouts and spacing systems
- Interactive state styling (hover, focus, active states)
- Color-coding for score badges (green/yellow thresholds)

---

## Phase A: Design Foundations (do now)

Set up the design system tokens and apply them to the existing shell components. This work is independent of Step 4 and should be done before it.

### A.1 — Define theme tokens in `global.css`

Add a Tailwind v4 `@theme` block to `src/styles/global.css` with:

**Colors** (extracted from mockups):

- `--color-primary-*`: Blue scale anchored at `#2563eb` (blue-600)
- `--color-score-high-bg`: `#dcfce7` (green badge background)
- `--color-score-high-text`: `#166534` (green badge text)
- `--color-score-medium-bg`: `#fef08a` (yellow badge background)
- `--color-score-medium-text`: `#854d0e` (yellow badge text)
- `--color-surface`: `#ffffff` (card/header backgrounds)
- `--color-page`: `#f9fafb` (page background)
- `--color-border`: `#e5e7eb` (borders and dividers)

**Typography**:

- Font family: system font stack (Tailwind's default `font-sans` already matches the mockup's `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto` stack — no override needed)

**Spacing / Layout**:

- Content max-width: `--max-width-content: 40rem` (640px, appropriate for mobile-first content) — generates `max-w-content` utility

**Shadows**:

- `--shadow-tray: 0 -4px 6px rgba(0,0,0,0.05)` — upward shadow for the sticky compare tray (generates `shadow-tray` utility, used in Step 5.3)

**Test**: Build succeeds. The theme tokens are available as Tailwind utilities (e.g., `bg-page`, `bg-surface`, `border-border`, `max-w-content`, `shadow-tray`).

### A.2 — Style the page shell in `BaseLayout.astro`

Apply to `<body>`:

- Background: `bg-page` (`#f9fafb`)
- Font: `font-sans` (system stack)
- Text color: `text-gray-900` (default body text)
- Layout: `min-h-screen flex flex-col` (footer sticks to bottom)
- Anti-aliased text rendering

Apply to `<main>`:

- `flex-1` (fills available space, pushing footer to the bottom — no `mt-auto` needed on `<footer>` since `flex-1` already consumes all remaining space)
- Container with `max-w-content` and horizontal padding

**Test**: Build succeeds. The page has a light gray background, content is centered with max-width, footer is at the bottom even with minimal content.

### A.3 — Style the header/nav to match mockup

Restyle `Nav.astro` to match the homepage mockup:

- **Header bar**: White background, bottom border (`border-b border-border`)
- **Top row**: Site name (bold, ~text-xl) left-aligned (`ltr:text-left rtl:text-right`). Language switcher placeholder right-aligned (`ltr:ml-auto rtl:mr-auto`, gray pill shape: `bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold`)
- **City selector row**: Horizontal row of pill-shaped chips (`flex flex-wrap gap-2`, flow reverses automatically in RTL via parent `dir="rtl"`):
  - Malmö: `bg-primary-600 text-white rounded-lg px-4 py-2 font-semibold`
  - Stockholm, Göteborg: `bg-gray-100 text-gray-400 rounded-lg px-4 py-2 cursor-not-allowed`
- **Survey year**: `text-sm text-gray-600 font-medium` — "Survey Year: **2025**"
- **RTL support**: All padding that differs left/right must use logical properties (`ps-*`/`pe-*` instead of `pl-*`/`pr-*`). Flex direction reverses automatically via the `dir="rtl"` attribute on `<html>` set by BaseLayout.

**Test**: Build succeeds. Visual inspection confirms: white header with bottom border, blue "Malmö" chip, gray disabled city chips, site name bold and left-aligned. Build with `locale="ar"` renders the same layout mirrored (site name right-aligned, switcher left-aligned).

### A.4 — Style the footer to match mockup

Restyle `Footer.astro`:

- **Top border or spacing**: Visual separation from main content (e.g., `border-t border-border` or generous top margin)
- **Text**: `text-sm text-gray-400` for attribution
- **Link**: `text-primary-600 underline` for the source link (matching the mockup's blue underlined link)
- **Padding and max-width**: Consistent with the page container. Use logical padding properties (`ps-*`/`pe-*`) so padding mirrors correctly in RTL.
- **RTL support**: Text alignment and padding must use logical properties. The `<a>` inline link flows naturally with the text direction, so no additional RTL handling is needed for the link itself.

**Test**: Build succeeds. Footer has visual separation from content, muted attribution text, and a blue underlined source link. With `locale="ar"`, text is right-aligned and padding mirrors correctly.

### A.5 — Add base interactive styles

Add global styles to `global.css` for consistent interactive element behavior:

- **Focus visible**: `outline-2 outline-offset-2 outline-primary-600` on all focusable elements (keyboard users)
- **Buttons**: Consistent cursor, transition for hover/active states
- **Links**: Underline on hover where not already underlined

These are lightweight global defaults that prevent unstyled interactive elements in Steps 4+.

**Test**: Tab through the page. All focusable elements (site name link, footer link) show a visible blue focus ring. `pnpm build` succeeds.

### A.6 — Verify and run quality gates

Run: `pnpm lint`, `pnpm format`, `pnpm test`, `pnpm build`.

All must pass. The e2e layout-shell tests must still pass (they check for semantic elements and content, not specific styling classes).

---

## Phase B: Update Implementation Plan for Steps 4+ UI/Styling

The implementation plan (Steps 4–13) describes component functionality but never specifies visual design. The mockups provide concrete visual specifications for the homepage (directory), comparison view, preschool details, and shortlist pages. The plan needs UI/styling tasks added to each step.

### Recommended approach

Rather than adding a separate "styling step" at the end (which leads to a visual-last, retrofit approach), **embed styling requirements directly into each existing step** using the mockup specifications. This means each component is built with correct styling from the start.

### Specific additions per step

#### Step 4: Directory Page

Step 4.2 ("Create the preschool card component") should include visual specs from `homepage.svg`:

- White card with `rounded-xl border border-border` and consistent padding
- Name: bold `text-base`, linked
- Metadata line: `text-sm text-gray-500` — "Independent • Montessori" / "Municipal • Reggio Emilia"
- Score badge: Circular element with colored background
  - ≥80% agree share → green badge (`bg-green-100 text-green-800`)
  - 60–79% → yellow badge (`bg-yellow-100 text-yellow-800`)
  - <60% → gray/neutral badge
- Score label: "Agree share" with "Helhetsbedömning" subtitle below
- Compare button: Gray pill when unselected ("+ Compare"), blue pill when selected ("✓ Added")

Step 4.3 should specify:

- List heading: "Preschools (N)" with count, `text-lg font-bold`
- Sort control: Blue text link aligned right ("Sort: Rating")
- Card spacing: `gap-4` between cards (vertical stack)

Step 4.4 (sort toggle) should specify the tab/button styling from the mockup.

#### Step 5: Compare Tray

Step 5.3 ("Create the Compare Tray island") should include visual specs from `homepage.svg`:

- Fixed bottom bar: `fixed bottom-0 inset-x-0 bg-white shadow-tray` (uses the `--shadow-tray` theme token from A.1)
- Safe area inset: `pb-[env(safe-area-inset-bottom)]` to prevent the iPhone home indicator from overlapping tray content on the target viewport (iPhone 13 mini). Requires `<meta name="viewport" content="..., viewport-fit=cover">` in BaseLayout `<head>`.
- Left side: Selection count (bold) + comma-separated preschool names (gray, smaller)
- Right side: Blue pill "Compare" CTA button (`bg-primary-600 text-white rounded-full px-6 py-3 font-bold`)
- Height: ~100px with padding (plus safe area inset on iOS)

Step 5.2 ("CompareButton") styling is covered by the card component specs above.

#### Step 6: Preschool Detail Page

Step 6.1 should include visual specs from `preschool-details.svg`:

- Back navigation: "← Alla förskolor" ("← All Preschools") header bar (same white header style) — the link text names the navigation _destination_, not the current page
- Name: `text-2xl font-bold`
- Metadata: Line items with emoji/icon prefixes (📍 address, 🏢 operator type, 📅 survey year), `text-sm text-gray-600`
- Action buttons row:
  - "✓ In Compare" — filled blue button (`bg-primary-600 text-white rounded-lg`)
  - "+ Add to Shortlist" — outlined button (`border border-gray-300 rounded-lg`)
- Section heading: "Survey Results" `text-lg font-bold` with "Helhetsbedömning" subtitle in gray

Step 6.2 should include per-question card styling:

- White card with `rounded-xl border` and padding
- Question text in bold, with English translation subtitle in gray
- Stacked bar chart inside the card (horizontal, 3-segment simplified view: green=agree, yellow=neutral, red=disagree)
- Dot legend below the bar chart showing percentages per category

#### Step 7: Comparison Page

Step 7.2 should include visual specs from `comparison-view.svg`:

- Back arrow + "Compare (N)" header
- Sticky column header: Two-column layout with preschool name (bold), operator type (gray), and "+ Shortlist" button per column
- Blue summary banner: `bg-blue-50 border border-blue-200 rounded-lg` with bold heading and blue text for the deterministic comparison summary
- Per-question sections: Question text as section heading, two-column card below with:
  - Large percentage number (color-coded green/yellow)
  - "Agree" label in gray
  - Horizontal progress bar (colored fill on gray track)
- Column divider: Vertical `border-l` between columns

Step 7.4 (mobile responsiveness) should reference the 375px mockup dimensions directly.

#### Step 8: Charts

Already has visual specifications. Add:

- The detail page mockup shows a simplified 3-segment bar (agree/neutral/disagree) rather than the full 5-segment bar specified in Step 8.1. Clarify whether the detail page uses the simplified 3-segment view while the comparison page uses the full 5-segment view, or if both use the same style.
- Legend styling: Dot-label pairs (small colored circle + text) as shown in `preschool-details.svg`

#### Steps 9–13

- Step 9 (summaries): Blue info banner styling from `comparison-view.svg`
- Step 10 (attribution): Muted text + blue link style matching footer (already covered by Phase A.4)
- Step 11 (accessibility): No styling additions needed — already about auditing
- Steps 12–13: No styling additions needed

### How to apply these updates

Create a Memory Bank task file `docs/memory-bank/tasks/TASKXXX-design-foundations.md` (next available ID) and update `docs/memory-bank/tasks/_index.md` to track this work. The task covers both Phase A implementation and the implementation plan update. Specifically:

1. Add a new **Step 3.5 — Design Foundations** between Steps 3.4 and 4.1 in `docs/implementation-plan.md`, containing Phase A from this plan (theme tokens, shell styling, base interactive styles). This makes the design system setup an explicit, trackable step.
2. For each step in Steps 4–8, append a "**Visual design**" subsection to the existing task description referencing the specific mockup file and enumerating the styling requirements listed above.
3. Add a note at the top of Step 4 that all component styling should be implemented alongside functionality (not deferred), since the mockups provide complete visual specifications.

---

## Summary

| Phase               | What                                                            | When                     | Effort             |
| ------------------- | --------------------------------------------------------------- | ------------------------ | ------------------ |
| **A** (this plan)   | Design tokens + shell component styling                         | Now, before Step 4       | Small (~1 session) |
| **B** (plan update) | Embed mockup visual specs into Steps 4–8 of implementation plan | Now or alongside Phase A | Documentation only |
