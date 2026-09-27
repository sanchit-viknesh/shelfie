import { useEffect, useState } from 'react'
import { CATEGORIES } from './data/seed'
import { fetchItems, patchItem, createItem, deleteItem } from './lib/api'
import { statusOf, STATUS_ORDER } from './lib/status'
import CategorySection from './components/CategorySection'
import ItemRow from './components/ItemRow'
import AddItemSheet from './components/AddItemSheet'

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [view, setView] = useState('home')
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [copied, setCopied] = useState(false)

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
    .sort((a, b) => STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)])

  const listText = `Shelfie - grocery list:\n${buyNowItems.map((it) => `- ${it.name}`).join('\n')}`

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
    <div className="min-h-screen bg-white pb-28">
      <header className="sticky top-0 z-10 bg-band px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 border-b border-band-line">
        <h1 className="text-[26px] font-extrabold text-ink tracking-tight">Shelfie</h1>
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
            What to buy now {buyNowItems.length > 0 && `(${buyNowItems.length})`}
          </button>
        </div>
      </header>

      <main className="px-4 pt-4">
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
          <div className="flex flex-col gap-2">
            {buyNowItems.length === 0 && (
              <p className="text-muted text-center font-semibold mt-8">Nothing needed right now.</p>
            )}
            {buyNowItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowShareSheet(true)}
                className="mb-2 rounded-lg py-3 text-sm font-bold bg-accent text-white active:scale-[0.98] transition-transform"
              >
                Share list
              </button>
            )}
            {buyNowItems.map((item) => (
              <ItemRow key={item.id} item={item} onChange={updateItem} onDelete={removeItem} />
            ))}
          </div>
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
