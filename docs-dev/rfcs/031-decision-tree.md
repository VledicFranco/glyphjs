# RFC-031: DecisionTree

- **Status:** Proposed
- **Parent:** [RFC-002: Component Roadmap](./002-component-roadmap.md)
- **Priority:** P5
- **Complexity:** M
- **Block type:** `ui:decisiontree`

---

## 1. Summary

A hierarchical tree visualization where internal nodes represent decisions/questions with labeled branches, and leaf nodes represent outcomes. Used for routing logic explanations, policy documentation, reasoning traces (why the LLM recommended X), and any "if X then Y else Z" authoring that benefits from a tree layout.

## 2. Motivation

`Flowchart` handles general directed graphs including decisions, but it does not enforce tree structure, does not visually differentiate outcome leaves from internal questions, and its layout engine (Dagre) is overkill for the strictly-hierarchical case. When authoring explains _why a decision was made_ rather than _how a process flows_, the right primitive is a tree with outcome-styled leaves — clean left-to-right hierarchy, sentiment-colored endpoints, and condition labels on edges.

## 3. Schema

````yaml
```ui:decision-tree
title: Action routing
nodes:
  - { id: root,     type: question, label: User tier? }
  - { id: free,     type: question, label: Over free limit? }
  - { id: paid,     type: outcome,  label: Allow unlimited,    sentiment: positive }
  - { id: upgrade,  type: outcome,  label: Show upgrade prompt, sentiment: neutral }
  - { id: allow,    type: outcome,  label: Allow request,       sentiment: positive }
edges:
  - { from: root, to: free, condition: free }
  - { from: root, to: paid, condition: paid }
  - { from: free, to: upgrade, condition: "yes" }
  - { from: free, to: allow,   condition: "no" }
orientation: left-right
```
````

### Zod schema

```typescript
const decisionTreeSchema = z
  .object({
    title: z.string().optional(),
    nodes: z
      .array(
        z.object({
          id: z.string(),
          type: z.enum(['question', 'outcome']).default('question'),
          label: z.string(),
          sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
          confidence: z.number().min(0).max(1).optional(),
        }),
      )
      .min(1),
    edges: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
        condition: z.string().optional(),
      }),
    ),
    orientation: z.enum(['left-right', 'top-down']).default('left-right'),
  })
  .refine
  /* tree validity: exactly one root, every non-root has exactly one parent, no cycles */
  ();
```

The tree-validity refinement rejects: multiple roots, orphan nodes, cycles, and nodes with multiple parents. Every leaf (node with no outgoing edges) should have `type: outcome`, but the renderer tolerates missing types (defaults to `question`).

## 4. Visual design

- **Question nodes**: rounded rectangles, neutral surface color, standard border.
- **Outcome nodes**: pill-shaped (fully rounded), filled with sentiment color at reduced opacity — `positive` → soft green, `negative` → soft red, `neutral` → soft gray. Border uses the matching solid sentiment color.
- Edges rendered as orthogonal connectors (elbow lines, not bezier) to emphasize the hierarchical structure.
- **Condition labels** appear mid-edge on a small rounded background pill so they stay readable over the arrow.
- When `confidence` is set on a node, a small percentage badge appears at the bottom-right of the node (e.g., "0.82" or "82%"). Useful for annotating LLM reasoning traces.
- Orientation: `left-right` (default, tree flows left to right) or `top-down`.
- Rendered as SVG.

## 5. Accessibility

- SVG has `role="tree"` with `aria-label="{title}, {N} decisions, {M} outcomes"`.
- Each node is a `<g role="treeitem">` with `aria-level` computed from tree depth and `aria-label` including the node label and, for outcomes, the sentiment.
- Edges carry their condition label in a hidden `<desc>` so screen readers can announce "branch: {condition}" during tree traversal.
- Hidden accessible `<ol>` fallback rendering the tree as nested lists — one `<li>` per node with child `<ol>` for branches, condition labels as prefixes.

## 6. Implementation notes

- **No external layout dependency.** A simple recursive tree-layout algorithm (Reingold-Tilford or a naive "distribute children evenly under parent") is sufficient for trees up to ~50 nodes. This avoids pulling in Dagre for a strictly hierarchical case.
- Tree validity is enforced at schema time — the renderer assumes a valid tree and fails loudly if it is not (a thrown error in dev, an empty render in production).
- Outcome node color: use `color-mix(in srgb, var(--glyph-color-{sentiment}) 20%, var(--glyph-surface))` for the fill, and the full sentiment color for the border.
- Theme vars used: `--glyph-color-success`, `--glyph-color-neutral`, `--glyph-color-error`, `--glyph-surface`, `--glyph-surface-raised`, `--glyph-text`, `--glyph-border`, `--glyph-accent`. No new component-specific vars.
