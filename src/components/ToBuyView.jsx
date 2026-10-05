import { useState } from 'react'
import { CATEGORIES } from '../data/seed'

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TickRow({ item, ticked, onToggle }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ticked}
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-xl border border-line py-2.5 pl-3 pr-3 text-left transition-colors active:scale-[0.99] ${
        ticked ? 'bg-accent-soft' : 'bg-white'
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 text-white transition-colors ${
          ticked ? 'border-accent bg-accent' : 'border-[#9db8d2] bg-white'
        }`}
      >
        {ticked && <Check />}
      </span>
      <span className={`min-w-0 flex-1 font-bold leading-tight ${ticked ? 'text-muted line-through' : 'text-ink'}`}>
        {item.name}
      </span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-chip-ink ${
          ticked ? 'bg-white' : 'bg-accent-soft'
        }`}
      >
        Get {item.usualQty}
      </span>
    </button>
  )
}

function Grouped({ items, children }) {
  return CATEGORIES.map((category) => {
    const inCategory = items.filter((it) => it.category === category)
    if (inCategory.length === 0) return null
    return (
      <section key={category} className="mb-5">
        <h2 className="mb-2.5 inline-block rounded-full bg-chip px-3 py-1 text-xs font-bold uppercase tracking-wider text-chip-ink">
          {category}
        </h2>
        <div className="flex flex-col gap-2">{inCategory.map(children)}</div>
      </section>
    )
  })
}

export default function ToBuyView({
  items,
  ticks,
  onToggle,
  onComplete,
  lastShopping,
  onRevert,
  onNextShopping,
  onShare,
}) {
  const [confirming, setConfirming] = useState(false)

  // Done state: Complete became Revert
  if (lastShopping) {
    const count = lastShopping.changes.length
    return (
      <div>
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-ok-soft p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ok text-white">
            <Check />
          </span>
          <div>
            <p className="text-base font-extrabold leading-tight text-ok">Today's shopping is done</p>
            <p className="text-[13px] text-muted">
              {count} {count === 1 ? 'item' : 'items'} added to your shelf
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {lastShopping.changes.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
              <span className="min-w-0 font-bold text-ink">{c.name}</span>
              <span className="flex shrink-0 items-center gap-1.5 font-extrabold tabular-nums">
                <span className="font-semibold text-muted">{c.from}</span>
                <span className="text-muted" aria-hidden="true">→</span>
                <span className="text-ok">{c.from + c.added}</span>
              </span>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <p className="mb-4 rounded-xl bg-low-soft p-3 text-[13px] font-semibold leading-snug text-low">
            {items.length} {items.length === 1 ? 'item is' : 'items are'} still on To buy for next shopping:{' '}
            {items.map((it) => it.name).join(', ')}.
          </p>
        )}

        <button
          type="button"
          onClick={onNextShopping}
          className="w-full rounded-xl py-3 text-sm font-bold text-chip-ink"
        >
          Start next shopping
        </button>

        <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-2 border-t border-line bg-white px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={onRevert}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-ink ring-[1.5px] ring-inset ring-line"
          >
            Revert
          </button>
          <p className="text-center text-xs leading-snug text-muted">
            Pressed Complete by mistake? Revert puts the counts back and reopens today's list with your ticks.
          </p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return <p className="mt-8 text-center font-semibold text-muted">Nothing needed right now.</p>
  }

  const tickedSet = new Set(ticks)
  const ticked = items.filter((it) => tickedSet.has(it.id))
  const unticked = items.filter((it) => !tickedSet.has(it.id))
  const allTicked = unticked.length === 0

  const complete = () => {
    if (ticked.length === 0) return
    if (allTicked) onComplete()
    else setConfirming(true)
  }

  return (
    <div>
      <button
        type="button"
        onClick={onShare}
        className="mb-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
      >
        Share list
      </button>

      <div className="mb-4">
        <div className="flex items-baseline justify-between text-[13px] font-semibold text-muted">
          <span>
            <strong className="tabular-nums text-ink">{ticked.length}</strong> of {items.length} ticked
          </span>
          <span>Today's list</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-chip">
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${Math.round((ticked.length / items.length) * 100)}%` }}
          />
        </div>
      </div>

      <Grouped items={items}>
        {(item) => <TickRow key={item.id} item={item} ticked={tickedSet.has(item.id)} onToggle={() => onToggle(item.id)} />}
      </Grouped>

      <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-2 border-t border-line bg-white px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={complete}
          disabled={ticked.length === 0}
          className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {allTicked ? 'Complete shopping' : `Complete shopping (${ticked.length} of ${items.length})`}
        </button>
        <p className="text-center text-xs text-muted">Ticks stay on this phone until you complete.</p>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-20 flex items-end bg-ink/40" onClick={() => setConfirming(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-extrabold text-ink">
              {unticked.length} {unticked.length === 1 ? 'item' : 'items'} not ticked
            </h2>
            <ul className="mb-3 flex flex-col gap-1 rounded-xl bg-low-soft px-4 py-3 text-sm font-bold text-low">
              {unticked.map((it) => (
                <li key={it.id}>{it.name}</li>
              ))}
            </ul>
            <p className="mb-4 text-[13px] leading-snug text-muted">
              Not bought or not available? They stay on your To buy list for next shopping.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl bg-accent-soft py-3 text-sm font-bold text-ink"
              >
                Keep shopping
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  onComplete()
                }}
                className="flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-white"
              >
                Complete anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
