import type { ScoreTier } from '@/lib/scoring'

// Tailwind CSS class mappings for score tier visual presentation.
// Consumed by PreschoolCard (badge) and ComparisonCard (score text).
// Keep in sync with design tokens in src/styles/global.css.

export const SCORE_TIER_BADGE_CLASS: Record<ScoreTier, string> = {
  high: 'bg-score-high-bg text-score-high-text',
  medium: 'bg-score-medium-bg text-score-medium-text',
  low: 'bg-gray-200 text-gray-800',
  none: 'bg-gray-100 text-gray-700',
}

export const SCORE_TIER_TEXT_CLASS: Record<ScoreTier, string> = {
  high: 'text-score-high-text',
  medium: 'text-score-medium-text',
  low: 'text-gray-700',
  none: 'text-gray-700',
}
