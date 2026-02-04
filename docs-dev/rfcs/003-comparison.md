# RFC-003: Comparison

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P1
- **Complexity:** M
- **Block type:** `ui:comparison`

---

## 1. Summary

A structured comparison component for displaying feature matrices, option evaluations, and side-by-side tradeoff analysis. Renders as a table layout with visual support indicators (checkmarks, crosses, badges).

## 2. Motivation

LLMs constantly compare options: frameworks, libraries, pricing plans, approaches. Today, authors use plain Markdown tables, but these lack visual hierarchy — a checkmark looks the same as a cross. A dedicated Comparison component provides color-coded support indicators, optional scoring, and a layout optimized for scanning.

## 3. Schema

````yaml
```ui:comparison
title: Frontend Frameworks
options:
  - name: React
    description: Component-based library
  - name: Vue
    description: Progressive framework
  - name: Svelte
    description: Compiler-based framework
features:
  - name: Learning curve
    values: [moderate, easy, easy]
  - name: TypeScript support
    values: [full, full, full]
  - name: Bundle size
    values: [large, medium, small]
  - name: SSR built-in
    values: [no, yes, yes]
  - name: Ecosystem size
    values: [very large, large, growing]
````

````

### Zod schema

```typescript
const comparisonSchema = z.object({
  title: z.string().optional(),
  options: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).min(2).max(6),
  features: z.array(z.object({
    name: z.string(),
    values: z.array(z.string()),
  })).min(1),
}).refine(
  (data) => data.features.every((f) => f.values.length === data.options.length),
  { message: 'Each feature must have one value per option' },
);
````

### Value conventions

Feature values are free-form strings, but the renderer recognizes special values for visual treatment:

| Value                 | Rendering          |
| --------------------- | ------------------ |
| `yes`, `true`, `full` | Green checkmark    |
| `no`, `false`, `none` | Red cross          |
| `partial`             | Yellow half-circle |
| Any other string      | Displayed as text  |

## 4. Visual design

- Header row shows option names and descriptions.
- Each feature is a row, with one cell per option.
- Recognized boolean values render as colored icons; free-text renders as-is.
- Optional title rendered above the component.
- Alternating row backgrounds for scanability (uses `--glyph-table-row-alt-bg`).
- Responsive: on narrow viewports, columns can scroll horizontally.

## 5. Accessibility

- Rendered as a `<table>` with `role="grid"`.
- Column headers (`<th>`) for option names.
- Row headers (`<th scope="row">`) for feature names.
- Visual indicators (checkmark/cross) include `aria-label` text (e.g., "Supported", "Not supported").
- Color is never the sole differentiator — icons have distinct shapes.

## 6. Implementation notes

- Reuse the Table component's CSS variable patterns (`--glyph-table-*`).
- Value normalization should be case-insensitive (`Yes` = `yes` = `YES`).
- Limit options to 6 columns max to prevent horizontal overflow on desktop.
- The `values` array length must match `options` array length — enforced by the schema's `.refine()` check. The renderer should also handle mismatches gracefully (render empty cells) as a defensive measure.
