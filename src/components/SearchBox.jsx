export default function SearchBox({ value, onChange }) {
  return (
    <div className="mb-4 flex h-11 items-center gap-2 rounded-xl border-[1.5px] border-line bg-white pl-3 pr-1.5 text-muted focus-within:border-accent focus-within:text-accent focus-within:ring-[3px] focus-within:ring-accent/20">
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="9" cy="9" r="6" />
        <path d="M14 14l4 4" />
      </svg>
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search items"
        aria-label="Search items"
        className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-[#8aa0b5]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-base leading-none text-ink active:scale-95"
        >
          ×
        </button>
      )}
    </div>
  )
}
