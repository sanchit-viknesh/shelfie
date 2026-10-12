import { ago } from '../lib/time'

// A thin strip under the header: only shown when something needs saying
export default function StatusStrip({ reachable, pending, itemsAt, now, syncedNote, notice }) {
  const plural = (n) => `${n} ${n === 1 ? 'change' : 'changes'}`

  let tone = null
  let main = ''
  let rest = ''
  if (notice) {
    tone = 'bg-out-soft text-out'
    main = notice
  } else if (!reachable) {
    tone = 'bg-low-soft text-low'
    main = "You're offline"
    rest = pending > 0 ? `${plural(pending)} will sync later` : itemsAt ? `list from ${ago(itemsAt, now)}` : ''
  } else if (syncedNote > 0) {
    tone = 'bg-ok-soft text-ok'
    main = 'Back online'
    rest = `${plural(syncedNote)} synced`
  }
  if (!tone) return null

  return (
    <div
      role="status"
      className={`-mx-4 -mb-4 mt-3 flex items-center gap-2 px-4 py-2 text-[12.5px] font-bold leading-snug ${tone}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <span>
        {main}
        {rest && <span className="font-semibold opacity-90"> · {rest}</span>}
      </span>
    </div>
  )
}
