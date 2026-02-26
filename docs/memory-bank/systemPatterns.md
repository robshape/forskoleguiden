# System Patterns

The core system pattern is a static Astro multi-page site with selective Preact islands for interactivity, keeping default JavaScript near zero while enabling compare tray, shortlist, and chart behavior where needed. Data flows from repository JSON at build time into pre-rendered pages, then client-side shared state is handled with nanostores and URL-state compression for share links.

Architecture in this file is intentionally baseline-only for Step 0.0. For the complete architectural structure, module boundaries, and data-flow rationale, see `docs/tech-stack.md`, with product constraints and behavior requirements in `docs/prd.md`.
