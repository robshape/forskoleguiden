# Step 1.5 — Phase 1 Red-State Proof

Date: 2026-03-01

## Scope

- Applies to Phase 1 only: `computeAgreeShare`.

## Red Command

```bash
pnpm test tests/unit/scoring.test.ts
```

## Red Output Snippet

```text
FAIL  tests/unit/scoring.test.ts [ tests/unit/scoring.test.ts ]
Error: Cannot find package '@/lib/scoring' imported from '/Users/shapelessab/Developer/shapeless-gh/forskoleguiden/tests/unit/scoring.test.ts'
❯ tests/unit/scoring.test.ts:3:1
```

## Green Command

```bash
pnpm test tests/unit/scoring.test.ts
```

## Green Output Snippet

```text
✓ tests/unit/scoring.test.ts (1 test)
✓ Step 1.5 scoring utility (1)
  ✓ computeAgreeShare returns 85 from 60 + 25

Test Files  1 passed (1)
Tests       1 passed (1)
```

## Outcome

- Red run exited with code `1`.
- Green run passed with `1` test file and `1` test.
- Phase 2 (`computeOverallScore`) is not part of this Phase 1 red/green proof.
