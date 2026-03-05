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

**Version:** 0.9.0 | **Packages:** 9 public (`@glyphjs/*`) | **Components:** 32

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

## Component Menu (32 total)

### Layout

| Type         | Use for                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| `ui:columns` | Horizontal grid; `ratio: [2,1]` distributes widths as CSS `fr` units            |
| `ui:rows`    | Vertical counterpart; nestable inside column cells for recursive 2D layouts     |
| `ui:panel`   | Styled wrapper (`card`, `bordered`, `elevated`, `ghost`) around one child block |

Children are **suppressed block variables** (`=_name`) resolved at compile time. See Variables & Layouts section.

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

`````

**Key rules:**
- YAML is strict — 2-space indent, no tabs
- String values with special characters need quotes
- `markdown: true` enables inline markdown in text fields

---

## Variables & Layouts (v0.9.0)

### Scalar variables

```markdown
---
vars:
  product: Acme Pro
---
Released **{{product}}** today.
```

Or use a `ui:vars` block anywhere in the document for the same effect.

### Block variables & suppressed blocks

```markdown
```ui:callout=status        ← renders AND binds to "status"
type: info
content: All systems nominal.
```

```ui:kpi=_metrics          ← suppressed: compiled but NOT rendered
metrics:
  - label: Uptime
    value: "99.97%"
    trend: up
```

{{status}}                  ← expands a clone of "status" here
```

### Layout components

Suppressed blocks → layout children:

```markdown
```ui:callout=_left
type: tip
content: Left panel.
```

```ui:kpi=_right
metrics:
  - label: MRR
    value: $48k
    trend: up
```

```ui:columns
ratio: [2, 1]
gap: 1.5rem
children: [left, right]
```
```

Nest `ui:rows=_name` inside a column for 2D layouts. `ui:panel` wraps one child:

```markdown
```ui:panel
child: metrics
style: elevated
padding: 1.5rem
```
```

### Parameterized templates

```markdown
```ui:callout=_alert(level,msg)
type: {{level}}
content: "{{msg}}"
```

{{alert("warning", "Deploy window in 1 hour.")}}
```

---

## CLI Reference

```bash
# Validate blocks — catch schema errors early
glyphjs lint doc.md
glyphjs lint doc.md --format json   # structured output
glyphjs lint doc.md --strict        # warnings → errors

# Schema introspection
glyphjs schemas chart               # JSON Schema for one type
glyphjs schemas --list              # all 32 type names
glyphjs schemas --all               # dump all schemas

# Compile to IR
glyphjs compile doc.md

# Export — PDF
glyphjs export doc.md --format pdf -o out.pdf
glyphjs export doc.md --format pdf --page-size A4 --landscape -o out.pdf
glyphjs export doc.md --format pdf --continuous -o out.pdf        # single tall page
glyphjs export doc.md --format pdf --margin "0.75in 1in" --padding "2rem" -o out.pdf
glyphjs export doc.md --format pdf --theme dark --theme-file themes/catppuccin-mocha.yml -o out.pdf

# Export — other formats
glyphjs export doc.md --format html -o out.html
glyphjs export doc.md --format md --images-dir ./imgs -o out.md   # PNG per block

# Render individual blocks as PNG
glyphjs render doc.md -o ./screenshots/ --device-scale-factor 2

# Live dev server
glyphjs serve doc.md
```

**Themes** (pass via `--theme-file themes/<name>.yml`):
`default` · `dark` · `minimal` · `high-contrast` · `warm` · `catppuccin-mocha` · `tokyo-night` · `solarized-dark` · `gruvbox-dark` · `nord` · `dracula` · `one-dark`

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
`````

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
pnpm test             # unit tests (Vitest)
pnpm typecheck        # strict TS, no any
pnpm lint             # ESLint + Prettier
pnpm build            # Turborepo full build
```

### Theme system

- **53 required tokens** in `GlyphThemeVars`
- Tier 1: semantic tokens (`--glyph-*`) — required, TypeScript-enforced
- Tier 2: component-specific overrides — optional CSS-only
- Semantic state vars: `--glyph-color-success/warning/error/info`
- Shared palette: `--glyph-palette-color-1..10`
- Do NOT use `theme.isDark` or `theme.resolveVar()` — legacy

### Variables system (v0.9.0)

- `packages/compiler/src/variables.ts` — `VarContext`, `createVarContext`, `expandScalarsInText`, `expandBlockVars`
- `vars:` frontmatter key or `ui:vars` block → scalar vars
- `ui:type=varName` → renders + binds; `ui:type=_varName` → suppressed
- `{{varName}}` as sole paragraph → block clone expansion
- `ui:type=_name(p1,p2)` + `{{name("a","b")}}` → parameterized templates
- Diagnostic codes: `UNDEFINED_VARIABLE`, `CIRCULAR_VARIABLE_REF`, `VARS_BLOCK_INVALID_VALUE`, `UNDEFINED_BLOCK_VAR`, `TEMPLATE_ARITY_MISMATCH`

### Layout components (v0.9.0)

- `compileLayoutBlocks()` in `packages/compiler/src/containers.ts`
- Two-pass resolution: suppressed vars first (enables nesting), then top-level blocks
- Children stored in `block.children`; rendered via `<BlockRenderer>` in each component
- `ui:rows` uses `height: 100%` so `fr` units work when nested in a column cell
- Diagnostic code: `LAYOUT_CHILD_UNDEFINED`

### Adding a new component

See `docs-dev/component-lifecycle.md` — 6 phases, 9 new files, 8 modified files.
Schema → Component + tests → Storybook → Docs → E2E → checklist.
