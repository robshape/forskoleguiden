# Phase 1 Complete: Add failing infrastructure regression coverage

Added a single infrastructure regression test file that defines the full Husky pre-commit contract without implementing it yet. The targeted Vitest run is intentionally red, proving the repo currently lacks the pinned Husky dependency, prepare script, pre-commit hook, and CI opt-out env wiring.

**Files created/changed**:

- tests/unit/infrastructure-husky-pre-commit-contract.test.ts

**Functions created/changed**:

- None

**Tests created/changed**:

- should have a pinned husky devDependency in package.json
- should have a prepare script set to "husky" in package.json
- should have a .husky/pre-commit hook that runs pnpm validate
- should disable Husky via HUSKY=0 env in the quality-gates.yml install step
- should disable Husky via HUSKY=0 env in the deploy.yml install step

**Review Status**: APPROVED

**Git Commit Message**: test: add Husky pre-commit guard
