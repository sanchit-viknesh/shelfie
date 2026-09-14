import { seedItems } from '../data/seed'

const KEY = 'shelfie-items'

export function loadItems() {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const seeded = seedItems()
    saveItems(seeded)
    return seeded
  }
  return JSON.parse(raw)
}

export function saveItems(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}
