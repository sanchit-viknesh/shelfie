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

## Planned stack

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

## Status

Phase 0. Design docs only — no application code yet, deliberately.

## Repo shape (as it will be)

```
/               Vite React client
/server         Express API — standalone on :3000 in dev
/api/index.js   adapter exposing the Express app as a Vercel function
/shared         domain logic imported by both client and server
/docs           the learning track
```
