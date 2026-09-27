import mongoose from 'mongoose'

let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export async function connectDb() {
  if (cached.conn) return cached.conn

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI)
  }
  cached.conn = await cached.promise
  return cached.conn
}

const thresholdSchema = new mongoose.Schema(
  {
    yellow: { type: Number, required: true },
    red: { type: Number, required: true },
  },
  { _id: false }
)

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  thresholds: { type: thresholdSchema, required: true },
  lastBought: { type: String, default: null },
})

export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema)
