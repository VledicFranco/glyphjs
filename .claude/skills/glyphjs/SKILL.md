---
name: glyphjs
description: |
  GlyphJS authoring and development reference. Load when creating or editing GlyphJS documents,
  advising on ui: component selection, auditing documents for overuse or schema errors, or
  answering questions about the GlyphJS pipeline, component library, CLI, or theming system.
  Also applies when working on the GlyphJS codebase itself — adding components, writing schemas,
  updating the compiler, or running the release workflow.
---

# GlyphJS — Authoring & Development Reference

GlyphJS turns Markdown into interactive visual documents. Authors write regular Markdown with embedded `ui:*` fenced code blocks (YAML data); the pipeline compiles them to React components at render time.

**Pipeline:** Markdown → Parser (remark) → AST → Compiler → IR (JSON) → Runtime (React) → UI

**Version:** 0.8.0 | **Packages:** 9 public (`@glyphjs/*`) | **Components:** 29

---

## When to Use Components

**Use a component when:**

- Data has structure that a table, chart, or diagram conveys faster than prose
- The reader needs to interact (sort, filter, drill down)
- Visual hierarchy genuinely aids comprehension (steps, timelines, architecture)
- You're presenting metrics, comparisons, or relationships between entities

**Do NOT use a component when:**

- A sentence or short paragraph communicates the same thing just as clearly
- You're wrapping prose in a `ui:callout` just to make it look important
- The data set is 2-3 numbers (just write them inline)
- The structure is forced — component overuse buries the narrative
- You have more than 3-4 components per document section (cognitive load)

**Rule of thumb:** a document should be readable as plain Markdown with the `ui:` blocks removed. If the prose doesn't hold up without the components, rewrite the prose.

---

## Component Menu (29 total)

### Data Visualization

| Type              | Use for                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `ui:chart`        | Line, bar, area, OHLC time series — quantitative trend or comparison |
| `ui:table`        | Structured tabular data with sorting/filtering                       |
| `ui:graph`        | Node-edge relationship graphs (force-directed layout)                |
| `ui:relation`     | Entity relationship diagrams                                         |
| `ui:architecture` | System architecture diagrams with zones and connections              |

### Narrative & Progress

| Type           | Use for                                     |
| -------------- | ------------------------------------------- |
| `ui:timeline`  | Chronological events, roadmaps, history     |
| `ui:steps`     | Sequential how-to instructions or processes |
| `ui:flowchart` | Decision trees, conditional flows           |
| `ui:sequence`  | Message sequence / protocol diagrams        |
| `ui:mindmap`   | Topic hierarchies and concept maps          |

### Info Display

| Type             | Use for                                                  |
| ---------------- | -------------------------------------------------------- |
| `ui:callout`     | Highlighted tips, warnings, notes, info boxes            |
| `ui:kpi`         | Key metrics with labels, values, and trend indicators    |
| `ui:card`        | Individual content card with title, body, optional image |
| `ui:accordion`   | Collapsible FAQ or detail sections                       |
| `ui:comparison`  | Side-by-side option comparisons                          |
| `ui:infographic` | Mixed visual layout — icons, stats, mini-charts          |

### Code & Markup

| Type          | Use for                                          |
| ------------- | ------------------------------------------------ |
| `ui:codediff` | Before/after code diffs with syntax highlighting |
| `ui:equation` | LaTeX math equations                             |
| `ui:filetree` | Directory/file hierarchy                         |

### Interactive & Input

| Type          | Use for                                         |
| ------------- | ----------------------------------------------- |
| `ui:tabs`     | Tabbed content panels                           |
| `ui:quiz`     | Multiple-choice questions with feedback         |
| `ui:poll`     | Single-question voting                          |
| `ui:rating`   | Star rating input                               |
| `ui:ranker`   | Drag-to-rank ordered list                       |
| `ui:slider`   | Numeric range input                             |
| `ui:matrix`   | Grid of options (rows × columns)                |
| `ui:form`     | Multi-field input form                          |
| `ui:kanban`   | Kanban board with columns and cards             |
| `ui:annotate` | Image or diagram with click-to-annotate overlay |

---

## YAML Syntax Quick Reference

````markdown
```ui:chart
title: Revenue by Quarter
type: bar
xAxis:
  key: quarter
  label: Quarter
yAxis:
  key: revenue
  label: Revenue ($k)
series:
  - name: 2025
    data:
      - { quarter: Q1, revenue: 120 }
      - { quarter: Q2, revenue: 145 }
```
````

````

**Key rules:**
- YAML is strict — 2-space indent, no tabs
- String values with special characters need quotes
- `markdown: true` enables inline markdown in text fields

---

## CLI Reference

```bash
# Validate blocks — catch schema errors early
glyphjs lint doc.md
glyphjs lint doc.md --format json   # structured output
glyphjs lint doc.md --strict        # warnings → errors

# Schema introspection
glyphjs schemas chart               # JSON Schema for one type
glyphjs schemas --list              # all 29 type names
glyphjs schemas --all               # dump all schemas

# Compile to IR
glyphjs compile doc.md

# Export
glyphjs export doc.md --format pdf -o out.pdf
glyphjs export doc.md --format html -o out.html

# Live dev server
glyphjs serve doc.md
````

Exit codes: 0 = clean, 1 = errors, 2 = I/O failure. Always lint before exporting.

---

## Common Patterns

### KPI dashboard header

````yaml
```ui:kpi
metrics:
  - label: Total Users
    value: "12,400"
    trend: up
  - label: Churn Rate
    value: "2.1%"
    trend: down
````

````

### Callout types: `info | warning | error | success | tip`

### Chart types: `line | bar | area | ohlc`

### Inline markdown in text fields
```yaml
content: "Theme tokens reduced from **~155** to **53**. See [changelog](/changelog)."
markdown: true
````

---

## Anti-Patterns

- **Component soup** — 8+ components per section with minimal prose
- **Callout inflation** — every paragraph wrapped in a callout loses meaning
- **Chart for 3 data points** — just write the numbers inline
- **Steps for 2 steps** — a sentence is cleaner
- **Skipping lint** — schema errors fall back to silent error cards in the renderer

---

## Development Reference

### Package dependency order

`types` → `schemas` → `parser` → `ir` → `compiler` → `runtime` → `components` → `cli`

### Key commands

```bash
pnpm test             # 1726 tests, 7 expected skips
pnpm typecheck        # strict TS, no any
pnpm lint             # ESLint + Prettier
pnpm build            # Turborepo full build
pnpm release:minor    # bump + tag + GitHub release + CI publishes to npm
```

### Theme system (v0.8.0)

- **53 required tokens** in `GlyphThemeVars` (down from ~155)
- Tier 1: semantic tokens (`--glyph-*`) — required, TypeScript-enforced
- Tier 2: component-specific overrides (`--glyph-callout-*` etc.) — optional CSS-only
- Semantic state vars: `--glyph-color-success/warning/error/info`
- Shared palette: `--glyph-palette-color-1..10`
- Do NOT use `theme.isDark` or `theme.resolveVar()` — legacy

### Adding a new component

See `docs-dev/component-lifecycle.md` — 6 phases, 9 new files, 8 modified files.
Schema → Component + tests → Storybook → Docs → E2E → checklist.
