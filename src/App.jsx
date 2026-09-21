import { useEffect, useState } from 'react'
import { CATEGORIES } from './data/seed'
import { loadItems, saveItems } from './lib/storage'
import { statusOf, STATUS_ORDER } from './lib/status'
import CategorySection from './components/CategorySection'
import ItemRow from './components/ItemRow'

export default function App() {
  const [items, setItems] = useState(() => loadItems())
  const [view, setView] = useState('home')

  useEffect(() => {
    saveItems(items)
  }, [items])

  const updateItem = (updated) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
  }

  const buyNowItems = items
    .filter((it) => statusOf(it) !== 'green')
    .sort((a, b) => STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)])

  const shareList = async () => {
    const text = `Shelfie - grocery list:\n${buyNowItems.map((it) => `- ${it.name}`).join('\n')}`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // user cancelled the share sheet, nothing to do
      }
    } else {
      await navigator.clipboard.writeText(text)
      alert('List copied to clipboard')
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
                onClick={shareList}
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
    </div>
  )
}
