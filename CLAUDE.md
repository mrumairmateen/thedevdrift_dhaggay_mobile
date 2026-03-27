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

