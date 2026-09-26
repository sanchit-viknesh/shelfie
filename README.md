# Shelfie

A grocery inventory tracker for one household — what's stocked, what's low, what to buy. Two phones,
one shared live dataset, installed to the iOS home screen, usable on bad store wifi.

**This repo is a learning project.** The app is real and will get used; the point is learning the
stack that builds it.

## Learning goals

React 19 · Vite · Tailwind 4 · Node/Express · MongoDB · JWT auth · PWA · frontend system design

Coming from ten years of Angular, so [`docs/ANGULAR-TO-REACT.md`](docs/ANGULAR-TO-REACT.md) is the
translation layer.

## Start here

1. [`docs/ROADMAP.md`](docs/ROADMAP.md) — the whole arc, 14 phases across 4 milestones
2. [`docs/phases/00-system-design.md`](docs/phases/00-system-design.md) — first session, no code
3. [`docs/ANGULAR-TO-REACT.md`](docs/ANGULAR-TO-REACT.md) — keep it open through Phase 4

## Planned stack (the 14-phase coached plan)

| Layer | Choice |
|---|---|
| UI | React 19, Vite 8, Tailwind 4 |
| Server state | TanStack Query 5 |
| API | Express 5 |
| Database | MongoDB Atlas (M0 free tier) + Mongoose |
| Auth | JWT + bcryptjs, per-user accounts sharing a household |
| Tests | Vitest, over pure domain logic |
| Hosting | Vercel (Hobby) |

Both hosting and database are free tier with no credit card, and neither can surprise-bill.

## Status: paused plan, working v1 shipped instead

The 14-phase "you type every line, I coach" plan above was paused early on in favor of a working
app the household could actually use right away. What exists today is simpler than the planned
stack, built to be functional first:

| Layer | What's actually running |
|---|---|
| UI | React 19, Vite 8, Tailwind 4 |
| API | Plain Vercel serverless functions under `/api` (no Express) |
| Database | MongoDB Atlas (M0 free tier) + Mongoose |
| Auth | None — the API is unauthenticated, trusted by obscurity of the URL |
| Tests | None yet |
| Hosting | Vercel (Hobby), auto-deploys `main` |

The coached, from-scratch build (Express, JWT auth, TanStack Query, tests) remains the intended
learning track and will resume — this is the pragmatic detour that let the app go live for real
household use in the meantime.

## Current architecture

```
src/                React client (Vite)
  data/seed.js      Base item list — source of truth for a fresh/reset database
  lib/api.js        fetch() wrappers around /api/items
  lib/status.js      Pure domain logic: quantity -> red/yellow/green
api/
  _db.js            Mongoose connection (cached across warm serverless invocations) + Item schema
  items.js          GET (list all) / POST (replace entire collection — seeding/reset only)
  items/[id].js     PATCH (update one item's quantity/lastBought)
scripts/seedDb.js   One-off: push src/data/seed.js into MongoDB
```

Data flow: the client calls `/api/items` on load, and `PATCH`es a single item whenever a `+`/`-`
button is tapped. There is no client-side cache layer (no TanStack Query yet) — state lives in a
plain `useState`, optimistically updated and rolled back on a failed request.

### Known gaps, deliberately deferred

- **No auth.** Anyone with the URL can read or write the list. Fine for a household app with an
  obscure URL; not fine if this ever needs to be shared wider.
- **No tests.** Domain logic (`statusOf`) is pure and easy to test — this is the natural first
  target once the coached track resumes.
- **`POST /api/items` replaces the whole collection.** It's meant for seeding/reset, not everyday
  use, and is guarded against an empty body, but it's still a blunt instrument with no auth in
  front of it.
