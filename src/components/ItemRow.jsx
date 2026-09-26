import { useState } from 'react'
import { statusOf, STATUS_STYLES } from '../lib/status'

export default function ItemRow({ item, onChange, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const status = statusOf(item)

  const bump = (delta) => {
    const quantity = Math.max(0, item.quantity + delta)
    const lastBought = delta > 0 ? new Date().toISOString() : item.lastBought
    onChange({ ...item, quantity, lastBought })
  }

  if (confirmingDelete) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-rose-700 bg-rose-950/60 px-4 py-3">
        <span className="text-rose-200 text-sm font-medium">Remove {item.name}?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold bg-slate-700 text-slate-100 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold bg-rose-600 text-white active:scale-95"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${STATUS_STYLES[status]}`}
    >
      <span className="text-white font-medium">{item.name}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-1)}
          className="h-11 w-11 rounded-full bg-black/30 text-white text-xl leading-none active:scale-95"
        >
          −
        </button>
        <span className="w-6 text-center text-white font-semibold">{item.quantity}</span>
        <button
          type="button"
          onClick={() => bump(1)}
          className="h-11 w-11 rounded-full bg-black/30 text-white text-xl leading-none active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label={`Remove ${item.name}`}
          className="ml-1 h-9 w-9 rounded-full text-slate-400 hover:bg-black/20 hover:text-rose-300 active:scale-95"
        >
          ×
        </button>
      </div>
    </div>
  )
}
