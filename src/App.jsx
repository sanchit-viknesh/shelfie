import { useEffect, useState } from 'react'
import { CATEGORIES } from './data/seed'
import { fetchItems, patchItem, createItem, deleteItem } from './lib/api'
import { statusOf, STATUS_ORDER } from './lib/status'
import { usePersisted } from './lib/usePersisted'
import CategorySection from './components/CategorySection'
import AddItemSheet from './components/AddItemSheet'
import Questionnaire from './components/Questionnaire'
import ToBuyView from './components/ToBuyView'

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [view, setView] = useState('home')
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [copied, setCopied] = useState(false)
  // Shopping progress lives on this phone only, so ticking in the store needs no signal
  const [ticks, setTicks] = usePersisted('shelfie.ticks', [])
  const [lastShopping, setLastShopping] = usePersisted('shelfie.lastShopping', null)

  useEffect(() => {
    fetchItems()
      .then(setItems)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const updateItem = (updated) => {
    const previous = items
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
    patchItem(updated.id, { quantity: updated.quantity, lastBought: updated.lastBought }).catch(
      () => setItems(previous)
    )
  }

  const removeItem = (item) => {
    const previous = items
    setItems((prev) => prev.filter((it) => it.id !== item.id))
    deleteItem(item.id).catch(() => setItems(previous))
  }

  const saveSettings = (item, patch) => {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, ...patch } : it)))
    patchItem(item.id, patch).catch(() =>
      setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)))
    )
  }

  const toggleTick = (id) =>
    setTicks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const completeShopping = () => {
    const picked = buyNowItems.filter((it) => ticks.includes(it.id))
    if (picked.length === 0) return
    const now = new Date().toISOString()
    const changes = picked.map((it) => ({
      id: it.id,
      name: it.name,
      from: it.quantity,
      added: it.usualQty,
      prevBought: it.lastBought,
    }))
    const byId = new Map(changes.map((c) => [c.id, c]))

    setItems((prev) =>
      prev.map((it) => {
        const c = byId.get(it.id)
        return c ? { ...it, quantity: c.from + c.added, lastBought: now } : it
      })
    )
    setLastShopping({ at: now, changes })
    setTicks([])

    changes.forEach((c) =>
      patchItem(c.id, { quantity: c.from + c.added, lastBought: now }).catch(() => {
        setItems((prev) =>
          prev.map((it) => (it.id === c.id ? { ...it, quantity: c.from, lastBought: c.prevBought } : it))
        )
        setLastShopping((prev) => prev && { ...prev, changes: prev.changes.filter((x) => x.id !== c.id) })
      })
    )
  }

  // Takes off only what Complete added, so counts changed since then still stand
  const revertShopping = () => {
    if (!lastShopping) return
    const undo = lastShopping.changes
      .map((c) => {
        const current = items.find((it) => it.id === c.id)
        if (!current) return null
        return {
          id: c.id,
          before: current,
          quantity: Math.max(0, current.quantity - c.added),
          lastBought: c.prevBought,
        }
      })
      .filter(Boolean)
    const byId = new Map(undo.map((u) => [u.id, u]))

    setItems((prev) =>
      prev.map((it) => {
        const u = byId.get(it.id)
        return u ? { ...it, quantity: u.quantity, lastBought: u.lastBought } : it
      })
    )
    setTicks(undo.map((u) => u.id))
    setLastShopping(null)

    undo.forEach((u) =>
      patchItem(u.id, { quantity: u.quantity, lastBought: u.lastBought }).catch(() =>
        setItems((prev) => prev.map((it) => (it.id === u.id ? u.before : it)))
      )
    )
  }

  const addItem = async (draft) => {
    const created = await createItem(draft)
    setItems((prev) => [...prev, created])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-muted font-semibold">Loading your shelf…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-out text-center font-semibold">Couldn't reach the server: {loadError}</p>
      </div>
    )
  }

  const buyNowItems = items
    .filter((it) => statusOf(it) !== 'green')
    .sort(
      (a, b) =>
        CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) ||
        STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)]
    )

  const listText = `Shelfie - grocery list:\n${buyNowItems.map((it) => `- ${it.name} ×${it.usualQty}`).join('\n')}`
  const unreviewedCount = items.filter((it) => !it.reviewed).length

  const copyList = async () => {
    await navigator.clipboard.writeText(listText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareList = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: listText })
      } catch {
        // user cancelled the share sheet, nothing to do
      }
    } else {
      copyList()
    }
  }

  return (
    <div className="min-h-screen bg-white pb-40">
      <header className="sticky top-0 z-10 bg-band px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 border-b border-band-line">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-extrabold text-ink tracking-tight">Shelfie</h1>
          {items.length > 0 && unreviewedCount === 0 && (
            <button
              type="button"
              onClick={() => setShowQuestionnaire(true)}
              className="rounded-lg px-2 py-1 text-sm font-bold text-chip-ink"
            >
              Edit minimums
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setView('home')}
            className={`flex-1 rounded-[10px] py-2.5 text-sm font-bold transition-colors ${
              view === 'home' ? 'bg-accent text-white' : 'bg-white text-ink/80'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setView('buyNow')}
            className={`flex-1 rounded-[10px] py-2.5 text-sm font-bold transition-colors ${
              view === 'buyNow' ? 'bg-accent text-white' : 'bg-white text-ink/80'
            }`}
          >
            To buy {buyNowItems.length > 0 && `(${buyNowItems.length})`}
          </button>
        </div>
      </header>

      <main className="px-4 pt-4">
        {view === 'home' && unreviewedCount > 0 && (
          <div className="mb-5 flex flex-col items-start gap-2 rounded-2xl border border-band-line bg-chip p-4">
            <p className="text-sm font-extrabold text-ink">Set a minimum for each item</p>
            <p className="text-[13px] leading-snug text-muted">
              {unreviewedCount} {unreviewedCount === 1 ? 'item still uses' : 'items still use'} the default. About 3 minutes.
            </p>
            <button
              type="button"
              onClick={() => setShowQuestionnaire(true)}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white active:scale-95 transition-transform"
            >
              Start
            </button>
          </div>
        )}

        {view === 'home' &&
          CATEGORIES.map((category) => (
            <CategorySection
              key={category}
              category={category}
              items={items.filter((it) => it.category === category)}
              onChange={updateItem}
              onDelete={removeItem}
            />
          ))}

        {view === 'buyNow' && (
          <ToBuyView
            items={buyNowItems}
            ticks={ticks}
            onToggle={toggleTick}
            onComplete={completeShopping}
            lastShopping={lastShopping}
            onRevert={revertShopping}
            onNextShopping={() => setLastShopping(null)}
            onShare={() => setShowShareSheet(true)}
          />
        )}
      </main>

      {view === 'home' && (
        <button
          type="button"
          onClick={() => setShowAddSheet(true)}
          aria-label="Add item"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-10 h-14 w-14 rounded-full bg-accent text-white text-3xl leading-none font-light shadow-lg shadow-accent/40 active:scale-95 transition-transform"
        >
          +
        </button>
      )}

      {showQuestionnaire && (
        <Questionnaire items={items} onSave={saveSettings} onClose={() => setShowQuestionnaire(false)} />
      )}

      {showAddSheet && (
        <AddItemSheet onClose={() => setShowAddSheet(false)} onAdd={addItem} />
      )}

      {showShareSheet && (
        <div
          className="fixed inset-0 z-20 bg-ink/40 flex items-end"
          onClick={() => setShowShareSheet(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold text-ink mb-3">Grocery list</h2>
            <textarea
              readOnly
              value={listText}
              className="w-full h-40 rounded-lg bg-accent-soft text-ink p-3 text-sm resize-none outline-none ring-1 ring-line"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copyList}
                className="flex-1 rounded-lg py-3 text-sm font-bold bg-accent-soft text-ink"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={shareList}
                className="flex-1 rounded-lg py-3 text-sm font-bold bg-accent text-white"
              >
                Send
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowShareSheet(false)}
              className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold text-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
