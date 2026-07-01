import { useCallback, useEffect, useState } from 'react'

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

/**
 * Reusable hook for server-side table sorting.
 *
 * Manages sort state and triggers a fetch callback whenever the sort changes.
 * The parent provides a `fetchFn` that dispatches a Redux thunk with sort params.
 *
 * @param fetchFn - Callback invoked with (sortBy, sortOrder) when sort changes
 * @param defaultKey   - Default sort key (e.g. "id")
 * @param defaultDirection - Default sort direction
 *
 * Usage:
 *   const { sortConfig, requestSort } = useServerSort(
 *     (sortBy, sortOrder) => dispatch(fetchBookings({ sortBy, sortOrder })),
 *     'id', 'desc'
 *   )
 *   <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
 */
export function useServerSort(
  fetchFn: (sortBy: string, sortOrder: 'asc' | 'desc') => void,
  defaultKey: string,
  defaultDirection: 'asc' | 'desc' = 'asc',
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: defaultKey,
    direction: defaultDirection,
  })

  // Fetch whenever fetchFn changes (covers mount + search + other deps inside fetchFn)
  useEffect(() => {
    fetchFn(defaultKey, defaultDirection)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn])

  const requestSort = useCallback(
    (key: string) => {
      setSortConfig((prev) => {
        const direction: 'asc' | 'desc' =
          prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        fetchFn(key, direction)
        return { key, direction }
      })
    },
    [fetchFn],
  )

  return { sortConfig, requestSort }
}
