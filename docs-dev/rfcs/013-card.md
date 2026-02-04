# RFC-013: Card

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P11
- **Complexity:** S
- **Block type:** `ui:card`

---

## 1. Summary

A content card component for showcasing items, resources, or recommendations as a responsive grid of visually distinct cards with optional images, icons, body text, and action links.

## 2. Motivation

LLMs frequently recommend resources, showcase tools, or present curated lists: "Here are 4 libraries you should consider." Today this is rendered as bullet points or numbered lists, which lack visual hierarchy and make each item blend together. A Card component gives each item its own visual container with optional imagery, making the content scannable and engaging — similar to how product pages, blog rolls, and documentation landing pages present collections.

### Differentiation from KPI

KPI (`ui:kpi`) is purpose-built for numeric metrics with trend indicators and deltas — it answers "what are the key numbers?" Card (`ui:card`) is a general-purpose content container with images, body text, and action links — it answers "what are the key items to look at?" A KPI card showing "Revenue: $2.3M ▲15%" is fundamentally different from a Card showing a library recommendation with a description and a "View docs" link.

## 3. Schema

````yaml
```ui:card
title: Recommended Libraries
variant: elevated
columns: 3
cards:
  - title: Zod
    subtitle: Schema validation
    icon: "✅"
    body: >
      TypeScript-first schema validation with static type inference.
      Works great with forms and API boundaries.
    actions:
      - label: Documentation
        url: https://zod.dev
      - label: GitHub
        url: https://github.com/colinhacks/zod

  - title: Vite
    subtitle: Build tool
    icon: "⚡"
    body: >
      Next-generation frontend tooling with instant HMR
      and optimized production builds.
    actions:
      - label: Get Started
        url: https://vitejs.dev/guide/

  - title: Playwright
    subtitle: E2E testing
    image: https://playwright.dev/img/playwright-logo.svg
    body: >
      Reliable end-to-end testing for modern web apps.
      Cross-browser support out of the box.
    actions:
      - label: Documentation
        url: https://playwright.dev
```
````

### Zod schema

```typescript
const cardItemSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  body: z.string().optional(),
  actions: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      }),
    )
    .max(3)
    .optional(),
});

const cardSchema = z.object({
  title: z.string().optional(),
  variant: z.enum(['default', 'outlined', 'elevated']).default('default'),
  columns: z.number().min(1).max(4).optional(),
  cards: z.array(cardItemSchema).min(1).max(12),
});
```

## 4. Visual design

### Layout

- Renders as a responsive CSS Grid of cards (`grid-template-columns` based on `columns` or auto-calculated from card count).
- Default column count: 1 card → 1 column, 2 cards → 2 columns, 3+ cards → 3 columns. The `columns` field overrides this.
- Responsive: collapses to fewer columns on narrow viewports (2 cols on tablet, 1 col on mobile).

### Card anatomy

Each card has up to four zones, top to bottom:

1. **Image area** (optional) — If `image` is provided, renders at the top of the card with `object-fit: cover`, 16:9 aspect ratio, background color `--glyph-card-image-bg`.
2. **Header** — Icon (if provided, displayed inline before the title) + title (bold, `--glyph-heading`) + subtitle (muted, `--glyph-text-muted`).
3. **Body** (optional) — Paragraph text in standard body font.
4. **Actions footer** (optional) — Row of links styled as text buttons (`--glyph-link`), separated by a subtle top border.

### Variants

| Variant    | Appearance                                             |
| ---------- | ------------------------------------------------------ |
| `default`  | Subtle background (`--glyph-surface`), no border       |
| `outlined` | Transparent background, 1px border (`--glyph-border`)  |
| `elevated` | Surface background, box-shadow (`--glyph-card-shadow`) |

### CSS custom properties

- `--glyph-card-shadow` — Box shadow for the `elevated` variant. Default: `0 2px 8px rgba(0,0,0,0.1)`.
- `--glyph-card-image-bg` — Fallback background for the image area while loading. Default: `--glyph-surface-raised`.

## 5. Accessibility

- Outer container: `role="region"` with `aria-label` from the optional `title`.
- Card grid: `role="list"` on the grid container.
- Each card: `role="listitem"` wrapper containing a `<article>` element with `aria-labelledby` pointing to the card title.
- Images: `alt` text derived from the card title (e.g., "Illustration for Playwright").
- Icons: rendered with `aria-hidden="true"` since they are decorative — the title conveys the meaning.
- Action links: standard `<a>` elements with descriptive text (the `label` field). No additional ARIA needed.
- Keyboard: action links are naturally focusable. No custom keyboard handling required since there is no interactivity beyond standard links.

## 6. Implementation notes

- This is a pure layout component — no interactivity, no state, no graph computation. Complexity is S.
- The `image` field accepts a URL string. The renderer should use a standard `<img>` tag with `loading="lazy"` for performance. No image upload or processing is involved.
- The `icon` field is intended for emoji characters (single emoji or short string). The renderer should display it inline before the title at a slightly larger font size.
- If both `image` and `icon` are provided, `image` takes the top area and `icon` appears in the header. They are complementary, not mutually exclusive.
- Action links open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
- The `columns` auto-calculation is a convenience: `Math.min(cards.length, 3)`. The explicit `columns` field always wins.
- Max 12 cards keeps the component reasonable — beyond that, the author should split into multiple card blocks or use a different pattern.
