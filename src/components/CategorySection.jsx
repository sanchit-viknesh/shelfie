import ItemRow from './ItemRow'

export default function CategorySection({ category, items, onChange }) {
  if (items.length === 0) return null

  return (
    <section className="mb-6">
      {category && (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">
          {category}
        </h2>
      )}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onChange={onChange} />
        ))}
      </div>
    </section>
  )
}
