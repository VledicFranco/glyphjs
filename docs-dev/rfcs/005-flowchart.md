# RFC-005: Flowchart

- **Status:** Implemented
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P3
- **Complexity:** L
- **Block type:** `ui:flowchart`

---

## 1. Summary

A flowchart component for rendering decision trees, process flows, and algorithms as directed graphs with typed nodes (start, end, decision, process) and labeled edges.

## 2. Motivation

LLMs frequently explain branching logic: "if X then do Y, else do Z." The Steps component only handles linear sequences, and Graph is too generic — it has no concept of decision diamonds, start/end terminals, or yes/no branches. A Flowchart component provides the right visual vocabulary for process and decision explanation.

## 3. Schema

````yaml
```ui:flowchart
title: Error Handling Flow
nodes:
  - id: start
    type: start
    label: Request received
  - id: validate
    type: process
    label: Validate input
  - id: valid
    type: decision
    label: Input valid?
  - id: process
    type: process
    label: Process request
  - id: error
    type: process
    label: Return 400 error
  - id: done
    type: end
    label: Return response
edges:
  - from: start
    to: validate
  - from: validate
    to: valid
  - from: valid
    to: process
    label: "Yes"
  - from: valid
    to: error
    label: "No"
  - from: process
    to: done
  - from: error
    to: done
````

````

### Zod schema

```typescript
const flowchartSchema = z.object({
  title: z.string().optional(),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['start', 'end', 'process', 'decision']).default('process'),
    label: z.string(),
  })).min(2),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
  })).min(1),
  direction: z.enum(['top-down', 'left-right']).default('top-down'),
});
````

## 4. Visual design

- **Start/End nodes**: Rounded rectangles (stadium shape), accent border.
- **Process nodes**: Rectangles with standard border.
- **Decision nodes**: Diamond shape, typically with "Yes"/"No" labeled edges.
- Edges are directed arrows with optional labels.
- Layout computed automatically (top-down by default, configurable to left-right).
- Rendered as SVG.
- Node colors follow the theme: `--glyph-surface-raised` background, `--glyph-text` labels, `--glyph-border` for edges.

## 5. Accessibility

- SVG has `role="img"` with `aria-label` describing the flowchart title and node count.
- Hidden accessible table listing all nodes and their connections (same pattern as Architecture).
- Edge labels included in the accessible table as relationship descriptions.

## 6. Implementation notes

- Reuse the Dagre layout engine already used by Graph and Relation. Dagre handles directed graph layout well and is already in the bundle. (Architecture uses ELK, which is a different layout engine.)
- Node shapes are rendered as SVG `<rect>`, `<polygon>` (diamond), or `<rect rx>` (rounded).
- Decision nodes need two outgoing edges — validate or render gracefully if fewer/more exist.
- The `direction` field maps to Dagre's `rankdir` option (`TB` or `LR`).
