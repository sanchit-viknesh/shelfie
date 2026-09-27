import { useState } from 'react'
import { CATEGORIES } from '../data/seed'

const field =
  'w-full rounded-lg bg-white text-ink px-3 py-2.5 text-base mb-4 outline-none ring-1 ring-line focus:ring-2 focus:ring-accent'
const fieldLabel = 'block text-xs font-bold uppercase tracking-wider text-muted mb-1.5'
const stepBtn =
  'h-11 w-11 rounded-full bg-accent-soft text-ink text-xl leading-none active:scale-95 transition-transform'

export default function AddItemSheet({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [quantity, setQuantity] = useState(3)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      await onAdd({ name: name.trim(), category, quantity })
      onClose()
    } catch {
      setError("Couldn't save. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-ink/40" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <h2 className="mb-4 text-lg font-extrabold text-ink">Add item</h2>

        <label htmlFor="add-name" className={fieldLabel}>Name</label>
        <input
          id="add-name"
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Paneer"
          className={field}
        />

        <label htmlFor="add-category" className={fieldLabel}>Category</label>
        <select
          id="add-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={field}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className={fieldLabel}>Starting quantity</span>
        <div className="mb-5 flex items-center gap-3">
          <button type="button" onClick={() => setQuantity((q) => Math.max(0, q - 1))} aria-label="One less" className={stepBtn}>
            −
          </button>
          <span className="w-8 text-center text-lg font-extrabold text-ink tabular-nums">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="One more" className={stepBtn}>
            +
          </button>
        </div>

        {error && <p className="mb-3 text-sm font-semibold text-out">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-accent-soft py-3 text-sm font-bold text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="flex-1 rounded-lg bg-accent py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add item'}
          </button>
        </div>
      </form>
    </div>
  )
}
