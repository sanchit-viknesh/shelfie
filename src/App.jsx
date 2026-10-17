import { useCallback, useEffect, useRef, useState } from 'react'
import { categoriesOf } from './lib/categories'
import { ApiError, fetchItems, normalize } from './lib/api'
import { statusOf, STATUS_ORDER, thresholdsFor } from './lib/status'
import { usePersisted } from './lib/usePersisted'
import { useOutbox } from './lib/useOutbox'
import CategorySection from './components/CategorySection'
import SearchBox from './components/SearchBox'
import StatusStrip from './components/StatusStrip'
import AddItemSheet from './components/AddItemSheet'
import Questionnaire from './components/Questionnaire'
import ToBuyView from './components/ToBuyView'

const REVERT_WINDOW_MS = 12 * 60 * 60 * 1000
const REFRESH_GAP_MS = 5000
const NOTICE_MS = 6000

export default function App() {
  // The last list the server sent is kept on the phone, so the app opens instantly, with or without signal
  const [items, setItems] = usePersisted('shelfie.items', [])
  const [itemsAt, setItemsAt] = usePersisted('shelfie.itemsAt', null)
  const [loadError, setLoadError] = useState(null)
  const [view, setView] = useState('home')
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [copied, setCopied] = useState(false)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  // Shopping progress lives on this phone only, so ticking in the store needs no signal
  const [ticks, setTicks] = usePersisted('shelfie.ticks', [])
  const [savedShopping, setLastShopping] = usePersisted('shelfie.lastShopping', null)
  // Revert only makes sense soon after Complete; later, counts have moved on
  const [openedAt] = useState(() => Date.now())
  const lastShopping =
    savedShopping && openedAt - new Date(savedShopping.at).getTime() < REVERT_WINDOW_MS ? savedShopping : null
  const loading = itemsAt === null && !loadError

  const editSeq = useRef(0)
  const refreshing = useRef(false)
  const lastRefresh = useRef(0)

  const onCreated = useCallback(
    (tempId, doc) => {
      const created = normalize(doc)
      setItems((prev) => prev.map((it) => (it.id === tempId ? created : it)))
      setTicks((prev) => prev.map((id) => (id === tempId ? created.id : id)))
    },
    [setItems, setTicks]
  )

  // When the server refuses a change, say so and reload the list so the screen matches the server again
  const [rejections, setRejections] = useState(0)
  const onRejected = useCallback(() => {
    setNotice("A change couldn't be saved and was undone")
    setRejections((n) => n + 1)
  }, [])
  const itemsAtRef = useRef(itemsAt)
  const outbox = useOutbox({ onCreated, onRejected })
  const { flush, isEmpty, markProblem, problem } = outbox

  // Send waiting changes, then replace the list with the server's copy (this also picks up the other phone's changes)
  const refresh = useCallback(async () => {
    if (refreshing.current) return
    refreshing.current = true
    lastRefresh.current = Date.now()
    try {
      await flush()
      const seq = editSeq.current
      const fresh = await fetchItems()
      // Skip it if something changed while it loaded; the next refresh gets it
      if (editSeq.current === seq && isEmpty()) {
        setItems(fresh)
        setItemsAt(Date.now())
        markProblem(null)
      }
    } catch (err) {
      markProblem(err instanceof ApiError ? 'server' : 'offline')
      setLoadError((prev) => prev ?? (itemsAtRef.current === null ? err.message : null))
    } finally {
      refreshing.current = false
    }
  }, [flush, isEmpty, markProblem, setItems, setItemsAt])
  useEffect(() => {
    itemsAtRef.current = itemsAt
  })

  useEffect(() => {
    if (rejections > 0) refresh()
  }, [rejections, refresh])

  useEffect(() => {
    refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh.current > REFRESH_GAP_MS) refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', refresh)
    const clock = setInterval(() => setNow(Date.now()), 60000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', refresh)
      clearInterval(clock)
    }
  }, [refresh])

  // After signal returns (even without an 'online' event), bring in the other phone's changes
  const hadProblem = useRef(problem !== null)
  useEffect(() => {
    if (problem === null && hadProblem.current) refresh()
    hadProblem.current = problem !== null
  }, [problem, refresh])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice])

  // Forget ticks for items that left the list (deleted, or restocked from Home or another phone)
  useEffect(() => {
    if (loading) return
    const due = new Set(items.filter((it) => statusOf(it) !== 'green').map((it) => it.id))
    setTicks((prev) => (prev.every((id) => due.has(id)) ? prev : prev.filter((id) => due.has(id))))
  }, [items, loading, setTicks])

  // Every change shows on screen at once, then goes through the outbox to the server
  const record = (op) => {
    editSeq.current++
    outbox.enqueue(op)
  }

  const updateItem = (updated) => {
    const previous = items.find((it) => it.id === updated.id)
    const delta = updated.quantity - previous.quantity
    if (delta === 0) return
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
    record({ kind: 'delta', itemId: updated.id, delta, lastBought: updated.lastBought })
  }

  const removeItem = (item) => {
    setItems((prev) => prev.filter((it) => it.id !== item.id))
    editSeq.current++
    if (!outbox.discardFor(item.id)) outbox.enqueue({ kind: 'delete', itemId: item.id })
  }

  const saveSettings = (item, patch) => {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, ...patch } : it)))
    record({ kind: 'set', itemId: item.id, patch })
  }

  const toggleTick = (id) =>
    setTicks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const completeShopping = () => {
    const picked = buyNowItems.filter((it) => ticks.includes(it.id))
    if (picked.length === 0) return
    const stamp = new Date().toISOString()
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
        return c ? { ...it, quantity: c.from + c.added, lastBought: stamp } : it
      })
    )
    setLastShopping({ at: stamp, changes })
    setTicks([])
    changes.forEach((c) => record({ kind: 'delta', itemId: c.id, delta: c.added, lastBought: stamp }))
  }

  // Takes off only what Complete added, so counts changed since then still stand
  const revertShopping = () => {
    if (!lastShopping) return
    const undo = lastShopping.changes.filter((c) => items.some((it) => it.id === c.id))
    const byId = new Map(undo.map((c) => [c.id, c]))

    setItems((prev) =>
      prev.map((it) => {
        const c = byId.get(it.id)
        return c ? { ...it, quantity: Math.max(0, it.quantity - c.added), lastBought: c.prevBought } : it
      })
    )
    setTicks(undo.map((c) => c.id))
    setLastShopping(null)
    undo.forEach((c) => record({ kind: 'delta', itemId: c.id, delta: -c.added, lastBought: c.prevBought }))
  }

  const addItem = (draft) => {
    const tempId = `tmp-${crypto.randomUUID()}`
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        name: draft.name,
        category: draft.category,
        quantity: draft.quantity,
        thresholds: thresholdsFor(draft.minQty),
        usualQty: draft.usualQty,
        reviewed: true,
        lastBought: null,
      },
    ])
    record({ kind: 'create', tempId, item: draft })
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

  const categories = categoriesOf(items)
  const buyNowItems = items
    .filter((it) => statusOf(it) !== 'green')
    .sort(
      (a, b) =>
        categories.indexOf(a.category) - categories.indexOf(b.category) ||
        STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)]
    )

  const listText = `Shelfie - grocery list:\n${buyNowItems.map((it) => `- ${it.name} ×${it.usualQty}`).join('\n')}`
  const search = query.trim()
  const visibleItems = search
    ? items.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()))
    : items
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
        <StatusStrip
          problem={problem}
          pending={outbox.pending}
          itemsAt={itemsAt}
          now={now}
          syncedNote={outbox.syncedNote}
          notice={notice}
        />
      </header>

      <main className="px-4 pt-4">
        {view === 'home' && unreviewedCount > 0 && !search && (
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

        {view === 'home' && <SearchBox value={query} onChange={setQuery} />}

        {view === 'home' && search && (
          <p className="-mt-2 mb-3 px-0.5 text-[13px] font-semibold text-muted" aria-live="polite">
            {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
          </p>
        )}

        {view === 'home' && search && visibleItems.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-1.5 text-center">
            <p className="font-extrabold text-ink">No items match "{search}"</p>
            <p className="text-[13px] text-muted">Check the spelling, or add it with the + button.</p>
          </div>
        )}

        {view === 'home' &&
          categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              items={visibleItems.filter((it) => it.category === category)}
              query={search}
              onChange={updateItem}
              onDelete={removeItem}
            />
          ))}

        {view === 'buyNow' && (
          <ToBuyView
            items={buyNowItems}
            categories={categories}
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
        <Questionnaire items={items} categories={categories} onSave={saveSettings} onClose={() => setShowQuestionnaire(false)} />
      )}

      {showAddSheet && (
        <AddItemSheet categories={categories} onClose={() => setShowAddSheet(false)} onAdd={addItem} />
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
