import type { SearchablePreschool } from '@/features/search/search'

type KeyboardAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'select'; result: SearchablePreschool }
  | { type: 'close' }
  | { type: 'none' }

export const resolveKeyboardAction = (
  key: string,
  results: SearchablePreschool[],
  activeIndex: number,
): KeyboardAction => {
  switch (key) {
    case 'ArrowDown':
      return results.length > 0 ? { type: 'next' } : { type: 'none' }
    case 'ArrowUp':
      return results.length > 0 ? { type: 'prev' } : { type: 'none' }
    case 'Enter':
      return activeIndex >= 0 && activeIndex < results.length
        ? { type: 'select', result: results[activeIndex] }
        : { type: 'none' }
    case 'Escape':
      return { type: 'close' }
    default:
      return { type: 'none' }
  }
}

export const nextIndex = (current: number, length: number): number =>
  current < length - 1 ? current + 1 : 0

export const prevIndex = (current: number, length: number): number =>
  current > 0 ? current - 1 : length - 1
