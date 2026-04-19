# RFC-028: Sankey

- **Status:** Proposed
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P2
- **Complexity:** L
- **Block type:** `ui:sankey`

---

## 1. Summary

A flow diagram where directed ribbons between nodes have widths proportional to a flow value. Used for user journeys, budget allocation, energy flow, funnel-with-branching, and any "where does X go" question.

## 2. Motivation

LLMs frequently explain volumetric flow: "of 10k visitors, 3k signed up, of which 800 paid and 2.2k dropped". A `Flowchart` shows the _sequence_ of stages but hides the _magnitude_ — all edges look the same. A stacked-bar `Chart` shows magnitude but hides the branching topology. Sankey is the canonical primitive for "flow + magnitude + branching" in one diagram.

## 3. Schema

````yaml
```ui:sankey
title: Signup funnel
nodes:
  - { id: visitors, label: Visitors }
  - { id: signup,   label: Signed up }
  - { id: trial,    label: Started trial }
  - { id: paid,     label: Paid }
  - { id: drop,     label: Dropped off }
flows:
  - { from: visitors, to: signup, value: 3000 }
  - { from: visitors, to: drop,   value: 7000 }
  - { from: signup,   to: trial,  value: 1800 }
  - { from: signup,   to: drop,   value: 1200 }
  - { from: trial,    to: paid,   value: 600 }
  - { from: trial,    to: drop,   value: 1200 }
orientation: left-right
unit: users
```
````

### Zod schema

```typescript
const sankeySchema = z.object({
  title: z.string().optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        color: z.string().optional(),
      }),
    )
    .min(2),
  flows: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        value: z.number().positive(),
        label: z.string().optional(),
      }),
    )
    .min(1),
  orientation: z.enum(['left-right', 'top-down']).default('left-right'),
  unit: z.string().optional(),
});
```

## 4. Visual design

- Nodes render as rectangles at discrete columns (left-right) or rows (top-down), stacked vertically by total flow passing through each.
- Ribbons are cubic Bézier curves connecting node edges, width proportional to `value`.
- Ribbon color inherits from the source node (configurable), with 60–70% opacity so overlaps blend softly.
- Node position computed via topological sort → column assignment; vertical order within a column minimizes crossings (greedy heuristic).
- Node labels render outside the rectangle toward the nearest edge; total value rendered below label when space permits.
- Rendered as SVG.

## 5. Accessibility

- SVG has `role="img"` with `aria-label="Sankey diagram: {title}, {N} nodes, {M} flows"`.
- Hidden accessible `<table>` listing all flows as rows: from | to | value | (label). Same pattern as Architecture and Flowchart.
- Node labels rendered as SVG `<text>` (selectable, discoverable via screen-reader focus order).
- Ribbon colors have distinct enough hues in both light and dark themes via the palette; numeric values are always in the accessible table.

## 6. Implementation notes

- **No external dependency** — implement the layout algorithm in-package (~100 LOC). Reference: d3-sankey's iterative relaxation, but we do not need the full d3-sankey runtime. For a static, small-N diagram (< 30 nodes), a single-pass topological layout + a few crossing-minimization iterations is sufficient.
- Cycles are rejected at schema-validation time via `.refine()` — Sankey is strictly DAG.
- Flow conservation (total in = total out at intermediate nodes) is **not** enforced — authors may want to show "dropped off" as a terminal flow without explicitly routing it. Document this tradeoff in the component docs.
- Ribbon color: default = source node color (cycled through `--glyph-palette-color-1..10` by insertion order). Explicit `node.color` overrides.
- Theme vars used: `--glyph-palette-color-1..10`, `--glyph-text`, `--glyph-border`. No new component-specific vars.
