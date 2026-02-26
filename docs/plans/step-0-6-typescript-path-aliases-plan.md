# Plan: Step 0.6 TypeScript path aliases

Confirm Step 0.6 is fully satisfied by verifying alias behavior end-to-end and only changing files if a gap is found. This keeps scope minimal and aligned with the implementation plan.

## Phases

1. **Phase 1: Baseline alias verification (red check)**
   - **Objective**: Prove current alias behavior matches Step 0.6 expectations.
   - **Files/Functions to Modify/Create**: Temporary probe file for alias verification. No permanent source changes expected.
   - **Tests to Write**: Temporary alias-resolution probe via Astro type-check command.
   - **Steps**:
     1. Create a temporary TypeScript probe importing from `@/lib/types`.
     2. Run `pnpm astro check` to capture current resolution behavior.
     3. Confirm the observed error is target-missing (acceptable for this step) instead of alias-config-invalid.

2. **Phase 2: Minimal config correction if needed (green check)**
   - **Objective**: Ensure aliases exactly match Step 0.6 requirements.
   - **Files/Functions to Modify/Create**: `tsconfig.json` only if mismatch is found.
   - **Tests to Write**: Re-run alias probe check after any config fix.
   - **Steps**:
     1. Compare current compiler path mapping against required aliases.
     2. Apply minimal `tsconfig.json` edit only if required.
     3. Re-run `pnpm astro check` and confirm expected behavior.

3. **Phase 3: Cleanup and completion evidence**
   - **Objective**: Leave repository clean and provide clear completion evidence.
   - **Files/Functions to Modify/Create**: Remove temporary probe file and create one Step 0.6 validation artifact.
   - **Tests to Write**: Final Astro check sanity run after cleanup.
   - **Steps**:
     1. Delete the temporary probe file.
     2. Run final sanity check to ensure no residue.
     3. Add a Step 0.6 validation note in `docs/plans/` with observed outcomes.

## Open Questions

1. Resolved (2026-02-26): Yes. If all aliases are already correct, Phase 2 is marked complete with no `tsconfig.json` code changes.
