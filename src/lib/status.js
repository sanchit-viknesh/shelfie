export function statusOf(item) {
  if (item.quantity <= item.thresholds.red) return 'red'
  if (item.quantity <= item.thresholds.yellow) return 'yellow'
  return 'green'
}

export const STATUS_STYLES = {
  green: 'bg-emerald-900/40 border-emerald-600',
  yellow: 'bg-amber-900/40 border-amber-600',
  red: 'bg-rose-900/40 border-rose-600',
}

export const STATUS_ORDER = { red: 0, yellow: 1, green: 2 }
