# Tech Context

For full rationale behind each technology choice, see `docs/tech-stack.md`. This file records setup details and conventions that aren't obvious from the code alone.

## Runtime Stack

- **Astro 5.17.1** — static output mode, `base: '/forskoleguiden'` for GitHub Pages project-site deployment, i18n routing (`sv`/`en`/`ar`, all prefix-routed), `@astrojs/preact` + `@astrojs/sitemap` integrations.
- **Preact 10.28.4** — interactive islands via `client:load`/`client:visible`/`client:idle`.
- **nanostores 1.1.1** + `@nanostores/preact 1.0.0` — cross-island state persisted via `sessionStorage`.
- **lz-string 1.5.0** — URL-safe compression for shareable state links.

## Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`). Theme customization via CSS `@theme` blocks in `src/styles/global.css`. Single `@import 'tailwindcss'` entry point.

## TypeScript

- `astro/tsconfigs/strict` base. Path aliases: `@/*` → `./src/*`, `@data/*` → `./data/*` (mirrored in `vitest.config.ts`).

## Quality Tooling

- **ESLint 10.0.2** — flat config (`eslint.config.js`). Uses `@eslint/compat` `includeIgnoreFile()` to read `.gitignore` for ignore patterns. `@typescript-eslint` recommended rules enabled. `eslint-plugin-astro` flat/recommended config.
- **Prettier 3.8.1** — with `prettier-plugin-astro`. Single quotes, no semicolons. Prettier 3.0+ reads `.gitignore` automatically (no `.prettierignore` needed). JSONC trailing comma override in `.prettierrc`.
- **markdownlint-cli2 0.21.0** — globs configured in `.markdownlint-cli2.jsonc`. MD013/line-length disabled.
- **Vitest 4.0.18** — unit tests in `tests/unit/`, node environment. Uses same path aliases as `tsconfig.json`.
- **Playwright 1.58.2** — e2e tests in `tests/e2e/`. Config auto-starts `pnpm preview` as webserver on port 4321. `@axe-core/playwright` for accessibility auditing.

## Package Management

- **pnpm** required (enforced via `engines` in `package.json`).
- All dependencies pinned to exact versions (no `^` or `~`).

## Editor

- Recommended VS Code extensions: `astro-build.astro-vscode`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`.

## Deployment

- **GitHub Pages** — static `dist/` folder deployed via GitHub Actions. Site URL: `https://robshape.github.io/forskoleguiden`.
- **CI/CD workflow**: `.github/workflows/deploy.yml` triggers on push to `main`. Pipeline: checkout → pnpm install → lint + lint:md + format:check → type check (`pnpm check`) → unit tests → build → Playwright e2e → upload artifact → deploy to GitHub Pages. Node 22.14.0 and pnpm 10.29.3 pinned to exact semver. Build job capped at 15 min timeout.
- Uses official GitHub Actions: `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4` (with pnpm cache), `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
- All authentication uses `GITHUB_TOKEN` (GitHub Bot) — no PAT required.

## Key Constraints

- Zero JS by default (Astro). Only Preact islands add JS (~3-5 KB total).
- No external APIs at runtime — no map tiles, no analytics, no chart CDNs.
- No runtime data fetching — all data read from `data/` at Astro build time.
- Shortlist limited to 5 preschools (matches Malmö municipality application).
- URL share links must stay under ~2,000 chars.
