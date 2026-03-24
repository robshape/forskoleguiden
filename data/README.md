# Data Directory

## Files

### `malmo/`

Contains:

- `index.json` — Directory index of all preschools (name, address, ID, operator type). **Entries are sorted alphabetically by `id`.**
  - `queueUrl` on independent preschool entries — placeholder URLs (`https://example.com/queue/{id}`). Replace with real queue registration URLs when available.
- `2025/*.json` — Per-preschool survey data files (see `src/lib/types.ts` for schema)
