import { connectDb, Item } from './_db.js'

export default async function handler(req, res) {
  try {
    await connectDb()

    if (req.method === 'GET') {
      const items = await Item.find().lean()
      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      const { name, category, quantity } = req.body
      if (!name || !category) {
        return res.status(400).json({ error: 'name and category are required' })
      }
      const created = await Item.create({
        name,
        category,
        quantity: Number.isFinite(quantity) ? quantity : 3,
        thresholds: { yellow: 2, red: 1 },
        lastBought: null,
      })
      return res.status(201).json(created.toObject())
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
