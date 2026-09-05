# Phase 0 — System design

**~90 minutes. No code. No `package.json`. Not a single npm command.**

That's deliberate, and if it feels like stalling, sit with that feeling — the urge to open an editor
before the design is settled is the exact instinct a senior design round is testing.

## How this session runs

Like a real frontend system design interview. I ask, you answer, I push back. You write the answers
into `docs/DESIGN.md` as we go.

The rules of a good design round apply here too:
- **Ask clarifying questions before designing.** Interviewers score this heavily and candidates skip it.
- **State your assumptions out loud.** An unstated assumption is a wrong answer waiting to happen.
- **Give a recommendation, not a menu.** "It depends" is only acceptable if you then say what it
  depends on and pick one.
- **Name what your design gives up.** Every design gives something up. Knowing what is what separates
  senior from mid.

Answer in your own words. Wrong answers we discuss; copied answers teach nothing.

---

## Part 1 — Requirements (~20 min)

Don't touch the data model yet. Interviewers watch for whether you rush this.

### Functional
1. In one sentence, what does this app do? If you can't say it in one sentence, the scope is wrong.
2. List the user-visible capabilities. Your original brief had eight — are all eight actually v1?
3. Who are the users? How many? What's their technical level?
4. What's the *primary* interaction — the one that happens most? Design the app around that one.

### Non-functional
5. How fresh must data be? "Both of us see the same value at all times" — what does *at all times*
   mean in seconds? Be specific; this number drives real architecture.
6. What happens with no network? You'll be in a Walmart, and signal in a big-box store is genuinely bad.
7. How much data, realistically? Items, users, growth per year. Order of magnitude is fine.
8. How fast must it feel? What's the budget for a tap registering?
9. What's the cost of data loss? If the list vanished tonight, what would that actually cost you?
   Be honest — this answer determines how much you should invest in durability.

### Out of scope
10. Write down what you are **not** building. Explicitly. Barcode scanning, price tracking, recipes,
    expiry photos, more than one household, sharing with anyone outside it.

> **Why this matters:** a written out-of-scope list is the cheapest defence against scope creep, and
> in an interview it's how you demonstrate you can be trusted with an ambiguous brief.

---

## Part 2 — Data model (~20 min)

11. What entities exist? You need at least three.
12. Write out the `Item` shape with field names and types. Include everything the UI needs — and
    nothing it doesn't.
13. **Does an `Item` belong to a user, or to a household?** Justify it. This is the single most
    consequential modelling decision in the app; get it wrong and the sharing feature is broken.
14. How does a user join a household? What does that flow look like from your wife's side, on her
    phone, with no help from you?
15. What are the categories? Are they a fixed list, or user-editable? What does each choice cost you?

### The status state machine
16. Statuses are `Stocked`, `Low`, `BuyNow`. Draw the legal transitions.
17. Tapping cycles `Stocked → Low → BuyNow → Stocked`. But there's a *second* way status changes:
    an item goes overdue based on `restockDays` and `lastBought`. Write that rule precisely.
18. **The important one:** should the overdue-derived status be *stored in the database* or *computed
    on read*? Argue both sides, then pick one.

    Hint on how to think about it: if it's stored, something has to write it — what runs, and when?
    What happens to an item nobody opens for a month? If it's computed, what does that cost on every
    read, and can two clients disagree?

19. When you tap something back to `Stocked`, `lastBought` becomes today. Is that always right? What
    about correcting a mistap?

---

## Part 3 — Architecture (~25 min)

20. Sketch the component tree. Which components exist and what does each own?
21. **Where does state live?** For each piece — the item list, the current tab, the edit form, the
    auth token — say which component or layer owns it and why.
22. Which state is **stored** vs **derived**? Specifically: is the shopping list its own collection,
    or a filter over items? Defend it.
23. Draw the request path, end to end: your thumb hits the screen → ... → the pixel changes on your
    wife's phone. Every hop.

### The API contract
24. Write the endpoints. Method, path, request body, response body, status codes. All of them.

    Do this *before* Phase 6 builds them. You'll discover in Phase 6 that you got some of this wrong,
    and noticing that gap yourself is worth more than my getting it right for you.

25. **Where does the business logic live?** `applyRestockRules` decides if an item is overdue. Client,
    server, or both? What breaks if only the client has it? What breaks if only the server does?
26. How does the server know who's calling, and how does it stop user A reading household B's items?
    Name the exact check and where it runs.

### Sync
27. Given your answer to Q5, how do the two phones stay in agreement? Push or pull? What interval?
28. **Conflict:** you tap an item to `BuyNow` at 5:00:01 while your wife taps the same item to
    `Stocked` at 5:00:02. Both phones sent a request. What's in the database at 5:00:03, and what does
    each phone show? Is that acceptable? What would it take to do better, and is that worth it here?
29. Your tap needs to feel instant, but the round trip is 200ms. How? And what happens on screen if
    that request then fails?

---

## Part 4 — Failure and trade-offs (~15 min)

30. List every way this breaks: network down, server down, Atlas down, token expired, two devices
    disagreeing, storage evicted, a bad deploy. For each: what does the user see?
31. **iOS Safari can evict local storage**, and an installed home-screen PWA has a separate storage
    bucket from the Safari tab. Given a server is the source of truth, how much does that actually
    hurt you? What does it break, and what's your mitigation?
32. Write the trade-offs table: what you chose, what you gave up, when you'd revisit.
33. What breaks first at 10× — 500 items, 20 households? At 100×? Be specific about *what* breaks,
    not just "it'd be slow."
34. What's the security posture? Where do passwords live, where does the token live, what's in the
    JWT, what could someone with your phone do?

---

## Part 5 — Write it up (~10 min)

Fill in `docs/DESIGN.md` from your answers. Structure:

```
1. Problem statement          — one paragraph
2. Requirements               — functional, non-functional, out of scope
3. Data model                 — entities, fields, relationships, the status state machine
4. Architecture               — component tree, state ownership, request path
5. API contract               — every endpoint
6. Sync strategy              — freshness target, mechanism, conflict handling
7. Failure modes              — what breaks, what the user sees
8. Trade-offs                 — chose / gave up / would revisit
9. Open questions             — what you genuinely don't know yet
```

Section 9 is not a weakness. "Here's what I'd need to validate" is a senior answer; pretending to
certainty you don't have is not.

---

## Reference: your real data

From your Walmart receipts. This becomes `shared/data/seed.js` in Phase 5.

**Dairy & Eggs** — Milk 2% (Seal) 7d · Eggs 18ct 7d · Eggs 12ct 10d · Paneer 7d · GV Oikos yogurt 10d · GV organic milk/cream 10d
**Produce** — Blueberries 7d · Blackberries 7d · Strawberries 7d · Guava 7d · Grapes 7d · Mandarins 10d · Shredded lettuce 7d · Tomato 7d · Garlic 14d · Ginger 14d · Red onion 14d · Russet potato 14d · Cherries (seasonal)
**Meat/Protein** — Chicken breast boneless 7d · Organic chicken breast 10d · Premier protein chicken 10d
**Bakery/Grains** — Chapatti 14d · Keto bread 10d · GV quick oats 14d · Maggi 2-min noodles 14d
**Pantry/Snacks** — 100% cacao 14d · Jell-O 14d · Dried cranberries 14d · Little Hearts biscuits 14d · Jim Jam biscuits 14d · Milk rusk 14d · Instant soup bowl 14d · Mustard 30d · Monk fruit sweetener 30d · Thai chili 14d
**Baby/Kids** — Huggies diapers 14d · Diaper liners 14d · Baby snack/jam 10d
**Household** — Dettol 1L 30d · Feminine hygiene 30d · Bottled water 14d

Note "Cherries (seasonal)" — it doesn't fit the `restockDays` model. Decide in Q12 what you do about
it. There's no single right answer; there is a wrong one, which is ignoring it until Phase 5.

---

## Done when

- `docs/DESIGN.md` is committed and pushed
- You can defend the stored-vs-computed decision (Q18) without rereading your notes
- You can state your sync freshness target in seconds and why
- You have a written out-of-scope list

Push it and I'll review it the way an interviewer would — including pushing back where I think you're
wrong.

**Next:** [`01-toolchain.md`](01-toolchain.md)
