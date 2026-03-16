# Tech Context

For full rationale behind each technology choice, see `docs/tech-stack.md`. This file records setup details and conventions that aren't obvious from the code alone.

## Runtime Stack

- **Astro 5.18.0** — static output mode, `base: '/forskoleguiden'` for GitHub Pages project-site deployment, i18n routing (`sv`/`en`/`ar`, all prefix-routed), `@astrojs/preact` integration.
- **Preact 10.28.4** — interactive islands via `client:load`/`client:visible`/`client:idle`.
- **nanostores 1.1.1** + `@nanostores/preact 1.0.0` — cross-island state persisted via `sessionStorage`.

## Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`). Theme customization via CSS `@theme` blocks in `src/styles/global.css`. Single `@import 'tailwindcss'` entry point.

## TypeScript

- `astro/tsconfigs/strict` base. Path aliases: `@/*` → `./src/*`, `@data/*` → `./data/*` (mirrored in `vitest.config.ts`).

## Quality Tooling

- **ESLint 10.0.2** — flat config (`eslint.config.js`). Uses `@eslint/compat` `includeIgnoreFile()` to read `.gitignore` for ignore patterns. `@typescript-eslint` recommended rules enabled. `eslint-plugin-astro` flat/recommended config. `eslint-plugin-better-tailwindcss` 4.3.2 validates Tailwind v4 class usage (ordering via `enforce-consistent-class-order`, canonical form via `enforce-canonical-classes`, unknown class detection via `no-unknown-classes`; `enforce-consistent-line-wrapping` disabled to avoid conflicts with Prettier). Configured with `entryPoint: 'src/styles/global.css'` for Tailwind v4 theme resolution.
- **Prettier 3.8.1** — with `prettier-plugin-astro`. Single quotes, no semicolons. Prettier 3.0+ reads `.gitignore` automatically (no `.prettierignore` needed). JSONC trailing comma override in `.prettierrc`.
- **markdownlint-cli2 0.21.0** — globs configured in `.markdownlint-cli2.jsonc`. MD013/line-length disabled.
- **Vitest 4.0.18** — unit tests in `tests/unit/`, node environment. Uses same path aliases as `tsconfig.json`.
- **Playwright 1.58.2** — e2e tests in `tests/e2e/`. Config auto-starts `pnpm preview` as webserver on port 4321. `@axe-core/playwright` for accessibility auditing.
- **Husky 9.1.7** — git hook runner. Installed as a `devDependency` with a `prepare` script so `husky` runs automatically on `pnpm install`. The committed `.husky/pre-commit` hook runs `lint-staged` (`astro check` + ESLint on TS/Astro files, markdownlint on Markdown, Prettier on all files); full `pnpm validate` runs in CI only. CI install steps in `quality-gates.yml` and `deploy.yml` set `HUSKY: 0` to skip hook installation. Contract verified by `tests/unit/infrastructure-husky-pre-commit-contract.test.ts` (8 tests), including step-scoped assertions for the `Install dependencies` block.

## Package Management

- **pnpm** required (enforced via `engines` in `package.json`).
- All dependencies pinned to exact versions (no `^` or `~`).

### Supply-Chain Security

- **`minimumReleaseAge: 4320`** (3 days) in `pnpm-workspace.yaml` — pnpm refuses to install any package version published less than 3 days ago, mitigating supply-chain attacks via freshly-published malicious versions.
- **Dependabot** (`.github/dependabot.yml`) — weekly automated PRs for both npm (pnpm) dependencies and GitHub Actions versions. PRs are grouped by ecosystem with commit-message prefixes (`deps:` for npm, `ci:` for Actions).
- **Interaction**: Dependabot may propose a version that is still within the 3-day quarantine window. In that case, `pnpm install` in CI will fail — this is expected security behavior. The PR can be merged once the package ages past the threshold, or the minimum release age can be temporarily overridden if the update is urgent and verified.

## Editor

- Recommended VS Code extensions: `astro-build.astro-vscode`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`.

## Deployment

- **GitHub Pages** — static `dist/` folder deployed via GitHub Actions. Site URL: `https://robshape.github.io/forskoleguiden`.
- **Reusable quality-gates workflow**: `.github/workflows/quality-gates.yml` is a `workflow_call` workflow containing all quality gate steps: checkout, pnpm/node setup, install, lint, lint:md, format, check, test, build, Playwright browser install, Chromium e2e, and the narrow WebKit Step 7.4 mobile regression. Takes no inputs — pure validation only. Both `deploy.yml` and `dependabot.yml` consume this reusable workflow. Chosen over a composite action because Dependabot's `github-actions` ecosystem only scans `.github/workflows/*.yml` for action version updates.
- **Deploy workflow**: `.github/workflows/deploy.yml` triggers on push to `main`. Calls `quality-gates.yml`, then a separate build job (gated on quality-gates passing) rebuilds, uploads the Pages artifact, and a deploy job deploys to GitHub Pages. Node 22.14.0 and pnpm 10.29.3 pinned to exact semver.
- Uses official GitHub Actions (pinned to exact semver): `actions/checkout@v6.0.2`, `pnpm/action-setup@v4.2.0`, `actions/setup-node@v6.3.0` (with pnpm cache), `actions/configure-pages@v5.0.0`, `actions/upload-pages-artifact@v4.0.0`, `actions/deploy-pages@v4.0.5`.
- All authentication uses `GITHUB_TOKEN` (GitHub Bot) — no PAT required.
- **Dependabot auto-merge workflow**: `.github/workflows/dependabot.yml` triggers on `pull_request` (Dependabot PRs) and `push` to `main`. Calls `quality-gates.yml` on Dependabot PRs, then auto-approves and enables squash auto-merge. On push to `main`, updates open Dependabot PR branches via `gh pr update-branch`. Uses `GITHUB_TOKEN` only. Requires "Allow auto-merge" enabled in repo settings.

## Key Constraints

- Zero JS by default (Astro). Only Preact islands add JS (~3-5 KB total).
- No external APIs at runtime — no map tiles, no analytics, no chart CDNs.
- No runtime data fetching — all data read from `data/` at Astro build time.
- Shortlist limited to 5 preschools (matches Malmö municipality application).
- URL share links must stay under ~2,000 chars.
