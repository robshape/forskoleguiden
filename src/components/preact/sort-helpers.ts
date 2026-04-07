export type SortMode = 'ranking' | 'alphabetical'

export interface ListRow {
  element: HTMLLIElement
  name: string
  rankIndexZeroBased: number
}

export const getRows = (listElement: HTMLUListElement): ListRow[] => {
  return Array.from(
    listElement.querySelectorAll<HTMLLIElement>(':scope > li'),
  ).map((rowElement, index) => ({
    element: rowElement,
    name: rowElement.getAttribute('data-name') ?? '',
    rankIndexZeroBased: Number(
      rowElement.getAttribute('data-rank-index-zero-based') ?? index,
    ),
  }))
}

export const sortRows = (
  rows: ListRow[],
  sortMode: SortMode,
  locale: string,
): ListRow[] => {
  return [...rows].sort((leftRow, rightRow) => {
    if (sortMode === 'ranking') {
      return leftRow.rankIndexZeroBased - rightRow.rankIndexZeroBased
    }

    const byName = leftRow.name.localeCompare(rightRow.name, locale, {
      sensitivity: 'base',
    })

    if (byName !== 0) {
      return byName
    }

    return leftRow.rankIndexZeroBased - rightRow.rankIndexZeroBased
  })
}

const updateRanks = (sortedRows: ListRow[]) => {
  sortedRows.forEach((row, index) => {
    const rankElement = row.element.querySelector('[data-testid="rank-index"]')

    if (rankElement !== null) {
      rankElement.textContent = String(index + 1)
    }
  })
}

// Reorders server-rendered list items in-place — the list is pre-rendered by
// Astro at build time and this island only changes their DOM order.
// ⚠️ This bypasses Preact's virtual DOM by calling appendChild() directly.
// It works in the current Astro MPA architecture but is incompatible with
// Astro View Transitions or any future VDOM-managed list rendering.
export const applySort = (
  listElement: HTMLUListElement,
  rows: ListRow[],
  sortMode: SortMode,
  locale: string,
) => {
  const sortedRows = sortRows(rows, sortMode, locale)

  sortedRows.forEach((row) => {
    listElement.appendChild(row.element)
  })

  updateRanks(sortedRows)
}
