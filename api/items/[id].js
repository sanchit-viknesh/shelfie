import { connectDb, Item } from '../_db.js'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    await connectDb()

    if (req.method === 'PATCH') {
      const updated = await Item.findByIdAndUpdate(id, req.body, { new: true }).lean()
      if (!updated) return res.status(404).json({ error: 'Item not found' })
      return res.status(200).json(updated)
    }

    if (req.method === 'DELETE') {
      const deleted = await Item.findByIdAndDelete(id).lean()
      if (!deleted) return res.status(404).json({ error: 'Item not found' })
      return res.status(204).end()
    }

    res.setHeader('Allow', ['PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
