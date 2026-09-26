// One-time (or "reset base data") migration: pushes src/data/seed.js into MongoDB.
// Usage: MONGODB_URI="mongodb+srv://..." node scripts/seedDb.js
import mongoose from 'mongoose'
import { seedItems } from '../src/data/seed.js'
import { Item, connectDb } from '../api/_db.js'

async function run() {
  await connectDb()
  const items = seedItems().map(({ id: _id, ...rest }) => rest)
  await Item.deleteMany({})
  const created = await Item.insertMany(items)
  console.log(`Seeded ${created.length} items into MongoDB.`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
