import { connectDb, Item } from './_db.js'
import { validateNewItem } from './_validate.js'

export default async function handler(req, res) {
  try {
    await connectDb()

    if (req.method === 'GET') {
      const items = await Item.find().lean()
      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      const { item, error } = validateNewItem(req.body)
      if (error) return res.status(400).json({ error })
      const created = await Item.create(item)
      return res.status(201).json(created.toObject())
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
