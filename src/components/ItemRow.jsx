import { useState } from 'react'
import { statusOf, STATUS_LABELS } from '../lib/status'

const stepBtn =
  'h-11 w-11 rounded-full bg-accent-soft text-ink text-xl leading-none active:scale-95 transition-transform'

export default function ItemRow({ item, onChange, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const label = STATUS_LABELS[statusOf(item)]

  const bump = (delta) => {
    const quantity = Math.max(0, item.quantity + delta)
    const lastBought = delta > 0 ? new Date().toISOString() : item.lastBought
    onChange({ ...item, quantity, lastBought })
  }

  if (confirmingDelete) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-out/30 bg-out-soft px-4 py-3">
        <span className="text-out text-sm font-semibold">Remove {item.name}?</span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-line active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-lg bg-out px-3 py-1.5 text-sm font-semibold text-white active:scale-95"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white py-2.5 pl-4 pr-2">
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="font-bold text-ink leading-tight">{item.name}</span>
        {label && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${label.className}`}>
            {label.text}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => bump(-1)} aria-label={`One less ${item.name}`} className={stepBtn}>
          −
        </button>
        <span className="w-6 text-center font-extrabold text-ink tabular-nums">{item.quantity}</span>
        <button type="button" onClick={() => bump(1)} aria-label={`One more ${item.name}`} className={stepBtn}>
          +
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label={`Remove ${item.name}`}
          className="h-9 w-9 rounded-full text-xl leading-none text-muted hover:bg-out-soft hover:text-out active:scale-95"
        >
          ×
        </button>
      </div>
    </div>
  )
}
