# Phase 1 — Toolchain: Vite, React, Tailwind

**~45 minutes.** First code. By the end you'll have a styled page running on your own laptop with
instant hot reload.

Do not read ahead to Phase 2. Get this working first.

---

## 0. Prerequisites (5 min)

```bash
node -v    # need v20 or higher
npm -v
git --version
```

If Node is missing or below 20, install the LTS from [nodejs.org](https://nodejs.org) (or `nvm install --lts`).
Tell me if anything looks off before continuing.

Then get the repo onto your machine:

```bash
git clone <your-repo-url> shelfie
cd shelfie
git checkout claude/grocery-inventory-pwa-zpx1yu
```

**From here on, everything runs on your laptop, not in my session.** I can't see your localhost. Push
when you want me to look at something.

---

## 1. Scaffold the app (5 min)

From the repo root:

```bash
npm create vite@latest . -- --template react
npm install
npm run dev
```

Open http://localhost:5173. You should see the Vite + React starter.

> Note the `.` — we're scaffolding *into* the existing repo, not creating a subfolder. Vite will warn
> that the directory isn't empty and offer you options: choose **"Ignore files and continue"**, never
> "Remove existing files" (that would delete `docs/` and your git history).
>
> Vite's template ships its own `README.md`, so it may overwrite ours. If `git status` shows README
> modified after scaffolding, just restore it: `git checkout README.md`. Check that `docs/` survived
> before you go further.

### Concept: what `npm run dev` actually did

This is worth understanding properly, because it's genuinely different from `ng serve`.

**Angular CLI** bundles your whole app before serving it. Every file, through the build pipeline,
producing bundles, then serves those. Startup on a big app: tens of seconds. Every change triggers a
partial rebuild.

**Vite doesn't bundle in development at all.** It serves your source files directly to the browser as
native ES modules. The browser's own `import` statements do the work. Vite only transforms the
specific file you're requesting, on demand.

That's why startup is near-instant regardless of app size, and why saving a file updates the screen in
under 50ms. The tradeoff: dev and production use different pipelines (esbuild vs Rollup), so it's
possible — rare, but possible — for something to work in dev and break in the production build. That's
why Phase 10 has you run `npm run build` before deploying.

---

## 2. Tour the generated files (10 min)

Open each one. This is the map of your new world.

| File | What it is | Angular equivalent |
|---|---|---|
| `index.html` | **The real entry point.** Contains `<div id="root">` and a `<script type="module">`. | `index.html`, but Angular's is generated for you |
| `src/main.jsx` | Mounts React onto that div | `main.ts` + bootstrap |
| `src/App.jsx` | Root component | `AppComponent` |
| `src/index.css` | Global styles | `styles.css` |
| `vite.config.js` | Build config | `angular.json` (far smaller) |
| `package.json` | Deps + scripts | same |
| `public/` | Static files, copied verbatim | `assets/` |

Three things that should feel strange:

1. **`index.html` is at the project root, not in `src/`,** and it's the actual entry point Vite reads.
   Angular treats HTML as an output; Vite treats it as the source of truth.

2. **`main.jsx` is about six lines.** There's no module system, no `platformBrowserDynamic`, no
   `providers` array, no bootstrap ceremony. Read it — you'll understand all of it immediately.

3. **There is no `app.module.ts` and never will be.** Components are found through ordinary ES
   `import` statements. Nothing has to be declared anywhere. When you create a component in Phase 2,
   you import it and use it. That's the whole registration process.

Open `src/App.jsx` and change some text. Save. Watch the browser update without a reload — and note
that any state the page held would have survived. That's Hot Module Replacement.

---

## 3. Install Tailwind 4 (10 min)

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the plugin to `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace the **entire contents** of `src/index.css` with one line:

```css
@import "tailwindcss";
```

That's the full setup. **Tailwind 4 needs no `tailwind.config.js`** — if you find a tutorial telling
you to run `npx tailwindcss init`, it's written for v3 and will send you down a rabbit hole. There's
also no `content: []` array to configure any more; v4 scans automatically.

Now empty `src/App.jsx` down to this and confirm it's working:

```jsx
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-emerald-400">Shelfie</h1>
    </div>
  );
}
```

Dark background, green centred heading. If you get unstyled black-on-white text, Tailwind isn't
wired — check the plugin is in `vite.config.js` and restart the dev server.

### Concept: why utility classes aren't the antipattern you think

You've spent ten years being told not to put styling in markup, so `className="min-h-screen bg-slate-900 flex"`
should be setting off alarms. The objection is real and worth answering rather than dismissing.

What inline styles actually cost you: no media queries, no pseudo-selectors, no design constraints,
no reuse, and specificity chaos. Tailwind gives you all of those back — `hover:`, `md:`, `dark:`, and
a fixed scale of spacing and colour tokens you can't accidentally deviate from.

What you genuinely give up: readable markup. `class="card"` reads better than nine utilities. The
counter-argument is that you stop maintaining a parallel naming system, stop inventing names like
`.card__header--compact`, and never again wonder whether deleting a CSS rule breaks a page you forgot
about. Styles are colocated with the markup they style, and deleting the markup deletes the styles.

Reuse doesn't come from `@apply` (which recreates the problem) — it comes from **extracting a
component**. `<ItemCard>` is the reusable unit, not `.item-card`. That's the mental shift, and it
lands properly in Phase 2.

You don't have to love it. You do have to be able to work in it, because it's the dominant style in
React codebases and it will be in the job you take next.

---

## 4. Commit (5 min)

Check `.gitignore` covers `node_modules` and `dist` (Vite's scaffold handles this, but confirm — a
committed `node_modules` is a memorable mistake to make once).

```bash
git add -A
git commit -m "Phase 1: scaffold Vite + React + Tailwind"
git push -u origin claude/grocery-inventory-pwa-zpx1yu
```

---

## Done when

- `npm run dev` serves a Tailwind-styled page at localhost:5173
- Editing `App.jsx` updates the browser without a full reload
- It's committed and pushed

## Explain it back to me

1. Why does Vite start so much faster than `ng serve`, and what's the tradeoff?
2. What replaced `app.module.ts`, and how does React find your components?
3. Why is `index.html` at the root instead of inside `src/`?
4. What's the honest downside of utility CSS, and what do you get in exchange?

Push, answer these, and we'll start writing components.

**Next:** Phase 2 — JSX, props, and lists. I'll write that brief once I've seen your Phase 1 commit.
