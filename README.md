# Förskoleguiden

Förskoleguiden is a static, accessible comparison site for Malmö preschools using official 2025 survey data. The project is mobile-first, multilingual (Swedish default, then English and Arabic), and intentionally backend-free.

## Project status

- Current implementation focus follows `docs/implementation-plan.md`
- Product requirements are defined in `docs/prd.md`
- Technical architecture and tooling decisions are defined in `docs/tech-stack.md`
- Ongoing continuity and task context live in `docs/memory-bank/`

## Tech stack

- Astro (static output)
- TypeScript (strict)
- pnpm
- Planned next-step dependencies include Preact islands, nanostores, and sitemap support

## Available scripts

From project root:

- `pnpm install` — install dependencies
- `pnpm dev` — run local Astro dev server on `http://localhost:4321`
- `pnpm build` — build static output into `dist/`
- `pnpm preview` — preview production build locally

## Notes

- This repository uses phase-based implementation; not all planned scripts/tooling are added yet.
- The root `src/pages/index.astro` file is currently a temporary scaffold placeholder and will be replaced by i18n-aware redirect behavior during Step 3.4.
