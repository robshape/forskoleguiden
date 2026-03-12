# System Patterns

## Architecture

Static Astro MPA with selective Preact islands for interactivity. Zero JS by default; islands hydrate only where needed. The current shipped islands are the directory sort toggle, the per-card compare button, the global compare tray, and the comparison view (which includes BarChart sub-components for accessible SVG charts). Data flows from repository JSON at build time into pre-rendered pages. Client-side shared state is handled with nanostores.

For the full architectural overview, module boundaries, and data-flow rationale, see `docs/tech-stack.md`. Product constraints and behavior requirements are in `docs/prd.md`.

## Detailed Patterns

All architectural patterns, conventions, and implementation details are documented in `.github/copilot-instructions.md` — the single source of truth for LLM agents working on this codebase. Patterns covered there include:

- SessionStorage-backed nanostore state and persistence
- Global compare tray mount pattern
- Data loading and static route patterns
- ComparisonView build-time data + client filter pattern
- Scoring / null-return pattern
- Testing philosophy (KCD alignment)
- Infrastructure regression guards
- Shell composition boundaries
- CI workflow patterns (reusable quality-gates, narrow WebKit regression)
- Base path, i18n, and island string interpolation patterns
