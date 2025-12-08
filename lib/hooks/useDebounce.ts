/**
 * Custom React Hooks for HOME Platform
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// =============================================================================
// useDebounce - Debounce any value
// =============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// =============================================================================
// useLocalStorage - Persist state to localStorage
// =============================================================================

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// =============================================================================
// useOnClickOutside - Detect clicks outside element
// =============================================================================

export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// =============================================================================
// useMediaQuery - Responsive breakpoints
// =============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Preset breakpoints
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)')
}

// =============================================================================
// usePrevious - Get previous value of a state
// =============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  
  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// =============================================================================
// useToggle - Boolean toggle state
// =============================================================================

export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const set = useCallback((newValue: boolean) => {
    setValue(newValue)
  }, [])

  return [value, toggle, set]
}

// =============================================================================
// useInterval - setInterval as a hook
// =============================================================================

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// =============================================================================
// useCopyToClipboard - Copy text to clipboard
// =============================================================================

export function useCopyToClipboard(): [string | null, (text: string) => Promise<boolean>] {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      setCopiedText(null)
      return false
    }
  }, [])

  return [copiedText, copy]
}

// =============================================================================
// useKeyPress - Detect specific key press
// =============================================================================

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true)
      }
    }

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false)
      }
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [targetKey])

  return keyPressed
}

// =============================================================================
// useHotkeys - Keyboard shortcuts (Cmd+K, etc.)
// =============================================================================

interface HotkeyConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  callback: () => void
}

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      hotkeys.forEach(({ key, ctrl, alt, shift, meta, callback }) => {
        const matchesKey = event.key.toLowerCase() === key.toLowerCase()
        const matchesCtrl = ctrl ? event.ctrlKey : !event.ctrlKey
        const matchesAlt = alt ? event.altKey : !event.altKey
        const matchesShift = shift ? event.shiftKey : !event.shiftKey
        const matchesMeta = meta ? event.metaKey : !event.metaKey

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift && matchesMeta) {
          event.preventDefault()
          callback()
        }
      })
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hotkeys])
}

// =============================================================================
// useAsync - Handle async operations
// =============================================================================

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): AsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute }
}
