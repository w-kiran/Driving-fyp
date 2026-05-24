import { useState, useMemo } from 'react'

type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: string
  direction: SortDirection
}

/**
 * Get a nested value from an object using dot notation.
 * Example: getNestedValue(booking, 'student.user.name') => booking.student?.user?.name
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc === null || acc === undefined) return undefined
    return (acc as Record<string, unknown>)[part]
  }, obj)
}

/**
 * Reusable hook for client-side table sorting.
 *
 * @param data - The array of items to sort
 * @param defaultKey - Default sort key
 * @param defaultDirection - Default sort direction
 * @returns sorted data, current sort config, and a requestSort function
 *
 * Usage:
 *   const { sortedData, sortConfig, requestSort } = useSort(bookings, 'id', 'asc')
 *   <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
 */
export function useSort<T>(data: T[], defaultKey: string, defaultDirection: SortDirection = 'asc') {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: defaultKey,
    direction: defaultDirection,
  })

  const requestSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = getNestedValue(a, sortConfig.key)
      const bVal = getNestedValue(b, sortConfig.key)

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal)
        return sortConfig.direction === 'asc' ? cmp : -cmp
      }

      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const cmp = aVal - bVal
        return sortConfig.direction === 'asc' ? cmp : -cmp
      }

      // Date comparison (Date objects or date strings)
      const aDate = aVal instanceof Date ? aVal.getTime() : new Date(String(aVal)).getTime()
      const bDate = bVal instanceof Date ? bVal.getTime() : new Date(String(bVal)).getTime()
      if (!isNaN(aDate) && !isNaN(bDate)) {
        const cmp = aDate - bDate
        return sortConfig.direction === 'asc' ? cmp : -cmp
      }

      // Fallback: string comparison
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [data, sortConfig])

  return { sortedData, sortConfig, requestSort }
}
