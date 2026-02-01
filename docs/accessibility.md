# Accessibility — WCAG 2.1 AA Compliance

Glyph JS is committed to meeting **WCAG 2.1 Level AA** standards across all
components.  This document summarises the accessibility features built into the
library, keyboard navigation support, screen-reader considerations, and known
limitations.

---

## Compliance Statement

All built-in Glyph components and standard Markdown renderers have been
audited against WCAG 2.1 Level AA success criteria using:

- **axe-core** automated checks (via `jest-axe` integration tests)
- **Storybook addon-a11y** for visual review during development
- Manual keyboard and screen-reader testing

The automated test suite (`tests/a11y/audit.test.ts`) verifies that every
component produces **zero axe-core violations**.

---

## Per-Component Accessibility Features

### Callout (`ui:callout`)
| Feature | Detail |
|---------|--------|
| Semantic role | `role="note"` on the container |
| ARIA label | `aria-label` set to the callout type (Information, Warning, Error, Tip) |
| Decorative icon | Icon is `aria-hidden="true"` to avoid redundant screen-reader output |
| Color contrast | Icon colour is decorative; text relies on `--glyph-text` which defaults to high-contrast `#1a1a1a` |

### Tabs (`ui:tabs`)
| Feature | Detail |
|---------|--------|
| WAI-ARIA Tabs pattern | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Roving tabindex | Active tab has `tabIndex={0}`, inactive tabs `tabIndex={-1}` |
| ARIA attributes | `aria-selected`, `aria-controls`, `aria-labelledby` on tab/panel pairs |
| Keyboard navigation | ArrowLeft, ArrowRight to cycle; Home/End for first/last tab |
| Focus visibility | Tabs use the browser default focus outline (`outline: revert`) with `outline-offset: 2px` |

### Steps (`ui:steps`)
| Feature | Detail |
|---------|--------|
| Semantic list | Rendered as `<ol role="list">` |
| Per-step label | `aria-label="Step N: Title - Status"` on each `<li>` |
| Active step | `aria-current="step"` on the currently active step |
| Decorative indicators | Status circles and connector lines are `aria-hidden="true"` |

### Table (`ui:table`)
| Feature | Detail |
|---------|--------|
| Semantic role | `role="grid"` on `<table>` |
| Header scope | `scope="col"` on all `<th>` elements |
| Sortable headers | `aria-sort` (none/ascending/descending), `tabIndex={0}`, keyboard Enter/Space to toggle sort |
| Filter inputs | `aria-label="Filter {Column Name}"` on each filter input |

### Timeline (`ui:timeline`)
| Feature | Detail |
|---------|--------|
| Visual container | `role="img"` with `aria-label="Timeline with N events"` |
| Screen-reader fallback | Visually hidden `<ol>` with `<time dateTime="...">` for each event |
| Decorative elements | Markers, connectors, and visual labels are `aria-hidden="true"` |

### Chart (`ui:chart`)
| Feature | Detail |
|---------|--------|
| SVG container | `role="img"` with descriptive `aria-label` listing chart type and series names |
| Screen-reader fallback | Visually hidden `<table>` with `<caption>` containing all data points |
| Tooltip | `role="tooltip"` with `aria-live="polite"` for announcements on hover |

### Graph (`ui:graph`)
| Feature | Detail |
|---------|--------|
| SVG container | `role="img"` with `aria-label` describing type, node count, and edge count |
| Screen-reader fallback | Visually hidden `<table class="sr-only">` listing every node, its group, and its connections |
| Caption | `<caption>Graph nodes and connections</caption>` |

### Relation / ER Diagram (`ui:relation`)
| Feature | Detail |
|---------|--------|
| SVG container | `role="img"` with descriptive `aria-label` |
| Screen-reader fallback | Visually hidden `<table class="sr-only">` listing entities, attributes (with PK markers), and relationships (with cardinality) |
| Caption | `<caption>Entities and relationships</caption>` |

### Standard Markdown Renderers

| Renderer | Accessibility Notes |
|----------|-------------------|
| **GlyphHeading** | Semantic `<h1>`-`<h6>` elements with auto-generated `id` for anchor linking |
| **GlyphParagraph** | Semantic `<p>` elements |
| **GlyphList** | Semantic `<ol>`/`<ul>` with nested sub-lists |
| **GlyphCodeBlock** | `<pre><code>` with `aria-label="Code block ({language})"` |
| **GlyphBlockquote** | Semantic `<blockquote>` element |
| **GlyphImage** | `<figure>/<figcaption>` with `alt` text; images use `loading="lazy"` |
| **GlyphThematicBreak** | Semantic `<hr>` element |
| **InlineRenderer** | Semantic `<strong>`, `<em>`, `<del>`, `<code>`, `<a>`, `<img>`, `<br>` |

---

## Keyboard Navigation Guide

### Tabs

| Key | Action |
|-----|--------|
| `Tab` | Move focus into/out of the tab widget |
| `ArrowRight` | Activate next tab (wraps to first) |
| `ArrowLeft` | Activate previous tab (wraps to last) |
| `Home` | Activate first tab |
| `End` | Activate last tab |

### Table

| Key | Action |
|-----|--------|
| `Tab` | Move focus between sortable headers and filter inputs |
| `Enter` or `Space` | Toggle sort direction on focused header |

### Graph / Relation / Chart

These D3-rendered SVG components support **mouse-based zoom/pan** via
`d3.zoom`.  Keyboard users can access all data through the visually hidden
screen-reader fallback tables described above.

---

## Screen Reader Support

### D3/SVG Components

All SVG-based visualisations (Chart, Graph, Relation, Timeline) follow a
**dual-representation** strategy:

1. **Visual SVG** — rendered with `role="img"` and a descriptive `aria-label`.
   The SVG internals are decorative and hidden from the accessibility tree.

2. **Screen-reader fallback** — a visually hidden (`sr-only`) HTML table or
   ordered list that provides equivalent textual information.  These elements
   use absolute positioning with `clip: rect(0,0,0,0)` and `1px` dimensions
   to be invisible but readable by assistive technology.

### Tooltip Announcements

Chart tooltips use `role="tooltip"` with `aria-live="polite"` to announce
data-point details when hovered.

---

## Theming and Color Contrast

Glyph components derive their colours from CSS custom properties (e.g.,
`--glyph-text`, `--glyph-callout-info-bg`).  The default light theme uses
`#1a1a1a` text on light backgrounds, providing a contrast ratio well above
the 4.5:1 minimum required by WCAG 2.1 AA (SC 1.4.3).

When building a custom theme, ensure that:

- Body text meets **4.5:1** contrast against its background
- Large text (18pt or 14pt bold) meets **3:1** contrast
- UI controls and focus indicators meet **3:1** contrast against adjacent colours

---

## Known Limitations

1. **D3 zoom/pan** — The zoom and pan behaviour on Graph and Relation
   components is mouse/touch-only.  Keyboard users can access all data
   through the screen-reader fallback tables but cannot interact with the
   visual pan/zoom.

2. **OHLC chart tooltip** — Tooltip content is announced via `aria-live` but
   requires mouse hover to trigger; keyboard-only users can read data from
   the hidden table instead.

3. **Raw HTML renderer** (`GlyphRawHtml`) — Sanitises dangerous elements but
   cannot guarantee that user-supplied HTML is accessible.  Authors should
   ensure their raw HTML follows WCAG guidelines.

4. **Animation** — Glyph respects the system `prefers-reduced-motion` setting
   where CSS transitions are used.  D3-driven animations do not currently
   query this media feature.

---

## Testing

Run the full accessibility audit:

```bash
pnpm test
```

The a11y tests live in `tests/a11y/audit.test.ts` and use:

- **jest-axe** — wraps the axe-core engine for automated WCAG checks
- **@testing-library/react** — renders components in jsdom
- **@testing-library/user-event** — simulates keyboard interactions

The Storybook `@storybook/addon-a11y` panel also provides live violation
reporting during visual development (`pnpm --filter @glyphjs/components storybook`).
