import { useState, useEffect } from 'react'

/**
 * Returns a debounced version of the provided value.
 * The debounced value only updates after the specified delay
 * has elapsed since the last change to `value`.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 *
 * Usage:
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search, 300)
 *   // use debouncedSearch for filtering/API calls
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
