import mongoose from 'mongoose'
import { connectDb, Item } from '../_db.js'
import { validatePatch } from '../_validate.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid item id' })

  try {
    await connectDb()

    if (req.method === 'PATCH') {
      const { patch, error } = validatePatch(req.body)
      if (error) return res.status(400).json({ error })
      const { quantityDelta, ...fields } = patch
      // A pipeline update adds to the current stored count (never below 0); $literal keeps values from being read as field paths
      const set = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, { $literal: v }]))
      if (quantityDelta !== undefined) set.quantity = { $max: [0, { $add: ['$quantity', quantityDelta] }] }
      const updated = await Item.findByIdAndUpdate(id, [{ $set: set }], { new: true, updatePipeline: true }).lean()
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
