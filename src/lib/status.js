export function statusOf(item) {
  if (item.quantity <= item.thresholds.red) return 'red'
  if (item.quantity <= item.thresholds.yellow) return 'yellow'
  return 'green'
}

export const STATUS_LABELS = {
  red: { text: 'Buy now', className: 'bg-out-soft text-out' },
  yellow: { text: 'Running low', className: 'bg-low-soft text-low' },
}

export const STATUS_ORDER = { red: 0, yellow: 1, green: 2 }
