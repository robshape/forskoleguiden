# Data Directory

## Files

### `template.json`

Human-reference template showing the expected shape of preschool survey JSON files. Each preschool in `data/malmo/2025/` follows this structure. The TypeScript interfaces in `src/lib/types.ts` are the source of truth for the data schema — `template.json` is not programmatically validated against in code.

### `example.pdf`

An example of the original preschool survey PDF published by Malmö stad. This is the source format that preschool data arrives in before being converted to JSON.

**Current use:** Reference for understanding the raw data structure when manually creating JSON files from survey results.

**Future use:** Input for the automated PDF-to-JSON conversion pipeline planned in Phase 4 (post-MVP). See `docs/tech-stack.md` → "Key constraints and trade-offs" → "No PDF parsing in browser".

### `malmo/`

Contains:

- `index.json` — Directory index of all preschools (name, address, ID, operator type). **Entries are sorted alphabetically by `id`.**
- `2025/*.json` — Per-preschool survey data files following `template.json` schema
