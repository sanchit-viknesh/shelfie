import { CATEGORIES } from '../data/seed'

export const OTHER = 'Other'
export const MAX_CATEGORY_LENGTH = 30

// Categories only exist while items use them: the seven originals, then custom ones in the
// order they were first used, then Other (always offered, even when empty)
export function categoriesOf(items) {
  const custom = []
  for (const it of items) {
    if (!CATEGORIES.includes(it.category) && it.category !== OTHER && !custom.includes(it.category)) {
      custom.push(it.category)
    }
  }
  return [...CATEGORIES, ...custom, OTHER]
}

// "  produce " reuses "Produce" instead of creating a near-duplicate
export function resolveCategory(typed, known) {
  const name = typed.trim().replace(/\s+/g, ' ').slice(0, MAX_CATEGORY_LENGTH)
  const existing = known.find((c) => c.toLowerCase() === name.toLowerCase())
  if (existing) return existing
  // Only tidy all-lowercase input, so "iPhone cases" is left as typed
  return name === name.toLowerCase() ? name.charAt(0).toUpperCase() + name.slice(1) : name
}
