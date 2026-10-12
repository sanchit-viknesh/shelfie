import { useState } from 'react'
import { MAX_CATEGORY_LENGTH, OTHER, resolveCategory } from '../lib/categories'
import Stepper from './Stepper'

const field =
  'w-full rounded-lg bg-white text-ink px-3 py-2.5 text-base mb-4 outline-none ring-1 ring-line focus:ring-2 focus:ring-accent'
const fieldLabel = 'block text-xs font-bold uppercase tracking-wider text-muted mb-1.5'

const NEW_CATEGORY = '__new__'

export default function AddItemSheet({ categories, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [newCategory, setNewCategory] = useState('')
  const [quantity, setQuantity] = useState(3)
  const [minQty, setMinQty] = useState(2)
  const [usualQty, setUsualQty] = useState(3)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const addingCategory = category === NEW_CATEGORY
  const canSave = name.trim() && (!addingCategory || newCategory.trim()) && !saving

  const submit = async (e) => {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const finalCategory = addingCategory ? resolveCategory(newCategory, categories) : category
      await onAdd({ name: name.trim(), category: finalCategory, quantity, minQty, usualQty })
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
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ Add new category</option>
        </select>

        {addingCategory && (
          <>
            <label htmlFor="add-new-category" className={fieldLabel}>New category name</label>
            <input
              id="add-new-category"
              autoFocus
              type="text"
              value={newCategory}
              maxLength={MAX_CATEGORY_LENGTH}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Frozen"
              className={`${field} mb-1`}
            />
            <p className="mb-4 text-[13px] text-muted">
              It shows up on Home and in this list from now on. Not sure? Pick {OTHER} instead.
            </p>
          </>
        )}

        <div className="mb-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-ink">How many now</span>
            <Stepper value={quantity} onChange={setQuantity} label="now" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-ink">Buy more when down to</span>
            <Stepper value={minQty} onChange={setMinQty} min={1} label="minimum" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-ink">Usually buy</span>
            <Stepper value={usualQty} onChange={setUsualQty} min={1} label="usual amount" />
          </div>
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
            disabled={!canSave}
            className="flex-1 rounded-lg bg-accent py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add item'}
          </button>
        </div>
      </form>
    </div>
  )
}
