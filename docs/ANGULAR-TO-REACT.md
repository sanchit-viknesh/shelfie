# Angular → React: your translation guide

You are not a beginner. You have ten years of component architecture, change detection, DI, and RxJS
in your head. Almost all of it transfers — the concepts are the same, the spelling is different.

This document is the spelling. Keep it open for the first few phases; you'll stop needing it around
Phase 4.

One framing that will save you a lot of confusion up front:

> **Angular is a framework that calls your class methods. React is a library that calls your whole
> function, over and over.**

Every surprise in this document comes from that one sentence.

---

## 1. Defining a component

**Angular**
```ts
@Component({
  selector: 'app-item-card',
  template: `<div class="card">{{ name }}</div>`,
})
export class ItemCardComponent {
  @Input() name!: string;
}
```

**React**
```jsx
export function ItemCard({ name }) {
  return <div className="card">{name}</div>;
}
```

That's the whole thing. No decorator, no class, no separate template, no module registration. A
component is a function that takes props and returns markup.

Note `className`, not `class` — `class` is a reserved word in JavaScript, and JSX is JavaScript.

## 2. Template syntax → JSX

| Angular | React | Note |
|---|---|---|
| `{{ value }}` | `{value}` | single braces |
| `[prop]="value"` | `prop={value}` | |
| `(click)="fn()"` | `onClick={fn}` | pass the function, don't call it |
| `*ngIf="cond"` | `{cond && <X />}` | or a ternary |
| `*ngIf/else` | `{cond ? <A /> : <B />}` | |
| `*ngFor` | `{items.map(...)}` | see §4 |
| `[class.on]="cond"` | `className={cond ? 'on' : ''}` | |
| `[ngClass]` | template string or `clsx` | |
| `[style.width.px]="w"` | `style={{ width: w }}` | object, camelCase, double braces |
| `<ng-content>` | `{children}` | |
| `\| date` pipe | `formatDate(x)` | just call a function; no pipes in React |

The mental shift: Angular templates are a **special language** with its own parser. JSX is **just
JavaScript** with an HTML-ish literal syntax. Anything inside `{}` is a real JS expression. That
means no `*ngIf` equivalent is needed — you use the language.

The flip side: there's no `| async` pipe, no built-in `| currency`. You call functions. This feels
like a downgrade for about a day, then feels like a relief.

## 3. Inputs and Outputs

**Angular**
```ts
@Input() item!: Item;
@Output() statusChange = new EventEmitter<Status>();
// this.statusChange.emit(newStatus)
```

**React**
```jsx
function ItemCard({ item, onStatusChange }) {
  return <div onClick={() => onStatusChange(nextStatus(item.status))}>...</div>;
}
```

`@Input` → a prop. `@Output` → **a prop that happens to be a function**. There is no separate event
system, no `EventEmitter`, no event bubbling through the component tree. A parent hands the child a
callback; the child calls it. That's it.

Convention: name callback props `onSomething`, and the handler that implements them `handleSomething`.

## 4. Lists: `*ngFor` and `trackBy`

**Angular**
```html
<app-item-card *ngFor="let item of items; trackBy: trackById" [item]="item" />
```

**React**
```jsx
{items.map(item => <ItemCard key={item.id} item={item} />)}
```

`key` is `trackBy`. Same purpose — identity across re-renders — but **`key` is not optional and
matters more.** In Angular a bad `trackBy` costs you performance. In React a bad `key` costs you
*correctness*: component state gets attached to the wrong row, inputs keep the wrong values, animations
jump to the wrong element.

**Never use the array index as a key** when the list can reorder, filter, or have items removed — which
is exactly what our shopping-list filter does. Use `item.id`.

## 5. Component state

**Angular** — a class property. Mutate it freely; zone.js notices.
```ts
export class Counter {
  count = 0;
  increment() { this.count++; }   // works fine
}
```

**React** — `useState`, and **you may not mutate**.
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);   // must call the setter
  return <button onClick={increment}>{count}</button>;
}
```

`useState` returns a pair: the current value and a setter. Calling the setter tells React "this
component's output is now stale, run its function again."

**This is the single biggest adjustment coming from Angular.** In Angular, `this.count++` works
because zone.js monkey-patches the browser and re-checks bindings after every async event. React does
no such thing. It has no idea anything changed unless you tell it via a setter.

### Updating objects and arrays

Because you can't mutate, every "change" is really "build a new one":

```js
// ADD — new array, spread the old
setItems([...items, newItem]);

// UPDATE ONE — map, replacing just the match
setItems(items.map(i => i.id === id ? { ...i, status: 'Low' } : i));

// REMOVE — filter
setItems(items.filter(i => i.id !== id));

// ✗ these do nothing visible — React never learns about them
items.push(newItem);
item.status = 'Low';
```

Why React works this way: it decides whether to re-render by comparing the old value to the new with
`Object.is`. If you mutate in place, old and new are *the same object reference*, the comparison says
"unchanged", and your UI silently doesn't update. This is the #1 bug you will write in your first
week. When something doesn't update on screen, check for a mutation first.

The upside, which you'll come to appreciate: state changes are explicit and traceable. There's no
"who changed this and when did change detection run" mystery.

## 6. Change detection

| | Angular | React |
|---|---|---|
| Trigger | zone.js patches async APIs, re-checks bindings | you call a state setter |
| Scope | dirty-checks the component tree | re-runs the component function and its children |
| Escape hatch | `OnPush`, `markForCheck`, `detach` | `memo`, `useMemo`, `useCallback` |
| Default cost | checks a lot, often | re-runs a lot, often |

`ChangeDetectionStrategy.OnPush` is the closest thing to how React always works: only re-render when
inputs change by reference. If you've used `OnPush` with immutable data in Angular, **you already
understand React's model** — React is `OnPush` everywhere, mandatory.

Don't reach for `memo`/`useMemo`/`useCallback` early. Re-running a function is cheap; premature
memoization is the most common way React codebases get unreadable. Optimize when you measure a
problem, which for a 50-item grocery list will be never.

## 7. Lifecycle → `useEffect`

**Angular**
```ts
ngOnInit()    { this.sub = this.svc.get().subscribe(...); }
ngOnDestroy() { this.sub.unsubscribe(); }
```

**React**
```jsx
useEffect(() => {
  const sub = subscribe();
  return () => sub.unsubscribe();   // cleanup — this IS ngOnDestroy
}, []);                              // dependency array
```

The dependency array is the whole game:

| Array | Runs |
|---|---|
| `[]` | once after first render — `ngOnInit` |
| omitted | after **every** render — almost always a bug |
| `[a, b]` | on first render, then whenever `a` or `b` changes by reference |

The returned function is cleanup: it runs on unmount *and* before each re-run of the effect.

**Important guidance that the older tutorials get wrong:** `useEffect` is for **synchronising with
something outside React** — a subscription, a browser API, a timer. It is *not* the way to respond to
user actions (do that in the event handler) and *not* the way to derive values from state (just
compute them during render). We'll use it in exactly two places in this whole app. If you find
yourself reaching for it a third time, that's a signal to stop and ask me.

## 8. Services and DI → hooks and context

This is the gap that will feel most uncomfortable, because Angular's DI is genuinely excellent and
React has nothing like it.

**Angular**
```ts
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private items$ = new BehaviorSubject<Item[]>([]);
  // injected wherever needed
}
```

**React** — a custom hook. Any function starting with `use` that calls other hooks.
```jsx
export function useInventory() {
  const [items, setItems] = useState([]);
  const cycleStatus = (id) => setItems(items.map(...));
  return { items, cycleStatus };
}

// in a component:
const { items, cycleStatus } = useInventory();
```

The critical difference: **a service is a singleton; a hook is not.** Two components calling
`useInventory()` get two *independent* copies of that state. A hook is a reusable recipe for
behaviour, not a shared instance.

When you genuinely need one shared instance across the tree — which is what `providedIn: 'root'`
gives you — that's **Context**, or in our case TanStack Query's cache, which is a shared store with a
hook interface. We'll hit this properly in Phase 8.

There's also no DI container, so no constructor injection and no swapping implementations via
providers. Testing seams come from passing things as arguments instead. That's why the plan puts our
business rules in `shared/domain/` as pure functions — pure functions need no injection to be testable.

## 9. Forms: `ngModel` → controlled inputs

**Angular**
```html
<input [(ngModel)]="item.name">
```

**React**
```jsx
<input value={name} onChange={e => setName(e.target.value)} />
```

Two-way binding doesn't exist. You wire both directions by hand: value flows down, events flow up.
`[(ngModel)]` was always just `[ngModel]` + `(ngModelChange)` — React makes you write both halves.

More verbose, and deliberately so: every keystroke goes through your code, so validation,
normalisation, and formatting have an obvious home. There's no `FormsModule` to import and no
`ReactiveFormsModule`; for anything complex, teams reach for React Hook Form. Our forms are small
enough not to need it.

## 10. HTTP and RxJS → TanStack Query

**Angular**
```ts
this.http.get<Item[]>('/api/items').subscribe(items => this.items = items);
```

**React (Phase 8)**
```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: () => fetch('/api/items').then(r => r.json()),
});
```

React ships no HTTP client at all — `fetch` is built into the browser and that's considered enough.
And there's no RxJS; JavaScript's own `async/await` covers most of what you used Observables for.

What you lose: operators. No `switchMap`, `debounceTime`, `combineLatest`. What you gain, via TanStack
Query: caching, deduplication, background refetching, retry, stale-while-revalidate, and optimistic
updates — as configuration rather than as an operator chain you assemble yourself.

Honestly, `useQuery` covers about 90% of what you built with `HttpClient` + RxJS, in about 20% of the
code. It is the library on this list most worth knowing for your next job.

## 11. NgRx → `useReducer`

You'll find this one already familiar.

```jsx
function inventoryReducer(state, action) {
  switch (action.type) {
    case 'cycle': return state.map(i => i.id === action.id ? {...i, status: next(i.status)} : i);
    default: return state;
  }
}
const [items, dispatch] = useReducer(inventoryReducer, []);
dispatch({ type: 'cycle', id: '123' });
```

Same reducer, same actions, same immutability rule. What's missing is the ceremony: no effects, no
selectors, no store module, no action creators unless you want them. `useReducer` is local to a
component by default — it's NgRx's reducer concept without the global store.

## 12. Odds and ends

| Angular | React |
|---|---|
| `@ViewChild` / `ElementRef` | `useRef` + `ref={myRef}` |
| Pipes | plain functions |
| `NgModule` / `declarations` | ES `import` — that's all |
| `ng-container` | `<>...</>` (fragment) |
| Structural directives | just JavaScript |
| Attribute directives | usually a wrapper component or a hook |
| `Renderer2` | direct DOM via `useRef` (rare) |
| Angular Router | React Router (we're skipping it — two views don't earn it) |
| `providedIn: 'root'` singleton | Context, or a store library |

---

## The five things that will actually trip you up

Everything above is vocabulary. These are the real conceptual traps.

**1. The component function body runs on every single render.**
Not once at construction — *every time*. Every `const` is recreated, every inline function is a new
object. There is no `constructor` that runs once. This is why `useState` exists: it's how a value
survives across those repeated calls.

```jsx
function ItemCard({ item }) {
  const expensive = doHeavyWork();  // runs on EVERY render, not once
  const [x, setX] = useState(0);    // survives across renders — this is the point
}
```

**2. Mutation does nothing.** Covered in §5, repeated here because you will hit it. When the screen
doesn't update, look for a mutated object before you look at anything else.

**3. Stale closures.** An event handler captures the values from *the render it was created in*.

```jsx
setTimeout(() => setCount(count + 1), 1000);      // uses count from THIS render — may be stale
setTimeout(() => setCount(c => c + 1), 1000);     // functional form — always current
```
Use the functional setter form whenever the new value depends on the old one. This has no Angular
equivalent because `this.count` always reads the live property; a closure over a `const` does not.

**4. State updates are asynchronous and batched.**
```jsx
setCount(count + 1);
console.log(count);   // still the OLD value — the re-render hasn't happened yet
```
Similar in spirit to reading a value before change detection runs, but it bites more often.

**5. `StrictMode` double-invokes things in development.** Your effects will run twice and your
console logs will appear twice on `npm run dev`. This is intentional — React is surfacing effects
that aren't safely repeatable. It does *not* happen in the production build. Don't spend an evening
debugging it like everyone else does.

---

## What genuinely transfers

Don't let the syntax churn make you feel like a beginner. All of this carries over unchanged:

- Component decomposition and deciding where boundaries go
- Smart/container vs presentational components — same idea, same value
- Immutable data flow (if you used `OnPush`, you were already doing React's model)
- Unidirectional data flow, lifting state to a common ancestor
- Reducers and actions, if you've used NgRx
- Everything you know about the browser, CSS, accessibility, and performance
- Architectural judgement — which is the part that actually makes you senior, and the part this
  project is really exercising

The syntax takes a week. The judgement took you ten years, and you already have it.
