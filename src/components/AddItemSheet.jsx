import { useState } from 'react'
import { CATEGORIES } from '../data/seed'

export default function AddItemSheet({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [quantity, setQuantity] = useState(3)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await onAdd({ name: name.trim(), category, quantity })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 bg-black/60 flex items-end"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full bg-slate-800 rounded-t-2xl p-4"
      >
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Add item</h2>

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          Name
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Paneer"
          className="w-full rounded-lg bg-slate-900 text-slate-100 px-3 py-2.5 text-sm mb-3 outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg bg-slate-900 text-slate-100 px-3 py-2.5 text-sm mb-3 outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          Starting quantity
        </label>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(0, q - 1))}
            className="h-11 w-11 rounded-full bg-black/30 text-white text-xl leading-none active:scale-95"
          >
            −
          </button>
          <span className="w-8 text-center text-white font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-11 w-11 rounded-full bg-black/30 text-white text-xl leading-none active:scale-95"
          >
            +
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-slate-700 text-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-emerald-500 text-slate-900 disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add item'}
          </button>
        </div>
      </form>
    </div>
  )
}
