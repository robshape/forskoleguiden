# System Patterns

## Architecture

Static Astro MPA with selective Preact islands for interactivity. Zero JS by default; islands hydrate only where needed (compare tray, shortlist, charts). Data flows from repository JSON at build time into pre-rendered pages. Client-side shared state is handled with nanostores and URL-state compression (lz-string) for share links.

For the full architectural overview, module boundaries, and data-flow rationale, see `docs/tech-stack.md`. Product constraints and behavior requirements are in `docs/prd.md`.

## Data Loading Pattern

`src/lib/data.ts` uses a `readJsonFile<T>(filePath, context)` generic helper that:

1. Reads a JSON file synchronously from disk (valid for Astro build-time and Vitest).
2. Wraps errors with contextual messages (e.g., "Failed to load Malmö preschool survey for id X").
3. Casts the parsed result via `as T` — no runtime schema validation (data is trusted static repo input).

All data paths resolve from `process.cwd()`, which is the project root in both Astro build and Vitest contexts.

## Scoring / Null-Return Pattern

`src/lib/scoring.ts` returns `null` from `computeOverallScore()` when the `Helhetsbedömning` question group is missing or present-but-empty. Downstream consumers sort `null` scores to the bottom via `byOverallScoreDesc()`. Dev-only `console.warn` fires for invalid response percentages (out-of-range or sums ≠ 100 ± 1).

## Shared Test Helper Pattern

Test utilities live in `tests/unit/helpers/`:

- `malmo-data.ts` — resolves file paths to index/survey JSON for test assertions.
- `survey-assertions.ts` — exports `assertResponseShape` (basic 5-key shape check) and `assertResponseContract` (shape + range 0..100 + sum ~100 ± 1). All survey-data test files import from here rather than duplicating key lists.

## Infrastructure Regression Guards

Critical infrastructure invariants are tested as unit tests rather than relying on manual checks:

- `tests/unit/gitignore.test.ts` — verifies `.gitignore` covers required paths (`node_modules/`, `dist/`, `.astro/`, `.DS_Store`, `test-results/`) using `git check-ignore`.

## Code Organization

- **By feature** (`src/features/`) for application modules — not yet populated (Step 2+ work).
- **`src/lib/`** for shared utilities: types, data loading, scoring.
- **`src/pages/`** for Astro file-based routing with locale prefixes.
- **`tests/unit/helpers/`** for shared test utilities.
- **`data/`** for static JSON; `data/malmo/index.json` is the directory, `data/malmo/2025/*.json` are per-preschool survey files.
