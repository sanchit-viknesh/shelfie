import { seedItems, SEED_VERSION } from '../data/seed'

const KEY = 'shelfie-items'
const VERSION_KEY = 'shelfie-seed-version'

export function loadItems() {
  const storedVersion = localStorage.getItem(VERSION_KEY)
  if (storedVersion !== String(SEED_VERSION)) {
    const seeded = seedItems()
    saveItems(seeded)
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
    return seeded
  }

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
