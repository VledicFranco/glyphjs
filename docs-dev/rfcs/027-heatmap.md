# RFC-027: Heatmap

- **Status:** Proposed
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P1
- **Complexity:** M
- **Block type:** `ui:heatmap`

---

## 1. Summary

A 2D grid of color-coded cells for visualizing dense tabular data: status matrices (leaders × data sources), contribution calendars (days × weeks), correlation matrices, risk grids, and availability schedules.

## 2. Motivation

LLMs often surface cross-cutting tabular data where a **pattern** is the insight — which rows are hot, which cells are outliers, which regions cluster. A plain `Table` shows numbers; a heatmap makes the pattern jump out at a glance. Matrix is scoring-focused (interactive inputs with weighted totals) and does not fit passive tabular visualization. Chart's scatter or line modes do not render dense rectangular grids.

## 3. Schema

````yaml
```ui:heatmap
title: Data freshness across leaders
rows: [Alice, Bob, Carol, Dave]
cols: [Mongo, Sheets, HubSpot, GitHub, Sentry]
values:
  - [2, 8, 0.5, 1, 3]      # Alice
  - [4, 1, 2, 12, 0.5]     # Bob
  - [1, 0, 6, 3, 18]       # Carol
  - [24, 1, 2, 4, 2]       # Dave
scale: sequential
domain: [0, 24]
unit: hours
showValues: true
legend: true
```
````

### Zod schema

```typescript
const heatmapSchema = z
  .object({
    title: z.string().optional(),
    rows: z.array(z.string()).min(1),
    cols: z.array(z.string()).min(1),
    values: z.array(z.array(z.number().nullable())).min(1),
    scale: z.enum(['sequential', 'diverging']).default('sequential'),
    domain: z.tuple([z.number(), z.number()]).optional(),
    unit: z.string().optional(),
    showValues: z.boolean().default(false),
    legend: z.boolean().default(true),
  })
  .refine(
    (d) => d.values.length === d.rows.length && d.values.every((r) => r.length === d.cols.length),
    { message: 'values matrix dimensions must match rows × cols' },
  );
```

### Color semantics

- **sequential** — single-hue gradient (light → `--glyph-palette-color-1`). Default for non-negative data.
- **diverging** — two-hue gradient diverging from a midpoint (default: mean of `domain`). Midpoint is `--glyph-surface`, ends are `--glyph-palette-color-1` and `--glyph-palette-color-2`.
- `null` cells render as `--glyph-surface-muted` with a diagonal stripe to distinguish "no data" from zero.
- `domain` omitted → auto-compute from data extent.

## 4. Visual design

- Grid of equal-sized cells laid out as a CSS grid.
- Row labels along the left edge, column labels along the top.
- Column labels rotate to vertical if any label exceeds ~8 characters.
- Cells colored via `color-mix()` between scale endpoints based on `(value - domain[0]) / (domain[1] - domain[0])`.
- When `showValues: true`, cell text uses automatic contrast (white on dark cells, `--glyph-text` on light cells via a perceived-luminance threshold).
- Legend is a horizontal color bar with min/max tick marks and optional unit suffix.
- Responsive: on narrow viewports, the grid scrolls horizontally rather than shrinking cells below a readable minimum (~28px).

## 5. Accessibility

- Rendered as a `<table role="grid">` with `<th scope="col">` column headers and `<th scope="row">` row headers.
- Each cell is a `<td>` with `aria-label="{row}, {col}: {value} {unit}"`.
- Color is never the sole differentiator — the cell's numeric value is always readable via the screen-reader fallback, and `showValues: true` is recommended for data critical to comprehension.
- The legend is `role="img"` with `aria-label="Color scale: {min} to {max} {unit}"`.

## 6. Implementation notes

- No external dependency — pure CSS grid + `color-mix()`.
- Perceived-luminance formula for text contrast: `0.299*r + 0.587*g + 0.114*b` with threshold ~128.
- Cell size: default `minmax(32px, 1fr)` for responsive reflow; can be tightened if needed.
- For very large grids (> 1000 cells), consider CSS `content-visibility: auto` on row groups.
- Theme vars used: `--glyph-palette-color-1`, `--glyph-palette-color-2`, `--glyph-surface`, `--glyph-surface-muted`, `--glyph-border`, `--glyph-text`, `--glyph-text-muted`. No new component-specific vars needed.
