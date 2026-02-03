# RFC-010: MindMap

- **Status:** Draft
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P8
- **Complexity:** L
- **Block type:** `ui:mindmap`

---

## 1. Summary

A mind map component for visualizing hierarchical topic breakdowns as a radial or tree-style diagram branching outward from a central node.

## 2. Motivation

LLMs naturally decompose topics into subtopics: "Machine learning has three main branches: supervised, unsupervised, and reinforcement learning. Supervised learning includes..." This hierarchical breakdown is perfectly suited to a mind map. Unlike Graph (which shows arbitrary networks) or FileTree (which shows file hierarchies), a MindMap emphasizes conceptual relationships with a radial layout that puts the central topic in focus.

## 3. Schema

````yaml
```ui:mindmap
root: Machine Learning
children:
  - label: Supervised
    children:
      - label: Classification
      - label: Regression
  - label: Unsupervised
    children:
      - label: Clustering
      - label: Dimensionality Reduction
  - label: Reinforcement
    children:
      - label: Policy-based
      - label: Value-based
````

````

### Zod schema

```typescript
const mindmapNodeSchema: z.ZodType = z.object({
  label: z.string(),
  children: z.array(z.lazy(() => mindmapNodeSchema)).optional(),
});

const mindmapSchema = z.object({
  root: z.string(),
  children: z.array(mindmapNodeSchema).min(1),
  layout: z.enum(['radial', 'tree']).default('radial'),
});
````

## 4. Visual design

### Radial layout (default)

- Central node in the middle, rendered as a larger circle/rounded-rect with accent styling.
- First-level children radiate outward, evenly distributed around the center.
- Second-level children branch further outward from their parent.
- Curved connector lines from parent to child.
- Depth conveyed through decreasing node size and progressively muted colors.

### Tree layout

- Root at the top, children below in a top-down tree.
- Orthogonal or curved connectors.
- More compact for deep hierarchies.

Both layouts rendered as SVG.

### Styling

- Root node: `--glyph-accent` background, `--glyph-bg` text.
- Level 1 nodes: `--glyph-surface-raised` background, `--glyph-heading` text.
- Level 2+ nodes: `--glyph-surface` background, `--glyph-text` text.
- Connectors: `--glyph-border`.

## 5. Accessibility

- SVG has `role="img"` with `aria-label` describing the root topic and branch count.
- Hidden nested `<ul>` tree as an accessible representation (same pattern as FileTree's tree structure).
- Each node's label is readable by screen readers in the hidden tree.

## 6. Implementation notes

- **Radial layout**: Compute angles for each subtree based on its weight (number of descendants). Use polar-to-Cartesian conversion for positioning.
- **Tree layout**: Can reuse Dagre or a simpler recursive position algorithm since the structure is strictly hierarchical (no cycles).
- The recursive schema uses `z.lazy()` for self-referential nodes.
- Maximum rendered depth: 4 levels. If the data has deeper nesting, collapse levels 5+ into their parent node (show as a "+N" badge). This keeps the visual clean while preserving the data in the hidden accessible tree.
- Node labels may need to be truncated with ellipsis beyond a character threshold.
- Consider zoom/pan for large maps (but defer to v2 — keep v1 simple with a fit-to-container approach).
