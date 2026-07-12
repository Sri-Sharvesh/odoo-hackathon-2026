import { useEffect, useState } from 'react'

/**
 * Returns `value`, but only after `delay` ms have passed without it changing.
 * Use on search inputs so typing doesn't trigger a query per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debounced
}
