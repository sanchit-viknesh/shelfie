const isCount = (v) => Number.isFinite(v) && v >= 0
const isString = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max

// Only these fields can be changed on an existing item, each with its own rule
const PATCH_RULES = {
  quantity: isCount,
  usualQty: (v) => Number.isFinite(v) && v >= 1,
  reviewed: (v) => typeof v === 'boolean',
  lastBought: (v) => v === null || typeof v === 'string',
  thresholds: (v) => v && isCount(v.yellow) && isCount(v.red) && v.red <= v.yellow,
}

export function validatePatch(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Body must be an object' }
  const patch = {}
  for (const [key, value] of Object.entries(body)) {
    const rule = PATCH_RULES[key]
    if (!rule) continue // unknown fields and operators like $set are ignored
    if (!rule(value)) return { error: `Invalid value for ${key}` }
    patch[key] = key === 'thresholds' ? { yellow: value.yellow, red: value.red } : value
  }
  if (Object.keys(patch).length === 0) return { error: 'Nothing to update' }
  return { patch }
}

export function validateNewItem(body) {
  if (!body || typeof body !== 'object') return { error: 'Body must be an object' }
  const { name, category, quantity, minQty, usualQty } = body
  if (!isString(name, 80)) return { error: 'name is required (up to 80 characters)' }
  if (!isString(category, 30)) return { error: 'category is required (up to 30 characters)' }
  const min = Number.isFinite(minQty) && minQty >= 1 ? minQty : 2
  return {
    item: {
      name: name.trim(),
      category: category.trim(),
      quantity: isCount(quantity) ? quantity : 3,
      thresholds: { yellow: min, red: min - 1 },
      usualQty: Number.isFinite(usualQty) && usualQty >= 1 ? usualQty : 3,
      reviewed: true,
      lastBought: null,
    },
  }
}
