# Tech Stack: Förskoleguiden

> Version 0.2 — 2026-02-26

## Decision summary

| Layer | Choice | Why |
| - | - | - |
| Meta-framework | **Astro** (static output) | Content-first, ships zero JS by default, built-in i18n routing, top Lighthouse scores, islands architecture for opt-in interactivity |
| Interactive UI | **Preact** (via `@astrojs/preact`) | ~3 KB runtime, React-compatible API, perfect for mobile perf targets |
| Cross-island state | **nanostores** (`@nanostores/preact`) | Tiny (~0.5 KB), framework-agnostic, first-class Astro support — used for compare tray, shortlist, and language state shared across islands |
| Language | **TypeScript** (strict) | Type-safe data models for preschool JSON; catches shape mismatches at build time |
| Styling | **Tailwind CSS v4** (`@astrojs/tailwind`) | Utility-first, mobile-first by design, built-in RTL support (`rtl:` variant for Arabic), flat explicit classes with no cascading side effects |
| i18n — routing | **Astro built-in i18n** | File-based locale routing (`/sv/`, `/en/`, `/ar/`), default locale prefix optional, `getRelativeLocaleUrl()` helpers |
| i18n — strings | **Hand-rolled `t()` + JSON files** | One JSON file per locale (`sv.json`, `en.json`, `ar.json`), a tiny `t(key)` helper. Zero dependencies, trivially debuggable. If the project outgrows this, Paraglide JS is the upgrade path |
| Charts | **Preact SVG components** (runtime-rendered) | Preact island components render `<svg>` elements at hydration time. Full control over ARIA attributes, pattern fills, and non-color encoding. Static `<table>` fallback rendered by Astro for no-JS. No chart library dependency. Upgrade path: Chart.js post-MVP if visualization scope grows |
| URL state encoding | **lz-string** | Compresses JSON payloads into URL-safe base64; ~5 KB, zero dependencies, widely used for stateful shareable URLs |
| Testing — unit | **Vitest** | Native ESM, fast, Astro-recommended, compatible with Preact/JSX |
| Testing — e2e / a11y | **Playwright** + **@axe-core/playwright** | Cross-browser e2e, built-in accessibility auditing equivalent to Lighthouse a11y checks |
| Linting & formatting | **ESLint** + **Prettier** + **eslint-plugin-astro** | Standard toolchain; astro plugin understands `.astro` files |
| Deployment | **GitHub Pages** | Zero additional service — deploys from the same repo. Free, HTTPS, global CDN via Fastly. No preview deploys, but trivial to upgrade to Cloudflare Pages or Netlify later if needed |
| Package manager | **pnpm** | Fast, disk-efficient, strict dependency resolution |

---

## Rationale for key decisions

### Why Astro over Next.js / SvelteKit

| Criterion | Astro | Next.js (static export) | SvelteKit (static adapter) |
| - | - | - | - |
| Default JS shipped | **0 KB** (opt-in islands) | Full React runtime (~40+ KB min) | Svelte runtime (~8 KB) |
| Built-in i18n routing | Yes (first-class) | Requires next-intl or similar | Manual |
| Static-only deployment | Native `output: 'static'` | `output: 'export'` works but loses some features | Static adapter works |
| Islands architecture | First-class | No (full hydration) | No |
| Ecosystem & docs | Large, well-documented | Very large | Smaller |
| Lighthouse perf score | Near-perfect out of the box | Good with effort | Good |

Förskoleguiden is a **content-first, read-heavy** site with **islands of interactivity** (compare tray, shortlist, charts). Astro's architecture is purpose-built for this pattern — static HTML pages with surgical hydration only where needed. This directly serves the PRD requirements for sub-second time-to-interactive on low-end mobile and zero runtime API dependencies.

### Why Preact over React / Solid / Svelte for islands

- **~3 KB** gzip vs React's ~40 KB — critical for mobile-first perf.
- React-compatible API — largest ecosystem of examples, documentation, and community answers for any component pattern we need.
- First-class Astro integration (`@astrojs/preact`), including `client:load`, `client:visible`, `client:idle` directives.
- nanostores has a dedicated Preact binding (`@nanostores/preact`), making cross-island state trivial.

### Why nanostores for state

The PRD requires state to persist across page navigations (compare tray, shortlist). In Astro's MPA model, each page is a full navigation. nanostores provides:

- Shared atoms/maps that all Preact islands can subscribe to.
- Persistence middleware to sync state with `sessionStorage` (survives navigation) and URL params (shareable links).
- ~0.5 KB gzip, framework-agnostic.

### Why Preact SVG components over Chart.js / D3

The PRD mandates:

- Non-color encodings (patterns/labels) for color-blind users.
- Table/text alternatives for every chart.
- Screen-reader accessible values.

For the MVP scope (only "Helhetsbedömning" — two questions, five response buckets each), the chart needs are simple stacked horizontal bars.

**How it works:**

1. The developer writes a reusable Preact component (e.g. `<BarChart>`) that returns `<svg>` markup with `<rect>`, `<pattern>`, `<text>`, and ARIA attributes.
2. Astro pages pass preschool JSON data as props to the component.
3. The component is hydrated client-side (`client:visible`) so it can support hover/focus interactions.
4. Alongside each chart, Astro statically renders an equivalent `<table>` as a no-JS / screen-reader fallback — this is always in the HTML, not hidden behind the chart.
5. The same component is reused for every preschool and question — write once, render many.

This approach gives full control over accessibility and semantic markup without a chart library. If post-MVP the scope expands to many question groups and complex visualizations, Chart.js can be introduced incrementally.

### Why Tailwind CSS v4 for styling

- Utility classes are flat and explicit — no implicit class hierarchies or cascading side effects. Each element's styles are fully visible in its markup.
- Built-in `rtl:` variant handles Arabic RTL layout without a separate RTL stylesheet.
- Mobile-first breakpoints (`sm:`, `md:`, `lg:`) align with the PRD's mobile-first requirement.
- Tailwind v4 uses CSS-native `@theme` config, reducing build tooling.

### Why GitHub Pages for deployment

- Zero additional service — integrated with the existing GitHub repo.
- Free, automatic HTTPS, global CDN via Fastly.
- No server runtime — aligns with static-only constraint.
- Simplest possible deploy: push to `main`, GitHub Actions builds, pages publishes.
- Trade-off accepted: no per-PR preview deploys. For a 1-person + LLM team, local preview is sufficient.
- Upgrade path: switch to Cloudflare Pages or Netlify later if preview deploys become valuable.

---

## Architecture overview

```text
forskoleguiden/
├── astro.config.ts          # Astro config: i18n, Preact, Tailwind, sitemap
├── tailwind.config.ts       # Tailwind theme (colors, spacing, RTL)
├── tsconfig.json
├── package.json
│
├── data/                    # Static preschool JSON files
│   ├── malmo/
│   │   ├── index.json       # Directory index: name, address, id, operator type
│   │   └── 2025/
│   │       ├── preschool-slug-1.json
│   │       ├── preschool-slug-2.json
│   │       └── ...
│   └── template.json        # Schema template
│
├── public/                  # Static assets (favicon, OG images)
│
├── src/
│   ├── components/          # Shared UI components
│   │   ├── astro/           # Static Astro components (layout, nav, footer)
│   │   └── preact/          # Interactive islands (CompareTray, ShortlistPanel, Chart)
│   │
│   ├── features/            # Feature-organized modules
│   │   ├── directory/       # Preschool list, sorting, filtering
│   │   ├── comparison/      # Side-by-side view, summary generation
│   │   ├── shortlist/       # Pick-five logic
│   │   └── sharing/         # URL encoding/decoding, mailto
│   │
│   ├── i18n/                # Translation files and helpers
│   │   ├── sv.json
│   │   ├── en.json
│   │   ├── ar.json
│   │   └── utils.ts         # t() helper, locale detection
│   │
│   ├── layouts/             # Astro layouts (BaseLayout, with RTL support)
│   │
│   ├── lib/                 # Shared utilities
│   │   ├── types.ts         # TypeScript interfaces for preschool data
│   │   ├── state.ts         # nanostores atoms (compare set, shortlist, locale)
│   │   └── url-state.ts     # lz-string encode/decode for shareable URLs
│   │
│   ├── pages/               # Astro file-based routing
│   │   ├── sv/              # Swedish routes (default locale)
│   │   ├── en/              # English routes
│   │   ├── ar/              # Arabic routes
│   │   └── index.astro      # Root redirect to /sv/
│   │
│   └── styles/              # Global styles, Tailwind base
│
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── e2e/                 # Playwright e2e + a11y tests
│
└── docs/
    ├── prd.md
    ├── tech-stack.md         # This file
    └── memory-bank/          # Project memory for LLM agents
```

---

## Data flow

```text
Static JSON files (data/malmo/2025/*.json)
        │
        ▼
Astro build reads JSON at build time
        │
        ▼
Pages are pre-rendered as static HTML + minimal JS islands
        │
        ▼
Deployed to GitHub Pages CDN
        │
        ▼
Browser loads static HTML instantly
        │
        ▼
Preact islands hydrate for interactivity (compare tray, charts, shortlist)
        │
        ▼
nanostores manage shared client state
        │
        ▼
URL state encoding (lz-string) enables shareable links
```

---

## Build output

Astro produces a `dist/` folder of **static files only** — no server, no runtime config.

- One HTML file per route (e.g. `dist/sv/index.html`, `dist/en/compare/index.html`, `dist/ar/index.html`).
- CSS is purged, minified, and inlined or linked per page by Vite.
- JS for Preact islands is tree-shaken, minified, and code-split into small bundles (~3-5 KB total for Preact + island code).
- The entire `dist/` folder is the deployable artifact — drop it on any static host.

This is **not** a single `index.html` file. The i18n routing (`/sv/`, `/en/`, `/ar/`) and multiple pages (directory, compare, shortlist) inherently produce multiple HTML files. However, each individual page is as lean as a hand-crafted HTML file — fully minified HTML, purged CSS, and only the JS needed for that page's islands.

---

## Data validation strategy

No runtime schema validation library (Zod, etc.) is needed for the MVP.

- **Preschool JSON files** are authored in the repo and read at build time. TypeScript interfaces validate their shape during development and build. If a file is malformed, the build fails.
- **URL state** (decoded from share links) is untrusted user input, but a simple `try/catch` + type guard is sufficient — the payload is a small array of preschool IDs, not a complex schema.
- **No external APIs** means no runtime data fetching from unknown sources.

If a post-MVP pipeline generates JSON automatically (PDF → JSON), adding Zod validation to that pipeline script would be appropriate. But it belongs in the build/pipeline tooling, not in the browser.

---

## Key constraints and trade-offs

| Constraint | Implication |
| - | - |
| Zero runtime API dependencies | No map tiles, no external chart APIs, no analytics services in MVP |
| Static-only deployment | All data baked at build time; adding a preschool requires a rebuild |
| Arabic RTL support | Tailwind `rtl:` variant + `dir="rtl"` on layout; charts and comparison tables need RTL testing |
| URL state size limits | lz-string + base64 keeps payloads small, but very long shortlists could hit URL length limits (~2,000 chars safe). With 5 preschool IDs this is well within bounds |
| No PDF parsing in browser | JSON data must be prepared offline (manual or post-MVP pipeline) |

---

## MVP dependency list

```json
{
  "dependencies": {
    "astro": "^5.x",
    "@astrojs/preact": "^4.x",
    "@astrojs/tailwind": "^6.x",
    "@astrojs/sitemap": "^3.x",
    "preact": "^10.x",
    "@nanostores/preact": "^0.x",
    "nanostores": "^0.x",
    "lz-string": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x",
    "vitest": "^3.x",
    "@playwright/test": "^1.x",
    "@axe-core/playwright": "^4.x",
    "eslint": "^9.x",
    "eslint-plugin-astro": "^1.x",
    "prettier": "^3.x",
    "prettier-plugin-astro": "^0.x"
  }
}
```

Total production dependencies: **7 packages** — all lightweight, well-maintained, and zero-backend.

---

## Alternatives considered but rejected

| Option | Reason for rejection |
| - | - |
| **Next.js** (static export) | Ships full React runtime (~40+ KB); over-engineered for a content-first static site; loses features in export mode |
| **SvelteKit** | Smaller ecosystem for charting/a11y; fewer community examples and documentation for accessibility patterns |
| **Vanilla JS (no framework)** | Possible for this scope, but loses i18n routing, component model, and build-time data loading — increasing maintenance burden |
| **Chart.js / D3** | Overkill for MVP (2 questions × 5 buckets); harder to make fully accessible; can be added post-MVP if needed |
| **React** (instead of Preact) | 10× larger runtime for identical API surface; no benefit for this project |
| **Cloudflare Pages / Netlify** | Better edge CDN and preview deploys, but adds another service to manage; upgrade path if needed |
| **Bun** (runtime/package manager) | Promising but less mature ecosystem support for Astro toolchain; pnpm is safer choice |
