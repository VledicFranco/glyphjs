# RFC-030: Gauge

- **Status:** Proposed
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P4
- **Complexity:** S
- **Block type:** `ui:gauge`

---

## 1. Summary

A single-value dial showing current position on a scale with colored threshold zones. Used for health metrics, quota usage, confidence scores, SLA adherence, and any "X out of Y with red/yellow/green bands" visual.

## 2. Motivation

`KPI` shows a number with a delta — great for "what changed". Gauge answers a different question: "where on the scale are we?" When a metric has explicit thresholds (critical/warning/healthy), a gauge makes the zone membership visually immediate in a way a number cannot. Cortex briefings frequently show "leader KPI vs CEO target band" — gauge is the natural primitive.

## 3. Schema

````yaml
```ui:gauge
label: Customer satisfaction
value: 78
min: 0
max: 100
unit: "%"
zones:
  - { max: 40,  label: Critical, sentiment: negative }
  - { max: 70,  label: Warning,  sentiment: neutral }
  - { max: 100, label: Healthy,  sentiment: positive }
target: 80
```
````

### Zod schema

```typescript
const gaugeSchema = z
  .object({
    label: z.string(),
    value: z.number(),
    min: z.number().default(0),
    max: z.number(),
    unit: z.string().optional(),
    zones: z
      .array(
        z.object({
          max: z.number(),
          label: z.string().optional(),
          sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
        }),
      )
      .min(1)
      .max(6)
      .optional(),
    target: z.number().optional(),
    shape: z.enum(['semicircle', 'full']).default('semicircle'),
  })
  .refine((d) => d.min < d.max, { message: 'min must be less than max' })
  .refine((d) => d.value >= d.min && d.value <= d.max, {
    message: 'value must fall within [min, max]',
  });
```

## 4. Visual design

- **Semicircle** (default): 180° arc from `min` (left) to `max` (right). The arc is divided into colored zones; a needle points at `value`. The numeric `value` and `unit` render in the center below the needle axis; the `label` renders below that in muted text.
- **Full** dial: 270° arc (from 7-o'clock to 5-o'clock clockwise). Same zone/needle semantics, rounder layout.
- Zone colors derive from `sentiment`: `negative` → `--glyph-color-error`, `neutral` → `--glyph-color-warning`, `positive` → `--glyph-color-success`. Unset sentiment → `--glyph-palette-color-N` cycled by zone index.
- When `target` is set, a thin accent-colored tick mark appears on the arc at the target position.
- Needle: a thin pointer anchored at the arc center. Smooth angular position from `value`.

## 5. Accessibility

- Rendered as a `<div>` wrapper with `role="meter"` (preferred over `progressbar` for gauges) and `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext="{value} {unit}, in {zone.label} zone"`.
- Zone labels are included in the `aria-valuetext` so screen-reader users know the semantic zone without color.
- Target, when set, adds a second sentence to `aria-valuetext`: "Target: {target} {unit}."
- SVG arcs and needle are `aria-hidden="true"` since the semantic data is on the wrapper.

## 6. Implementation notes

- Pure SVG. Arc path generated from `(cx, cy, radius, startAngle, endAngle)` via an `arcPath()` helper.
- Zones sorted ascending by `max`; each zone's arc spans from the previous zone's max (or `min`) to its own `max`.
- Needle angle: `startAngle + (value - min) / (max - min) * (endAngle - startAngle)`.
- The "pointer" tip of the needle sits `radius * 0.9` from the center; the tail extends `radius * 0.15` behind for visual balance.
- Zones limited to 6 to prevent visual clutter — at that count each zone is ~30° on a semicircle, which is the minimum useful arc length.
- Theme vars used: `--glyph-color-success`, `--glyph-color-warning`, `--glyph-color-error`, `--glyph-palette-color-1..10`, `--glyph-accent`, `--glyph-text`, `--glyph-text-muted`, `--glyph-border`. No new component-specific vars.
