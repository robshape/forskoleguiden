# Plan: Step 0.2 Core Dependencies

Install and verify the MVP production dependencies required for Astro + Preact islands, nanostores state, URL state compression, and sitemap generation. The work is split into install, verification, and documentation synchronization so the repository state is explicit and reproducible.

## Phases

1. **Phase 1: Install pinned production dependencies**
    - **Objective**: Add the Step 0.2 production packages with Astro-5-compatible pinned major ranges to avoid peer drift.
    - **Files/Functions to Modify/Create**: `package.json`, `pnpm-lock.yaml`
    - **Tests to Write**: None (dependency installation step). Validation is command-based.
    - **Steps**:
        1. Run a single `pnpm add` command for `@astrojs/preact`, `preact`, `@nanostores/preact`, `nanostores`, `lz-string`, and `@astrojs/sitemap` with pinned major ranges.
        2. Confirm dependency entries are written to `package.json` and lockfile changes are generated.
        3. Capture installation output for peer dependency compatibility checks.

2. **Phase 2: Verify dependency graph and acceptance criteria**
    - **Objective**: Validate that all required packages are installed and no Astro/Preact peer warnings remain.
    - **Files/Functions to Modify/Create**: No intended file edits.
    - **Tests to Write**: None (verification command only).
    - **Steps**:
        1. Run `pnpm ls --depth 0`.
        2. Verify all Step 0.2 packages are present in the top-level dependency list.
        3. Confirm output has no peer dependency warnings for Astro or Preact.

3. **Phase 3: Synchronize project memory and status**
    - **Objective**: Update memory-bank tracking to reflect Step 0.2 completion and set the next immediate step.
    - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`
    - **Tests to Write**: None.
    - **Steps**:
        1. Update active context with Step 0.2 completion details and Step 0.3 as next focus.
        2. Update progress status to mark Step 0.2 completed.
        3. Ensure wording remains concise and aligned with existing memory-bank tone.

## Open Questions

1. Should Astro integration packages be pinned to currently compatible majors (`@astrojs/preact` 4.x and `@astrojs/sitemap` 3.x) to prevent future major drift? (User preference: pin)
