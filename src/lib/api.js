export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const check = (res, message) => {
  if (!res.ok) throw new ApiError(res.status, message)
}

export function normalize(doc) {
  const { _id, __v, ...rest } = doc
  // Items saved before the minimums questionnaire don't have these two fields yet
  return { id: _id, usualQty: 3, reviewed: false, ...rest }
}

export async function fetchItems() {
  const res = await fetch('/api/items')
  check(res, 'Failed to load items')
  const docs = await res.json()
  return docs.map(normalize)
}

export async function patchItem(id, patch) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  check(res, 'Failed to update item')
  return normalize(await res.json())
}

export async function createItem(item) {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  check(res, 'Failed to add item')
  return normalize(await res.json())
}

export async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
  check(res, 'Failed to remove item')
}
