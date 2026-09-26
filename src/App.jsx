import { useEffect, useState } from 'react'
import { CATEGORIES } from './data/seed'
import { fetchItems, patchItem } from './lib/api'
import { statusOf, STATUS_ORDER } from './lib/status'
import CategorySection from './components/CategorySection'
import ItemRow from './components/ItemRow'

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [view, setView] = useState('home')
  const [showShareSheet, setShowShareSheet] = useState(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <p className="text-rose-400 text-center">Couldn't reach the server: {loadError}</p>
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
    <div className="min-h-screen bg-slate-900 pb-24">
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur px-4 pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-emerald-400">Shelfie</h1>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setView('home')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
              view === 'home' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setView('buyNow')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
              view === 'buyNow' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-300'
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
            />
          ))}

        {view === 'buyNow' && (
          <div className="flex flex-col gap-2">
            {buyNowItems.length === 0 && (
              <p className="text-slate-400 text-center mt-8">Nothing needed right now.</p>
            )}
            {buyNowItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowShareSheet(true)}
                className="mb-2 rounded-lg py-2 text-sm font-semibold bg-emerald-500 text-slate-900"
              >
                Share list
              </button>
            )}
            {buyNowItems.map((item) => (
              <ItemRow key={item.id} item={item} onChange={updateItem} />
            ))}
          </div>
        )}
      </main>

      {showShareSheet && (
        <div
          className="fixed inset-0 z-20 bg-black/60 flex items-end"
          onClick={() => setShowShareSheet(false)}
        >
          <div
            className="w-full bg-slate-800 rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Grocery list</h2>
            <textarea
              readOnly
              value={listText}
              className="w-full h-40 rounded-lg bg-slate-900 text-slate-200 p-3 text-sm resize-none"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copyList}
                className="flex-1 rounded-lg py-2 text-sm font-semibold bg-slate-700 text-slate-100"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={shareList}
                className="flex-1 rounded-lg py-2 text-sm font-semibold bg-emerald-500 text-slate-900"
              >
                Send
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowShareSheet(false)}
              className="mt-2 w-full rounded-lg py-2 text-sm text-slate-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
