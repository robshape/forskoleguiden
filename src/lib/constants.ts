export const MALMO_SOURCE_URL =
  'https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten.html'

export const SURVEY_YEAR = 2025

// Agree-share percentage thresholds for score badge color tiers.
// ≥ HIGH  → green (strong positive sentiment)
// ≥ MEDIUM → amber (moderate sentiment)
// < MEDIUM → gray  (low sentiment)
export const SCORE_TIER_HIGH = 80
export const SCORE_TIER_MEDIUM = 65

// The upstream data pipeline encodes "no survey data collected" as -1 across all
// percentage fields rather than using null. This mirrors the raw municipality
// export format where every field is always present as a number.
export const PLACEHOLDER_RESPONDENTS = -1

// Assumes process.cwd() is the project root — valid for Astro build and Vitest.
export const MALMO_DATA_DIR = 'data/malmo'

// City identifier used in the share payload. Mirrors the city field in data/malmo/index.json.
export const SHARE_CITY = 'Malmö'
