# RFC-029: Funnel

- **Status:** Proposed
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P3
- **Complexity:** S
- **Block type:** `ui:funnel`

---

## 1. Summary

An ordered series of stages rendered as a tapering shape showing conversion/dropoff between steps. Used for sales/signup funnels, action-acceptance rates, multi-step form completion, and any monotonically-decreasing sequence.

## 2. Motivation

Conversion funnels are one of the most common report visuals, but none of the existing primitives render them idiomatically: `Steps` is for instructional sequences with no quantity, `Chart` bar mode shows values without the visual tapering that makes the dropoff obvious, and `Sankey` is overkill when there's no branching — a single linear funnel collapses to a single ribbon. A dedicated Funnel component is small (< 200 LOC) and visually distinctive.

## 3. Schema

````yaml
```ui:funnel
title: Action acceptance (last 30 days)
stages:
  - { label: Recommended,  value: 420 }
  - { label: Reviewed,     value: 310 }
  - { label: Accepted,     value: 180 }
  - { label: Executed,     value: 155 }
showConversion: true
orientation: vertical
unit: actions
```
````

### Zod schema

```typescript
const funnelSchema = z
  .object({
    title: z.string().optional(),
    stages: z
      .array(
        z.object({
          label: z.string(),
          value: z.number().nonnegative(),
          description: z.string().optional(),
        }),
      )
      .min(2)
      .max(12),
    showConversion: z.boolean().default(true),
    orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
    unit: z.string().optional(),
  })
  .refine((d) => d.stages.every((s, i) => i === 0 || s.value <= d.stages[i - 1]!.value), {
    message: 'funnel stages must be monotonically non-increasing',
  });
```

## 4. Visual design

- Each stage renders as a trapezoid whose parallel edges are proportional to its own value and the previous stage's value (first stage = rectangle).
- Vertical orientation: trapezoids stack top-to-bottom, tapering downward. Horizontal: stacked left-to-right, tapering rightward.
- Each stage shows **label** (bold), **value** (monospaced for alignment), and optional **description** (muted).
- When `showConversion: true`, a small annotation between stages shows the percentage that advanced (e.g., "74%") and the drop count (e.g., "−110"). The drop uses `--glyph-color-error`; percentage uses `--glyph-text-muted`.
- Stage fill cycles through `--glyph-palette-color-1..N` unless only one color is appropriate (author can set via a future `monochrome: true` if requested).

## 5. Accessibility

- Rendered as an `<ol>` with each stage a `<li>`. `role` stays the default list role.
- Each `<li>` has `aria-label="Stage {N}: {label}, {value} {unit}, {pct}% of previous"`.
- Conversion annotations are decorative (`aria-hidden="true"`) because the information is encoded in the per-stage aria-labels.
- The monotonic-decrease invariant is a schema-level guarantee, so screen-reader users can rely on "stages in order, values decreasing".

## 6. Implementation notes

- Pure SVG (vertical orientation) or CSS clip-path (both orientations) — SVG is simpler for conversion annotations since they need absolute positioning near the trapezoid edges.
- Trapezoid widths (vertical) = `maxWidth * (value / maxValue)`. Heights are uniform across stages.
- The monotonic check is enforced in the Zod schema but the renderer should defensively clamp (treat out-of-order stages as equal to their predecessor) to avoid inverted trapezoids.
- Conversion rate = `stages[i].value / stages[i-1].value * 100`, shown with one decimal if < 10%, otherwise integer.
- Theme vars used: `--glyph-palette-color-1..10`, `--glyph-color-error`, `--glyph-text`, `--glyph-text-muted`. No new component-specific vars.
