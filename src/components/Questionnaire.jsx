import { useState } from 'react'
import { CATEGORIES } from '../data/seed'
import { minimumOf, thresholdsFor, STATUS_LABELS } from '../lib/status'
import Stepper from './Stepper'

function QuestionCard({ item, canGoBack, onBack, onSkip, onNext }) {
  const [min, setMin] = useState(minimumOf(item) || 2)
  const [usual, setUsual] = useState(item.usualQty)

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4">
        <span className="self-start rounded-full bg-chip px-3 py-1 text-xs font-bold uppercase tracking-wider text-chip-ink">
          {item.category}
        </span>
        <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{item.name}</h2>

        <section className="flex flex-col gap-2.5 rounded-2xl border border-line p-4">
          <h3 className="text-[15px] font-bold text-ink">Buy more when you're down to</h3>
          <Stepper value={min} onChange={setMin} min={1} label="minimum" large />
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_LABELS.yellow.className}`}>
              {STATUS_LABELS.yellow.text}
            </span>
            at {min}
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_LABELS.red.className}`}>
              {STATUS_LABELS.red.text}
            </span>
            below {min}
          </p>
        </section>

        <section className="flex flex-col gap-2.5 rounded-2xl border border-line p-4">
          <h3 className="text-[15px] font-bold text-ink">When you shop, you usually buy</h3>
          <Stepper value={usual} onChange={setUsual} min={1} label="usual amount" large />
          <p className="text-[13px] text-muted">Ticking it in To buy adds {usual} to your shelf.</p>
        </section>
      </div>
      <div className="flex gap-2 border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="flex-1 rounded-xl bg-accent-soft py-3 text-sm font-bold text-ink disabled:opacity-40"
        >
          Back
        </button>
        <button type="button" onClick={onSkip} className="flex-1 rounded-xl bg-accent-soft py-3 text-sm font-bold text-ink">
          Skip
        </button>
        <button
          type="button"
          onClick={() => onNext({ thresholds: thresholdsFor(min), usualQty: usual, reviewed: true })}
          className="flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-white"
        >
          Next
        </button>
      </div>
    </>
  )
}

export default function Questionnaire({ items, onSave, onClose }) {
  const [order] = useState(() =>
    CATEGORIES.flatMap((c) => items.filter((it) => it.category === c)).map((it) => it.id)
  )
  const [index, setIndex] = useState(() => {
    const first = order.findIndex((id) => !items.find((it) => it.id === id)?.reviewed)
    return first === -1 ? 0 : first
  })

  const finished = index >= order.length
  const item = finished ? null : items.find((it) => it.id === order[index])
  const skipped = items.filter((it) => !it.reviewed).length

  const next = (patch) => {
    if (patch && item) onSave(item, patch)
    setIndex((i) => i + 1)
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-white">
      <header className="border-b border-band-line bg-band px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Set your minimums</h1>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm font-bold text-chip-ink">
            Close
          </button>
        </div>
        <div className="mt-2 flex items-baseline justify-between text-[13px] font-semibold text-muted">
          <span>
            Item <strong className="tabular-nums text-ink">{Math.min(index + 1, order.length)}</strong> of{' '}
            {order.length}
          </span>
          <span>Saved as you go</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${Math.round((Math.min(index, order.length) / Math.max(order.length, 1)) * 100)}%` }}
          />
        </div>
      </header>

      {finished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <h2 className="text-2xl font-extrabold text-ink">All done</h2>
          <p className="text-muted">
            {skipped > 0
              ? `${skipped} skipped ${skipped === 1 ? 'item keeps' : 'items keep'} their current minimum.`
              : 'Every item has its own minimum now.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white"
          >
            Back to Shelfie
          </button>
        </div>
      ) : (
        <QuestionCard
          key={item.id}
          item={item}
          canGoBack={index > 0}
          onBack={() => setIndex((i) => Math.max(0, i - 1))}
          onSkip={() => next(null)}
          onNext={next}
        />
      )}
    </div>
  )
}
