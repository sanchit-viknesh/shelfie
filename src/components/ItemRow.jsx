import { statusOf, STATUS_STYLES } from '../lib/status'

export default function ItemRow({ item, onChange }) {
  const status = statusOf(item)

  const bump = (delta) => {
    const quantity = Math.max(0, item.quantity + delta)
    const lastBought = delta > 0 ? new Date().toISOString() : item.lastBought
    onChange({ ...item, quantity, lastBought })
  }

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${STATUS_STYLES[status]}`}
    >
      <span className="text-white font-medium">{item.name}</span>
      <div className="flex items-center gap-3">
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
      </div>
    </div>
  )
}
