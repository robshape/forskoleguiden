# Step 1.4 — Phase 1 Red-State Proof

Date: 2026-03-01

## Command

```bash
pnpm test tests/unit/data.test.ts
```

## Failing Output Snippet

```text
FAIL  tests/unit/data.test.ts [ tests/unit/data.test.ts ]
Error: Cannot find package '@/lib/data' imported from '/Users/shapelessab/Developer/shapeless-gh/forskoleguiden/tests/unit/data.test.ts'
❯ tests/unit/data.test.ts:3:1
```

## Outcome

- Command exited with code `1`.
- Failure is due to unresolved `@/lib/data` import (expected red state for TDD).
