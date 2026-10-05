import { useEffect, useState } from 'react'

// useState that survives a refresh or the phone closing the app, kept on this device only
export function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private window, full): the value just won't survive a reload
    }
  }, [key, value])

  return [value, setValue]
}
