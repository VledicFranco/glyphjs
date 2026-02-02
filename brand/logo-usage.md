# Logo Usage

The Glyph JS logo system consists of three variants: a logomark, a wordmark, and a combined lockup. All are geometric, angular, and monochrome with an optional cyan accent.

## Variants

### Logomark

A stylized angular "G" glyph — constructed from straight lines and precise angles, reminiscent of Oblivion's drone HUD markers. A single cyan stroke provides the accent.

- Minimum size: 24x24px
- Preferred size: 32x32px or larger
- Use when: favicons, app icons, small UI contexts

### Wordmark

"glyphjs" in a clean geometric sans-serif (Inter), all-lowercase, with generous letter spacing.

- Minimum size: 80px wide
- Use when: header navigation, footer attribution, contexts where the name needs to be readable

### Combo Lockup

Logomark positioned to the left of the wordmark, with a fixed 12px clear-space gap between them.

- Minimum size: 120px wide
- Use when: primary branding contexts, landing pages, documentation headers

## Clear Space

Maintain clear space around all logo variants equal to the height of the logomark's "G" character. No other elements (text, borders, icons) should intrude into this space.

```
┌─────────────────────────┐
│         clear            │
│   ┌───────────────┐      │
│   │   LOGO        │      │
│   └───────────────┘      │
│         clear            │
└─────────────────────────┘
```

## Color Usage

### On Light Backgrounds

- Primary: Dark text (`#0f1319`) with cyan accent (`#3a9bc8`)
- Monochrome: Dark text (`#0f1319`) only

### On Dark Backgrounds

- Primary: Light text (`#e8ecf1`) with cyan accent (`#5bb8db`)
- Monochrome: Light text (`#e8ecf1`) only

### Prohibited Color Treatments

- Do not apply gradients to the logo
- Do not use semantic colors (amber, red, green) on the logo
- Do not invert the cyan accent to a warm color
- Do not reduce the contrast below 4.5:1 against the background

## Misuse Examples

These treatments are **not permitted**:

1. **Stretching or skewing** — maintain original proportions at all times
2. **Adding drop shadows or glow effects** — contradicts the flat, functional aesthetic
3. **Rotating** — the logo must always appear at 0 degrees
4. **Placing on busy backgrounds** — ensure sufficient contrast and clear space
5. **Cropping or masking** — the full logo must be visible
6. **Changing the typeface** of the wordmark
7. **Rearranging** the lockup (e.g., stacking logomark above wordmark)

## Programmatic Access

The `@glyphjs/brand` package exports all logo variants as raw SVG strings and React components:

```ts
import { Logomark, Wordmark, ComboLogo } from '@glyphjs/brand';
import { logomarkSvg, wordmarkSvg, comboSvg } from '@glyphjs/brand';
```

See the package README at `packages/brand/` for API details.
