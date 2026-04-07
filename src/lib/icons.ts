// Shared SVG icon `d` paths.
// Naming: {SHAPE}_{SIZE}_{STYLE}_PATH — e.g. CHECK_16_FILL_PATH.
// 16×16 icons use viewBox="0 0 16 16".
// 24×24 icons use viewBox="0 0 24 24".

// --- 16×16 fill icons (viewBox 0 0 16 16, fill="currentColor") ---

export const CHECK_16_FILL_PATH =
  'M13.707 4.293a1 1 0 0 1 0 1.414l-6.75 6.75a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 0 1 1.414-1.414l2.543 2.543 6.043-6.043a1 1 0 0 1 1.414 0Z'

export const CHEVRON_DOWN_16_FILL_PATH =
  'M4.47 6.22a.75.75 0 0 1 1.06.03L8 8.94l2.47-2.69a.75.75 0 1 1 1.1 1.02l-3.02 3.28a.75.75 0 0 1-1.1 0L4.44 7.27a.75.75 0 0 1 .03-1.05Z'

export const LOCK_16_FILL_PATH =
  'M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z'

// --- 16×16 stroke icons (viewBox 0 0 16 16, stroke="currentColor") ---

export const CHECK_16_STROKE_PATH = 'M3 8.5 6.5 12 13 5.5'

export const PLUS_16_STROKE_PATH = 'M8 3v10M3 8h10'

// --- 24×24 stroke icons (viewBox 0 0 24 24, stroke="currentColor") ---

export const CLOSE_24_STROKE_PATH = 'M18 6 6 18M6 6l12 12'

// Search icon uses two shapes (circle + line) — requires paired constants.
export const SEARCH_24_STROKE_CIRCLE = { cx: 11, cy: 11, r: 8 }
export const SEARCH_24_STROKE_PATH = 'm21 21-4.3-4.3'

export const CHECK_24_STROKE_PATH = 'M5 13l4 4L19 7'

export const WARNING_24_STROKE_PATH =
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
