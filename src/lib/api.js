function normalize(doc) {
  const { _id, __v, ...rest } = doc
  return { id: _id, ...rest }
}

export async function fetchItems() {
  const res = await fetch('/api/items')
  if (!res.ok) throw new Error('Failed to load items')
  const docs = await res.json()
  return docs.map(normalize)
}

export async function patchItem(id, patch) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Failed to update item')
  return normalize(await res.json())
}
