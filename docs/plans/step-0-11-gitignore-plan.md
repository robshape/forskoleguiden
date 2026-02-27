# Plan: Step 0.11 Gitignore Verification

This plan validates and finalizes Step 0.11 by ensuring required ignore rules exist for this macOS Astro workspace, then proving via git checks that ignored build/dependency directories do not appear as untracked.

## Phases

1. **Phase 1: Baseline Ignore Verification**
   - **Objective**: Confirm current `.gitignore` behavior against Step 0.11 requirements before making changes.
   - **Files/Functions to Modify/Create**: [`.gitignore`](../../.gitignore) (read-only in this phase).
   - **Tests to Write**: No file-based tests; use command-based verification checks.
   - **Steps**:
     1. Run `git status --short --untracked-files=all` as the baseline red/green check for untracked ignored directories.
     2. Run `git check-ignore -v node_modules/ dist/ .astro/ .DS_Store` to verify ignore rule sources.
     3. Record observed results for review.

2. **Phase 2: Minimal `.gitignore` Adjustment (If Needed)**
   - **Objective**: Add only missing required entries for this macOS Astro project scope.
   - **Files/Functions to Modify/Create**: [`.gitignore`](../../.gitignore) only if any required rule is missing.
   - **Tests to Write**: No unit tests; command-based validation after edit.
   - **Steps**:
     1. Write a minimal edit to `.gitignore` only if required entries are absent.
     2. Re-run `git check-ignore -v` for required paths.
     3. Confirm no unintended ignore changes were introduced.

3. **Phase 3: Acceptance Verification for Step 0.11**
   - **Objective**: Prove Step 0.11 acceptance criteria is satisfied exactly.
   - **Files/Functions to Modify/Create**: None expected.
   - **Tests to Write**: No unit tests; final acceptance command check.
   - **Steps**:
     1. Run `git status` as specified by Step 0.11.
     2. Verify ignored directories (`node_modules/`, `dist/`, `.astro/`) do not appear as untracked.
     3. Produce a concise completion summary.

## Open Questions

1. None. Scope fixed to macOS OS files and current Astro project needs.
