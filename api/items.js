import { connectDb, Item } from './_db.js'

export default async function handler(req, res) {
  try {
    await connectDb()

    if (req.method === 'GET') {
      const items = await Item.find().lean()
      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      // Replace the entire collection (used by the seed/migration script and
      // by "reset to base data" — not by normal item edits, see [id].js).
      const { items } = req.body
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Expected { items: [non-empty array] }' })
      }
      await Item.deleteMany({})
      const created = await Item.insertMany(items)
      return res.status(200).json(created)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
