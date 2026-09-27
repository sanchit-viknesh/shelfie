# Shelfie — system design

> **Status: template. Sanchit fills this in during Phase 0.**
>
> Answer in your own words, in prose, as if writing for a colleague who joins the project next month.
> Where you're unsure, write what you're unsure about rather than guessing confidently — Section 9
> exists for exactly that.
>
> Delete this block when you start.

---

## 1. Problem statement

*One paragraph. What problem, for whom, and what does success look like?*

## 2. Requirements

### Functional
*What the app must do, as a numbered list.*

### Non-functional
*Freshness target (in seconds), offline behaviour, scale, latency budget, durability needs.*

### Out of scope
*Explicitly not building. Be generous with this list.*

## 3. Data model

### Entities
*`User`, `Household`, `Item` — fields, types, relationships. Say why `Item` hangs off the entity you
chose.*

### Status state machine
*Legal transitions. Both paths that change status: the tap cycle and the overdue rule.*

### Stored vs computed
*The overdue-derived status: which did you choose, and what did the other option cost?*

## 4. Architecture

### Component tree
*Which components exist, what each owns.*

### State ownership
*For each piece of state: who owns it, and why there.*

### Request path
*Thumb on glass → pixel changes on the other phone. Every hop.*

## 5. API contract

*Every endpoint: method, path, request, response, status codes. Written before it exists.*

| Method | Path | Body | Returns | Codes |
|---|---|---|---|---|
| | | | | |

### Where business logic lives
*Client, server, or both — and what breaks under each choice.*

### Authorisation
*The exact check that stops user A reading household B's data, and where it runs.*

## 6. Sync strategy

*Freshness target, mechanism, interval. Conflict handling and what it loses. How a tap feels instant
despite the round trip, and what happens on screen when the request fails.*

## 7. Failure modes

| What fails | What the user sees | What we do about it |
|---|---|---|
| | | |

## 8. Trade-offs

| Decision | Chose | Gave up | Would revisit when |
|---|---|---|---|
| | | | |

## 9. Open questions

*What you genuinely don't know yet. This section is a strength, not a gap.*

## 10. v2 — things we deliberately deferred

*Filled in at Phase 13. Multi-household, true realtime, the AI agent layer.*
