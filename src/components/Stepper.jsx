export default function Stepper({ value, onChange, min = 0, label, large = false }) {
  const btn = `${
    large ? 'h-12 w-12 text-2xl' : 'h-11 w-11 text-xl'
  } rounded-full bg-accent-soft leading-none text-ink transition-transform active:scale-95 disabled:opacity-40`

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`One less ${label}`}
        className={btn}
      >
        −
      </button>
      <span
        className={`${large ? 'w-10 text-3xl' : 'w-8 text-lg'} text-center font-extrabold tabular-nums text-ink`}
        aria-live="polite"
      >
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`One more ${label}`} className={btn}>
        +
      </button>
    </div>
  )
}
