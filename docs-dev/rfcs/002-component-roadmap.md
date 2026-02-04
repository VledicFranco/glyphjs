# RFC-002: Component Roadmap

- **Status:** Implemented
- **Authors:** VledicFranco
- **Created:** 2026-02-02

---

## 1. Summary

This RFC defines the roadmap for the next wave of Glyph UI components. The goal is to close the gap between what LLMs naturally produce and what GlyphJS can render as interactive, visually rich UI.

## 2. Motivation

GlyphJS currently ships 9 built-in components (Callout, Chart, Graph, Relation, Table, Tabs, Steps, Timeline, Architecture). These cover core data presentation and structural visualization, but several high-frequency LLM communication patterns remain unserved:

- LLMs compare options constantly, but Table is too generic for feature comparisons.
- LLMs explain code changes in nearly every coding conversation, but there's no diff view.
- LLMs describe branching logic and decision flows, but Steps only handles linear sequences.
- LLMs present key figures and summaries, but there's no metric/KPI primitive.
- LLM output is often too long for a single screen, but there's no progressive disclosure.

## 3. Design principles

Each new component must satisfy these criteria:

1. **LLM-generatable** — The YAML schema must be simple enough that an LLM can produce it reliably without complex nesting or cross-references.
2. **Text-superior** — The rendered UI must be meaningfully better than the same content in plain Markdown. If a bullet list works just as well, don't build a component.
3. **Theme-aware** — Uses CSS custom properties exclusively (`var(--glyph-*, fallback)`). Must be readable in both light and dark themes.
4. **Accessible** — WCAG 2.1 AA compliance, keyboard navigable, screen-reader friendly.
5. **Composable** — Works well alongside other Glyph components in a document.

## 4. Priority order

Components are ranked by the product of three factors:

- **Frequency** — How often does an LLM naturally produce this type of content?
- **Visual uplift** — How much better is the component vs. plain Markdown?
- **Feasibility** — Implementation complexity (S/M/L).

| Priority | Component       | Frequency | Uplift    | Size | RFC     |
| -------- | --------------- | --------- | --------- | ---- | ------- |
| P1       | Comparison      | Very high | High      | M    | RFC-003 |
| P2       | CodeDiff        | Very high | Very high | M    | RFC-004 |
| P3       | Flowchart       | High      | Very high | L    | RFC-005 |
| P4       | KPI             | High      | High      | S    | RFC-006 |
| P5       | Accordion       | High      | High      | S    | RFC-007 |
| P6       | FileTree        | High      | Medium    | M    | RFC-008 |
| P7       | SequenceDiagram | Medium    | Very high | L    | RFC-009 |
| P8       | MindMap         | Medium    | High      | L    | RFC-010 |
| P9       | Equation        | Medium    | Very high | M    | RFC-011 |
| P10      | Quiz            | Low       | Very high | M    | RFC-012 |
| P11      | Card            | High      | High      | S    | RFC-013 |
| P12      | Infographic     | Medium    | High      | M    | RFC-014 |

### Suggested batches

**Batch 1 (foundation):** Comparison, CodeDiff, KPI, Accordion
— Four components, mostly S/M complexity. Covers the highest-frequency gaps. Comparison and CodeDiff serve the two most common LLM patterns (comparing things, explaining code). KPI and Accordion are small utilities with broad applicability.

**Batch 2 (visualization):** Flowchart, FileTree, SequenceDiagram
— Adds structured diagramming. Flowchart and SequenceDiagram are L-sized but high value. FileTree is M-sized (keyboard navigation adds complexity beyond the recursive rendering).

**Batch 3 (advanced):** MindMap, Equation, Quiz
— Rounds out the set with topic exploration, math rendering, and the first interactive/bidirectional component.

**Batch 4 (presentation):** Card, Infographic
— Adds content presentation primitives. Card provides a general-purpose container for showcasing items with images, body text, and action links. Infographic provides multi-section visual summaries mixing stats, facts, progress bars, and text.

## 5. Existing component coverage map

For reference, here's what the full component set covers once all 12 are shipped:

| Communication pattern | Existing components           | New components           |
| --------------------- | ----------------------------- | ------------------------ |
| Present data          | Table, Chart                  | KPI                      |
| Compare options       | Table (generic)               | Comparison               |
| Show code changes     | —                             | CodeDiff                 |
| Explain processes     | Steps, Timeline               | Flowchart                |
| Show relationships    | Graph, Relation, Architecture | SequenceDiagram, MindMap |
| Show structure        | —                             | FileTree                 |
| Highlight / emphasize | Callout                       | —                        |
| Organize content      | Tabs                          | Accordion                |
| Math / science        | —                             | Equation                 |
| Interact / assess     | —                             | Quiz                     |
| Showcase / recommend  | —                             | Card                     |
| Visual data summary   | —                             | Infographic              |

## 6. Individual RFCs

Each component has its own RFC with schema design, visual specification, accessibility plan, and implementation notes:

- [RFC-003: Comparison](./003-comparison.md)
- [RFC-004: CodeDiff](./004-codediff.md)
- [RFC-005: Flowchart](./005-flowchart.md)
- [RFC-006: KPI](./006-kpi.md)
- [RFC-007: Accordion](./007-accordion.md)
- [RFC-008: FileTree](./008-filetree.md)
- [RFC-009: SequenceDiagram](./009-sequence-diagram.md)
- [RFC-010: MindMap](./010-mindmap.md)
- [RFC-011: Equation](./011-equation.md)
- [RFC-012: Quiz](./012-quiz.md)
- [RFC-013: Card](./013-card.md)
- [RFC-014: Infographic](./014-infographic.md)

## 7. Success criteria

The roadmap is complete when:

1. All 12 components pass the validation checklist in `docs-dev/component-lifecycle.md`.
2. Each component has Storybook stories with light/dark theme coverage.
3. Each component has a docs page with live preview.
4. Bundle size stays within the limit defined in `.size-limit.json` (may need an increase — track delta per batch).
5. The docs sidebar lists all 21 components (9 existing + 12 new).
