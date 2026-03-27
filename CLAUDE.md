# Mobile — Code Rules

## Design System — Quiet Luxury × Editorial Energy

> **CRITICAL:** Every screen must consume tokens exclusively via `useTheme()`. No hardcoded colors, no COLORS imports, no raw pixel values. The theme is the single source of truth.

### Theme Architecture

The theme system lives at `shared/theme/`:
- `theme.ts` — single source of truth: `buildTheme()`, `themes` map, all token types
- `ThemeContext.tsx` — `ThemeProvider`, `useTheme()`, `useThemeControls()`
- `index.ts` — barrel re-exports everything

### Color Schemes (2 schemes × 2 modes = 4 combinations)

| Scheme | Accent (light) | Accent (dark) | bg (light) | bg (dark) |
|--------|---------------|--------------|------------|-----------|
| **Jungle** | `#1A6B3C` | `#3D9A60` | `#F4F7F2` | `#080F0A` |
| **Amethyst** | `#6D28D9` | `#8B5CF6` | `#F9F7FF` | `#0A0614` |

### Color Token Reference (`colors.*`)

| Token | Purpose |
|-------|---------|
| `bg` | Page / screen background |
| `surface` | Bottom sheet, modal background |
| `elevated` | Cards slightly elevated above surface |
| `panel` | Skeleton, shimmer, muted bg |
| `inputBg` | Text input fill |
| `chipBg` | Inactive filter chip background |
| `navBg` | Tab bar with transparency/blur |
| `navSolid` | Sticky headers, CTAs bar (opaque) |
| `border` | Default dividers, card borders |
| `borderStrong` | Separators requiring more contrast |
| `accent` | Primary action color (scheme-dependent) |
| `accentMid` | Accent at ~60% opacity |
| `accentSubtle` | Accent tint for backgrounds (pill active) |
| `thread` | Decorative accent stripe |
| `textHigh` | Primary content, headings |
| `textMid` | Secondary labels, captions |
| `textLow` | Tertiary, disabled, placeholder |
| `textOnAccent` | White/cream text on accent backgrounds |
| `logoNeedle` | Logo needle element color |
| `logoThread` | Logo thread element color |

Semantic aliases on `colors`: `success`, `error`, `warning`, `info` (and their `*Subtle` variants).

### Typography (`typo.*`)

**Fonts:**
- `typo.fonts.display` — Cormorant Garamond Light (hero numbers, editorial moments only)
- `typo.fonts.serif` — Playfair Display Regular (section headings)
- `typo.fonts.serifBold` — Playfair Display Bold (screen titles, product names)
- `typo.fonts.sans` — DM Sans Regular (body, captions, labels)
- `typo.fonts.sansMed` — DM Sans Medium (chips, tags, secondary actions)
- `typo.fonts.sansBold` — DM Sans Bold (CTAs, prices, primary actions)

**Type scale (`typo.scale.*`):**

| Token | Size | Weight | Notes |
|-------|------|--------|-------|
| `hero` | 44 | 300 | Display only — hero stats, editorial moments |
| `title1` | 32 | 700 | Screen title (Playfair Bold) |
| `title2` | 26 | 700 | Card/section title |
| `title3` | 22 | 700 | Sub-section title |
| `subtitle` | 18 | 400 | Serif section labels |
| `body` | 16 | 400 | Default content |
| `bodySmall` | 14 | 400 | Secondary content |
| `caption` | 12 | 400 | +0.3 letter spacing |
| `label` | 11 | 500 | UPPERCASE, +1.5 letter spacing |
| `price` | 18 | 700 | Currency display |

Usage: `{ ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textHigh }`

### Spacing (`sp.*`) — 8pt Grid

| Token | Value |
|-------|-------|
| `px` | 1 |
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `base` | 16 |
| `lg` | 20 |
| `xl` | 24 |
| `2xl` | 32 |
| `3xl` | 40 |
| `4xl` | 48 |
| `5xl` | 64 |
| `6xl` | 80 |
| `7xl` | 96 |

### Border Radius (`r.*`)

| Token | Value | Use |
|-------|-------|-----|
| `sharp` | 4 | Tags, badges, counters |
| `sm` | 8 | Inputs, small chips |
| `md` | 12 | Cards, thumbnails |
| `lg` | 16 | Large cards |
| `xl` | 20 | Sheet headers |
| `2xl` | 28 | Bottom sheets |
| `pill` | 999 | CTAs, filter chips |

### Elevation (`elev.*`)

Always use the 4-prop shadow object — never write raw shadow props. Includes `elevation` for Android.

| Token | Use |
|-------|-----|
| `elev.none` | Flat surfaces |
| `elev.low` | Cards, chips |
| `elev.mid` | Modals, dropdowns |
| `elev.high` | Bottom sheets, sticky headers |

## Path Aliases

`@app/*` `@features/*` `@shared/*` `@services/*` `@store/*`

---

## TypeScript — Strict Mode Contract

> **CRITICAL:** The codebase runs with `strict: true`. Every file must compile with zero `any`, zero suppression comments, and zero implicit nullables escaping component boundaries.

### Compiler Flags (non-negotiable)

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                          // enables all strict* flags
    "noUncheckedIndexedAccess": true,        // arr[i] → T | undefined
    "exactOptionalPropertyTypes": true,      // undefined ≠ absent
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### No `any` — Ever

```typescript
// ❌ NEVER
const data: any = response.data
function parse(x: any) { ... }

// ✅ Use unknown at boundaries, then narrow
function parse(x: unknown): Product {
  if (!isProduct(x)) throw new Error('Invalid shape')
  return x
}
```

### Type Guards over Casts

```typescript
// ❌ Never cast away uncertainty
const user = response as User

// ✅ Validate with a type guard — TS narrows automatically
function isUser(v: unknown): v is User {
  return (
    typeof v === 'object' && v !== null &&
    'id' in v && typeof (v as Record<string, unknown>).id === 'string'
  )
}
```

### API / External Data — Validate at the Boundary

Always define a Zod (or hand-rolled) schema at the network boundary. Never trust `response.data` directly.

```typescript
import { z } from 'zod'

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().nullable(),
})

export type Product = z.infer<typeof ProductSchema>

// In your service — parse throws on bad shape, never silently passes garbage
const product = ProductSchema.parse(raw)
```

### Discriminated Unions for Async State

Never use `isLoading + error + data` as three separate booleans/nullables — that allows impossible states.

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// Exhaustive switch — TS enforces all branches are covered
switch (state.status) {
  case 'idle':    return <Placeholder />
  case 'loading': return <Skeleton />
  case 'success': return <List data={state.data} />
  case 'error':   return <ErrorBanner message={state.error} />
}
```

### Explicit Return Types on All Exported Functions

```typescript
// ❌ Inferred — silently breaks if the implementation drifts
export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

// ✅ Contract is explicit and stable
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
```

---

## Null & Undefined Safety

> **RULE:** A null or undefined must never reach JSX silently. Catch it at the source — not in the render.

### Optional Chaining + Nullish Coalescing

```typescript
const city  = user?.address?.city ?? 'Unknown'
const count = list?.length ?? 0
```

### Never Render Falsy Numbers

```typescript
// ❌ Renders the string "0" when list is empty
{list.length && <List items={list} />}

// ✅ Explicit boolean coercion — renders nothing
{list.length > 0 && <List items={list} />}
```

### Guard Arrays Before `.map()`

```typescript
// ❌ Crashes if items is undefined (e.g. API not yet resolved)
items.map(i => <Row key={i.id} item={i} />)

// ✅ Defensive fallback
;(items ?? []).map(i => <Row key={i.id} item={i} />)

// ✅ Even better — assert non-null in the schema so this is never needed
```

### Non-Null Assertion (`!`) is Banned in Component Code

```typescript
// ❌ Suppresses the error without fixing it
const name = user!.name

// ✅ Narrow with a guard or an early return
if (!user) return null
const name = user.name   // User from here, no ! needed
```

The only acceptable use of `!` is inside type guard bodies and test file utilities.

### Early Return Pattern

```typescript
// ✅ One guard at the top makes the rest of the component unconditionally safe
export function ProductCard({ product }: { product: Product | null }) {
  if (!product) return null
  return <Text>{product.name}</Text>  // product is Product — no ?. needed below
}
```

### Array Index Access (`noUncheckedIndexedAccess`)

With `noUncheckedIndexedAccess: true` enabled, `arr[0]` returns `T | undefined`. Always handle it:

```typescript
const first = items[0]
if (!first) return null
// first is T from here
```

---

## Style Architecture

> **RULE:** Styles live in one of three places depending on scope. Inline style objects scattered across JSX are banned except for values that are genuinely dynamic at runtime.

### The Three Layers

| Layer | Location | When to use |
|-------|----------|-------------|
| **Component stylesheet** | Bottom of the component file, `StyleSheet.create({})` | Static styles belonging to exactly one component |
| **Shared stylesheet** | `@shared/styles/<name>.ts` | Styles reused across 2+ components (card shell, row layout, etc.) |
| **Inline (dynamic only)** | `style={[styles.base, { opacity: animValue }]}` | Only for values driven by state, animation, or runtime props |

### Component Stylesheet Pattern

`StyleSheet.create` is called inside the component body after `useTheme()` so design tokens are correctly resolved, then re-memoised only when the theme changes.

```typescript
export function ProductCard({ product }: Props) {
  const { colors, sp, typo, r, elev } = useTheme()

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.base,
      ...elev.low,
    },
    title: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
  })

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{product.name}</Text>
    </View>
  )
}
```

### Dynamic Styles via Array

```typescript
// ✅ Compose static + conditional + animated cleanly
<View style={[styles.chip, isActive && styles.chipActive, { opacity: fadeAnim }]} />
```

### No Magic Numbers in JSX

```typescript
// ❌ 14 and 6 are unexplained — impossible to maintain
<View style={{ marginTop: 14, borderRadius: 6 }} />

// ✅ Tokens only — every value has a name and a reason
<View style={{ marginTop: sp.md, borderRadius: r.sm }} />
```

---

## React Native Best Practices

### Component Design

- **One responsibility per component.** If a component fetches data AND renders complex layout, split it into a container and a presentational component.
- **Props interfaces are always named and exported.**

```typescript
// ✅
export interface ProductCardProps {
  product: Product
  onPress: (id: string) => void
  isLoading?: boolean
}

export function ProductCard({ product, onPress, isLoading = false }: ProductCardProps) { ... }
```

- **Default prop values via destructuring,** not `defaultProps` (deprecated in modern React).
- **Never use inline objects/arrays as default prop values** — they are new references on every render and will break `memo`.

```typescript
// ❌ New array reference every render
function List({ items = [] }: { items?: Item[] }) { ... }

// ✅ Stable reference at module level
const EMPTY: Item[] = []
function List({ items = EMPTY }: { items?: Item[] }) { ... }
```

### Performance

- **`React.memo` on every pure presentational component** that appears inside a list or a frequently re-rendering parent.
- **`useCallback` on every handler passed as a prop.** Without it `memo` is useless — the child still re-renders on every parent render.
- **`useMemo` for expensive derivations only.** Wrapping a two-field object in `useMemo` is noise; wrapping a sort + format of 500+ items is not.
- **`keyExtractor` must return a stable, unique string.** Array index as key is never acceptable in dynamic lists.

```typescript
// ❌
keyExtractor={(_, i) => i.toString()}

// ✅
keyExtractor={item => item.id}
```

- **`getItemLayout` on FlatLists with fixed-height rows** — eliminates layout measurement on every scroll event.
- **`removeClippedSubviews` on long lists** (Android especially).

### Event Handlers

- Name handlers `handleX` inside the component; expose them as `onX` props.
- Never define inline arrow functions in JSX for anything non-trivial.

```typescript
// ❌ New function every render, breaks memo on child
<Button onPress={() => dispatch(addToCart(item.id))} />

// ✅
const handleAddToCart = useCallback(() => {
  dispatch(addToCart(item.id))
}, [dispatch, item.id])

<Button onPress={handleAddToCart} />
```

### State Rules

- **Co-locate state** — keep it in the lowest component that needs it. Only lift when siblings genuinely share it.
- **Never store derived data in state.** Compute it during render or in `useMemo`.
- **Never mutate state directly.**

```typescript
// ❌
state.items.push(newItem)
setState(state)

// ✅
setState(prev => ({ ...prev, items: [...prev.items, newItem] }))
```

### Custom Hooks

- Extract any logic shared across 2+ components into a custom hook immediately.
- Hook files: `@features/<feature>/hooks/use<Name>.ts` or `@shared/hooks/use<Name>.ts`.
- Return a typed named object, not a raw tuple (unless mirroring a built-in).

```typescript
export interface UseProductReturn {
  product: Product | null
  isLoading: boolean
  refetch: () => void
}

export function useProduct(id: string): UseProductReturn { ... }
```

### FlatList

- Prefer `FlatList` over `ScrollView` for any list that can exceed screen height.
- `contentContainerStyle` = inner padding; `style` = outer flex container. Never swap them.
- Always wrap `renderItem` in `useCallback`.

```typescript
const renderItem = useCallback<ListRenderItem<Product>>(
  ({ item }) => <ProductCard product={item} onPress={handlePress} />,
  [handlePress]
)
```

### Error Boundaries

Every screen-level route must be wrapped in an `ErrorBoundary`. Do not rely on the global unhandled-promise-rejection handler for render errors.

---

## Porting from Angular 21 — Translation Rules

> Angular 21 uses signals, standalone components, and `@if`/`@for` control-flow syntax. Map every Angular idiom to its React Native equivalent — do not carry Angular patterns into RN code.

### Concept Map

| Angular 21 | React Native equivalent |
|------------|------------------------|
| `Component` class | Function component |
| `signal()` | `useState` |
| `computed()` | `useMemo` |
| `effect()` | `useEffect` |
| `input()` / `@Input()` | Props |
| `output()` / `@Output()` | Callback props (`onX`) |
| `inject(Service)` | `useContext` or custom hook |
| `Injectable` singleton service | Zustand store slice |
| `HttpClient` + RxJS pipe | `async/await` in a service function |
| `AsyncPipe` | `useEffect` + state, or React Query |
| `@if` / `@else` | Ternary or early return |
| `@for` | `.map()` in JSX or `FlatList` |
| `@switch` | `switch` / discriminated union render |
| `Router` / `ActivatedRoute` | `useNavigation` / `useRoute` (React Navigation) |
| `Resolver` | `useEffect` data fetch or React Query `queryFn` |
| `CanActivate` guard | Navigation guard hook before screen render |
| `Pipe` (transform) | Plain TypeScript utility function |
| `NgClass` / `[class.x]` | `style={[styles.base, condition && styles.x]}` |
| `NgStyle` | Dynamic value in style array |
| `FormGroup` / `FormControl` | `react-hook-form` + Zod resolver |
| `Validators` | Zod schema |
| `ChangeDetectionStrategy.OnPush` | `React.memo` + `useCallback` on all handlers |
| `trackBy` | `keyExtractor` on FlatList |
| `ng-content` | `children` prop or named render props |
| `ViewChild` / `ElementRef` | `useRef` |
| `HostListener` | `onPress`, `onLayout`, `Pressable` callbacks |

### RxJS → Async/Await

Do not bring Observables into the mobile codebase. Convert at the service layer.

```typescript
// Angular service — DO NOT copy this pattern
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>('/products').pipe(
    map(res => res.filter(p => p.active)),
    catchError(() => of([]))
  )
}

// ✅ React Native service equivalent
async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await api.get<unknown>('/products')
    const products = z.array(ProductSchema).parse(res.data)
    return products.filter(p => p.active)
  } catch {
    return []
  }
}
```

If the Angular code uses `combineLatest` or `switchMap` to merge streams, model that with `Promise.all` or React Query parallel queries — not a custom Observable wrapper.

### Signals → State

```typescript
// Angular 21 — DO NOT copy
count = signal(0)
doubled = computed(() => this.count() * 2)
this.count.set(this.count() + 1)

// ✅ React Native
const [count, setCount] = useState(0)
const doubled = useMemo(() => count * 2, [count])
setCount(prev => prev + 1)
```

### Dependency Injection → Hooks / Stores

```typescript
// Angular — DO NOT copy
private cartService = inject(CartService)

// ✅ Global store (singleton-like)
const { addItem, items } = useCartStore()

// ✅ Scoped hook (local lifetime)
const { product, isLoading } = useProduct(productId)
```

### Template Syntax → JSX

```typescript
// Angular @if / @else — DO NOT copy
@if (user) { <span>{{ user.name }}</span> }
@else      { <span>Guest</span> }

// ✅ React Native
{user ? <Text>{user.name}</Text> : <Text>Guest</Text>}

// Angular @for — DO NOT copy
@for (item of items; track item.id) { <app-row [item]="item" /> }

// ✅ React Native — use FlatList, not .map(), for any scrollable list
<FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={renderItem}
/>
```

### Routing Params

```typescript
// Angular — DO NOT copy
const id = this.route.snapshot.paramMap.get('id')  // string | null

// ✅ React Navigation — typed, non-nullable when declared required in ParamList
const { id } = useRoute<ProductScreenRouteProp>().params
```

### Lifecycle Mapping

```typescript
// ngOnInit → initial data fetch
useEffect(() => { fetchProduct(id) }, [id])

// ngOnDestroy → cleanup
useEffect(() => {
  const sub = subscribe(...)
  return () => sub.unsubscribe()
}, [])

// ngOnChanges (react to a prop changing)
useEffect(() => { /* runs when id changes */ }, [id])
```

### What NOT to Port

- **Angular decorators** (`@Component`, `@NgModule`, `@Pipe`, `@Directive`) — replace with plain functions.
- **Zone.js change detection** — RN has no zone; all reactivity must flow through React state, context, or a store.
- **CSS classes / `::ng-deep`** — RN has no cascade; every style is explicit via `StyleSheet`.
- **`innerHTML` / DOM manipulation** — RN has no DOM; use conditional rendering and refs.
- **`platformBrowser` / `DOCUMENT` token** — irrelevant in RN.
- **`nativeElement` access** — replace with `useRef` + `measure` / `setNativeProps` (use sparingly).