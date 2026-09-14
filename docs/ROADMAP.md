# Shelfie — build roadmap

## What we're building

A grocery inventory app for one household. You and your wife both see the same live data: what's
stocked, what's low, what to buy. Installed on your iPhone home screens, works with a bad signal in
the store.

## What you're actually learning

React 19, Vite, Tailwind 4, Node/Express, MongoDB, real auth, PWA, and frontend system design. The
app is the excuse.

## Ground rules

- **You write the code.** I explain the concept, show one worked example, hand you a spec. You write
  it. I review your diff and tell you what's wrong and why.
- **You run everything on your own laptop.** My session is a cloud container — I can't see your
  localhost. Push often so I can see your work.
- **Each phase ends with something visibly working**, plus a few "explain it back to me" questions.
  If you can't answer those, we don't move on. That's the whole value of doing it this way.
- **If a phase runs long, we split it.** We don't rush it. Nothing here is a race.

## The stack, and why

| Choice | Why |
|---|---|
| React 19 + Vite 8 | The thing you're here to learn. Vite because it's the current default and the dev loop is instant. |
| Tailwind 4 | No config file needed anymore. Utility CSS is the dominant style in React work. |
| TanStack Query 5 | The highest-leverage library here. Replaces `HttpClient` + RxJS and appears on a large share of React job postings. |
| Express 5 + MongoDB Atlas | You write both halves. This is what makes you dangerous in a design round. |
| Mongoose | Schemas give your Phase 0 data model a real home, and it's what most Node jobs use. |
| JWT + bcryptjs | Real auth, no shortcuts, since you and your wife need separate accounts. |
| Vitest | Tests for the business rules, so you can verify logic without clicking. |
| Vercel + Atlas M0 | Free, no credit card, and no way to surprise-bill you. |

---

## Milestone A — React fundamentals

Local-only. Get React into your hands before adding a second language.

| # | Phase | Time | You end with |
|---|---|---|---|
| 0 | System design (no code) | 90m | `docs/DESIGN.md`, written by you |
| 1 | Toolchain: Vite + Tailwind | 45m | A styled page on your localhost |
| 2 | JSX, props, lists | 60m | Home screen renders, colour-coded, not clickable |
| 3 | Domain logic + Vitest | 60m | `npm test` green, screen unchanged (deliberately) |
| 4 | State: `useState` | 60m | Tapping an item cycles its colour |

## Milestone B — The backend

No React at all in these, except a login form at the end.

| # | Phase | Time | You end with |
|---|---|---|---|
| 5 | MongoDB Atlas + schemas | 75m | Real data in a real cloud database |
| 6 | Express REST API | 90m | A working API, tested without a browser |
| 7 | Real auth: JWT + bcrypt | 90m | Two accounts, one household, protected routes |

## Milestone C — Wire it up and ship it

**End of Milestone C is the finish line.** Everything after is optional.

| # | Phase | Time | You end with |
|---|---|---|---|
| 8 | TanStack Query | 90m | Two browsers; change one, the other follows |
| 9 | CRUD + shopping list | 75m | Every feature from your original brief |
| 10 | PWA + deploy + iPhone | 90m | Shelfie on both home screens, sharing live data |

## Milestone D — Stretch (optional, no rush)

| # | Phase | Time | You end with |
|---|---|---|---|
| 11 | Offline hardening | 75m | Works in the store with no signal |
| 12 | True realtime | 60m | Change streams over SSE, replacing polling |
| 13 | Interview story + AI roadmap | 60m | A STAR story, and the agent layer designed |

---

## Honest scope note

Milestones A–C are **eleven sessions of 60–90 minutes** to a real, shipped, two-user app.

That is a lot of new ground: a UI library, a build tool, a CSS framework, a server framework, a
database, an auth system, and a deployment target. Some of it will be frustrating. That's the job,
not a sign you're behind — and you have ten years of the hard-to-learn part already.

You do not need to do these back to back. The repo will wait.

## Phase briefs

Written just-in-time, one or two ahead of where you are, so each one can respond to the code you
actually wrote rather than the code I guessed you'd write.

- [`phases/00-system-design.md`](phases/00-system-design.md) ← start here
- [`phases/01-toolchain.md`](phases/01-toolchain.md)

## Reference

- [`ANGULAR-TO-REACT.md`](ANGULAR-TO-REACT.md) — your translation guide. Keep it open.
- `DESIGN.md` — you write this in Phase 0. It becomes the spec for everything after.
