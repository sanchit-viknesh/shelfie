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

// "Buy more when you're down to N": Running low at N, Buy now below N
export const minimumOf = (item) => item.thresholds.yellow
export const thresholdsFor = (min) => ({ yellow: min, red: min - 1 })
