import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, createItem, deleteItem, patchItem } from './api'
import { usePersisted } from './usePersisted'

// Every change is written here first and sent from here, so it survives losing signal or closing
// the app. Changes are sent oldest first: { id, kind: 'delta' | 'set' | 'create' | 'delete', ... }
const KEY = 'shelfie.outbox'
const RETRY_MS = 15000
const NOTE_MS = 4000

function send(op) {
  switch (op.kind) {
    case 'delta':
      return patchItem(op.itemId, { quantityDelta: op.delta, lastBought: op.lastBought })
    case 'set':
      return patchItem(op.itemId, op.patch)
    case 'create':
      return createItem(op.item)
    default:
      return deleteItem(op.itemId)
  }
}

// No signal, or the server had a problem: keep the change and try again later.
// Anything else (like 400 or 404) means the server refused it, so retrying won't help.
const shouldRetry = (err) => !(err instanceof ApiError) || err.status >= 500

export function useOutbox({ onCreated, onRejected }) {
  const [queue, setQueue] = usePersisted(KEY, [])
  const queueRef = useRef(queue)
  const running = useRef(null)
  const hadProblem = useRef(false)
  const handlers = useRef({ onCreated, onRejected })
  // null = fine, 'offline' = no signal, 'server' = the server answered with an error
  const [problem, setProblem] = useState(() => (navigator.onLine ? null : 'offline'))
  const [syncedNote, setSyncedNote] = useState(0)

  useEffect(() => {
    handlers.current = { onCreated, onRejected }
  })

  const update = useCallback(
    (fn) => {
      queueRef.current = fn(queueRef.current)
      setQueue(queueRef.current)
    },
    [setQueue]
  )

  const markProblem = useCallback((kind) => {
    if (kind) hadProblem.current = true
    setProblem(kind)
  }, [])

  const runFlush = useCallback(async () => {
    let synced = 0
    let stuck = null
    while (queueRef.current.length > 0) {
      const op = queueRef.current[0]
      try {
        const result = await send(op)
        synced++
        if (op.kind === 'create') {
          // Later changes to this item were made against its temporary id
          update((q) =>
            q.filter((o) => o.id !== op.id).map((o) => (o.itemId === op.tempId ? { ...o, itemId: result.id } : o))
          )
          handlers.current.onCreated(op.tempId, result)
        } else {
          update((q) => q.filter((o) => o.id !== op.id))
        }
      } catch (err) {
        if (shouldRetry(err)) {
          stuck = err instanceof ApiError ? 'server' : 'offline'
          break
        }
        update((q) => q.filter((o) => o.id !== op.id))
        // The item being already gone is fine: the other phone got there first
        if (!(err.status === 404 && op.kind !== 'create')) handlers.current.onRejected(op, err)
      }
    }
    // The problem only clears once every waiting change has gone through
    markProblem(stuck)
    if (synced > 0 && !stuck && hadProblem.current) {
      hadProblem.current = false
      setSyncedNote(synced)
    }
    return synced
  }, [update, markProblem])

  // A second caller waits for the flush already under way instead of starting another
  const flush = useCallback(() => {
    if (!running.current) {
      running.current = runFlush().finally(() => {
        running.current = null
      })
    }
    return running.current
  }, [runFlush])

  const enqueue = useCallback(
    (op) => {
      update((q) => [...q, { id: crypto.randomUUID(), ...op }])
      flush()
    },
    [update, flush]
  )

  // Drops waiting changes for an item that is being removed; true if the item was never created on the server
  const discardFor = useCallback(
    (itemId) => {
      const neverSynced = queueRef.current.some((o) => o.kind === 'create' && o.tempId === itemId)
      update((q) => q.filter((o) => o.itemId !== itemId && o.tempId !== itemId))
      return neverSynced
    },
    [update]
  )

  const isEmpty = useCallback(() => queueRef.current.length === 0, [])

  // Try again whenever signal comes back, and every so often while changes are waiting
  useEffect(() => {
    const online = () => flush()
    const offline = () => markProblem('offline')
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    const timer = setInterval(() => queueRef.current.length > 0 && flush(), RETRY_MS)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
      clearInterval(timer)
    }
  }, [flush, markProblem])

  useEffect(() => {
    if (!syncedNote) return
    const timer = setTimeout(() => setSyncedNote(0), NOTE_MS)
    return () => clearTimeout(timer)
  }, [syncedNote])

  return { enqueue, discardFor, flush, isEmpty, markProblem, pending: queue.length, problem, syncedNote }
}
