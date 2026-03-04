# GlyphJS — Complete Feature Showcase

GlyphJS is a Markdown-to-interactive-UI rendering engine. You write ordinary Markdown enriched with `ui:` fenced code blocks, and the pipeline compiles everything into a polished, interactive document — locally, with no server, no build step, and no cloud dependency.

This document demonstrates two things in sequence: first, that GlyphJS renders all standard Markdown faithfully; second, that it extends Markdown with 28 interactive components covering data visualization, diagrams, content layout, and interactive widgets.

---

## Markdown Reference

A systematic index of every CommonMark element. Use this section to see exactly how the active theme colors, spaces, and contrasts each element.

### All heading levels

# H1 — Primary accent color

## H2 — Secondary palette color

### H3 — Heading with accent left bar

#### H4 — Heading text color, no decoration

##### H5 — muted · uppercase · tracked

###### H6 — smallest · muted · uppercase

### Inline typography

Plain body text flows at normal weight. Within a sentence: **bold text** picks up the heading color, _italic text_ stays in body color but slants, **_bold italic_** combines both, ~~strikethrough~~ draws a line through, and `inline code` switches to the monospace code palette with its own background tint.

You can nest freely: **bold containing `monospace code`**, \*italic containing **nested bold\***. Long italic runs look like this: _this entire sentence is set in italics to show the italic rendering across a fuller run of theme-colored body text — note the weight, slant angle, and color._

Hard line breaks are two trailing spaces:\
This line starts on a new line but belongs to the same paragraph block.

Escaped characters render literally: \*not italic\* \`not code\` \[not a link\] \# not a heading.

Special HTML entities: &amp; &lt; &gt; &copy; &mdash; &hellip;

### Unordered lists

- First top-level item
- Second item with **bold**, _italic_, and `code` inline
  - Nested item at depth 2 — note the accent-colored marker
  - Another nested item
    - Depth 3 — deeply nested, still themed
    - A second item at depth 3
  - Back to depth 2
- Third top-level item

### Ordered lists

1. First step
2. Second step with a longer description that intentionally wraps to demonstrate how multi-line list items look in the current theme — does the leading align cleanly with the text?
3. Third step
   1. Sub-step one
   2. Sub-step two
      1. Sub-sub-step — three levels deep
4. Fourth step, back at the top level

### Mixed nesting

- Category A
  1. First ordered item inside an unordered list
  2. Second ordered item
- Category B
  - Unordered sub-item
    1. Ordered inside unordered inside unordered
- Category C, no nesting

### Blockquotes

> A simple single-paragraph blockquote. The background is `--glyph-surface`, the left border is `--glyph-accent`, and the text uses `--glyph-text-muted`.

> A multi-paragraph blockquote.
>
> The second paragraph continues here. **Bold** and _italic_ and `code` work normally within blockquotes.
>
> — An attribution line in the same blockquote.

Nested blockquotes go one level deeper:

> Outer level of a nested quote. This sets up the context.
>
> > Inner level — a quote within a quote. Notice how the surface color layering creates visual depth.
> >
> > > Triple-nested. Most themes can handle at least three levels.

### Code blocks

An inline span: `const ir = await compile(markdown)` — monospace, code background, code text color.

A TypeScript fenced block:

```typescript
interface ThemeFileData {
  base: 'light' | 'dark';
  overrides: Record<string, string>;
}

function resolveThemeVars(
  base: ThemeFileData['base'],
  overrides: ThemeFileData['overrides'],
): Record<string, string> {
  const baseVars = base === 'dark' ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  return { ...baseVars, ...overrides };
}
```

A shell script:

```bash
# Export to every theme in one pass
for theme in themes/*.yml; do
  name=$(basename "$theme" .yml)
  glyphjs export doc.md \
    --format pdf \
    --theme-file "$theme" \
    --continuous \
    --padding "2rem 2.5rem" \
    -o "demo/demo-${name}.pdf"
done
```

A plain fenced block with no language tag:

```
This is unformatted preformatted text.
Monospace font, code background, no syntax highlighting.
Useful for output samples, ASCII diagrams, or terminal dumps.
```

### Tables

A standard table with a header row, body rows, and alternating stripe:

| Variable             | Role            | Dark default  | Light default |
| -------------------- | --------------- | ------------- | ------------- |
| `--glyph-bg`         | Page background | `#1a1a1a`     | `#ffffff`     |
| `--glyph-accent`     | Primary accent  | theme-defined | theme-defined |
| `--glyph-surface`    | Raised surface  | `#242424`     | `#f5f5f5`     |
| `--glyph-heading`    | Heading text    | `#f0f0f0`     | `#1a1a1a`     |
| `--glyph-text-muted` | Secondary text  | `#888`        | `#666`        |
| `--glyph-border`     | Subtle dividers | `#333`        | `#e0e0e0`     |
| `--glyph-code-bg`    | Code background | `#111`        | `#f0f0f0`     |
| `--glyph-code-text`  | Code text       | `#e0e0e0`     | `#333`        |

### Horizontal rules

Thematic breaks created with `---`:

---

And with `***`:

---

### Links

A [regular link to the GlyphJS docs](https://glyphjs.dev) uses `--glyph-link` color with a soft underline tinted from `--glyph-accent-muted`. On hover it shifts to `--glyph-link-hover`.

An [inline link with a title](https://glyphjs.dev 'GlyphJS Documentation') carries a tooltip title attribute.

Autolinks: <https://glyphjs.dev> and bare reference links are rendered the same way.

### Images

Images are max-width constrained and corner-rounded. A missing image shows the alt text:

![The GlyphJS pipeline: Markdown → Parser → Compiler → IR → Runtime → DOM](https://glyphjs.dev/og-image.png)

---

## Standard Markdown

Everything in this section is plain CommonMark. GlyphJS passes it through unchanged, rendered by whatever host environment you're using — a browser, Obsidian, a PDF export, or a static site.

### Text formatting

Paragraphs are separated by blank lines. Within a paragraph you can use **bold text** for emphasis, _italic text_ for softer stress, `inline code` for identifiers and values, and ~~strikethrough~~ when you need to show something has been removed.

You can combine these freely: a **`typed constant`** or an _italicized phrase with a **nested bold** inside it_. GlyphJS does not restrict how Markdown inline syntax nests.

### Lists

Unordered lists work with `-`, `*`, or `+` markers:

- Parser — transforms `ui:*` fenced blocks into AST nodes via a remark plugin
- Compiler — walks the AST and produces a typed JSON Intermediate Representation (IR)
- Runtime — a React rendering engine that takes the IR and produces interactive DOM
- Components — 28 built-in components, each with a Zod schema and a React renderer

Ordered lists use numeric prefixes:

1. Write a Markdown file with embedded `ui:` code blocks
2. Run `glyphjs export document.md --format pdf -o output.pdf`
3. Open the PDF — components are fully rendered, no JavaScript required

Lists can nest up to any depth:

- `@glyphjs/types` — shared TypeScript interfaces
  - `Block` — the fundamental unit of the IR
  - `GlyphIR` — the complete document representation
- `@glyphjs/schemas` — Zod schemas for all 28 components
  - Used for validation at parse time
  - Used for JSON Schema generation via `glyphjs schemas`

### Blockquotes

> **Design principle:** A document format should compose with its host environment, not fight it. GlyphJS components are defined in plain YAML inside standard fenced code blocks — any Markdown editor that doesn't know GlyphJS shows the YAML source; any environment that does renders the component.

Blockquotes can hold any block-level content, including nested quotes:

> The pipeline is stateless and deterministic.
>
> > Every IR produced from the same Markdown input is byte-for-byte identical.
> > This makes diffs, caching, and incremental builds trivial.

### Code blocks

Fenced code blocks with language identifiers get syntax highlighting in most renderers:

```typescript
import { compile } from '@glyphjs/compiler';

const ir = await compile(`
# My Document

\`\`\`ui:callout
type: tip
title: Hello world
content: GlyphJS compiled this.
\`\`\`
`);

console.log(ir.blocks[0].type); // "callout"
```

```yaml
# A GlyphJS theme file — only override what you need.
# The base system fills in the rest.
base: dark
variables:
  --glyph-bg: '#1e1e2e'
  --glyph-accent: '#cba6f7'
  --glyph-heading: '#cdd6f4'
```

### Tables

Markdown tables are rendered as styled HTML tables:

| Package             | Role             | Key export                          |
| ------------------- | ---------------- | ----------------------------------- |
| `@glyphjs/types`    | Type definitions | `Block`, `GlyphIR`                  |
| `@glyphjs/schemas`  | Validation       | `componentSchemas`, `getJsonSchema` |
| `@glyphjs/compiler` | Compilation      | `compile()`                         |
| `@glyphjs/runtime`  | React rendering  | `createGlyphRuntime()`              |
| `@glyphjs/cli`      | CLI tooling      | `glyphjs` binary                    |

### Links and images

The [GlyphJS documentation](https://glyphjs.dev) covers the full component reference, theming guide, and CLI usage. The source is at [github.com/VledicFranco/glyphjs](https://github.com/VledicFranco/glyphjs).

### Horizontal rules

A thematic break separates sections with visual weight:

---

Everything above is standard Markdown. Everything below is rendered by GlyphJS.

---

## GlyphJS Components

The following components are rendered by the GlyphJS runtime. Each `ui:` block is a YAML object validated against its Zod schema, compiled to IR, and mounted as a React component.

---

## Callout

```ui:callout
type: tip
title: Plugin is working!
content: GlyphJS renders natively in Obsidian with full theme sync.
```

## Table

```ui:table
columns:
  - key: component
    label: Component
  - key: status
    label: Status
  - key: phase
    label: Phase
rows:
  - component: Callout
    status: "✓ Rendering"
    phase: "1"
  - component: Table
    status: "✓ Rendering"
    phase: "1"
  - component: Chart
    status: "✓ Rendering"
    phase: "1"
  - component: Live Preview
    status: Pending
    phase: "2"
```

## Chart

```ui:chart
type: bar
series:
  - name: Bundle (MB)
    data:
      - x: All components
        y: 19
      - x: Without ELK
        y: 11
      - x: Without ELK+KaTeX
        y: 8
  - name: Gzip (MB)
    data:
      - x: All components
        y: 3.7
      - x: Without ELK
        y: 2.1
      - x: Without ELK+KaTeX
        y: 1.6
```

## KPI

```ui:kpi
metrics:
  - label: Components
    value: "28"
    unit: total
  - label: Bundle (gzip)
    value: "3.7"
    unit: MB
  - label: Phase
    value: "1"
    unit: of 3
```

## Steps

```ui:steps
steps:
  - title: Phase 1 — Reading view
    content: Bundle all packages. Register MarkdownPostProcessor. Mount React roots via MarkdownRenderChild. Ship with theme sync.
  - title: Phase 2 — Live preview
    content: CM6 StateField with widget decorations. Cursor-aware block hiding. Debounced compile().
  - title: Phase 3 — Deep integration
    content: Full theme mapping. Settings panel. Export-to-PDF command. Mobile support.
```

## Timeline

```ui:timeline
events:
  - date: "2026-03-01"
    title: POC started
    description: Created packages/obsidian-plugin in the glyphjs monorepo
  - date: "2026-03-02"
    title: Reading view working
    description: All 28 components rendering with Obsidian theme sync confirmed
  - date: TBD
    title: Phase 2 — Live preview
    description: CM6 StateField for in-editor component preview
```

## Graph

```ui:graph
type: dag
nodes:
  - id: md
    label: Markdown
  - id: parser
    label: Parser
  - id: compiler
    label: Compiler
  - id: ir
    label: IR
  - id: runtime
    label: Runtime
  - id: dom
    label: DOM
edges:
  - from: md
    to: parser
  - from: parser
    to: compiler
  - from: compiler
    to: ir
  - from: ir
    to: runtime
  - from: runtime
    to: dom
```

## Relation

```ui:relation
entities:
  - id: plugin
    label: Plugin
  - id: vault
    label: Vault
  - id: note
    label: Note
  - id: component
    label: Component
relationships:
  - from: vault
    to: note
    cardinality: 1:N
    label: contains
  - from: plugin
    to: note
    cardinality: 1:N
    label: reads
  - from: note
    to: component
    cardinality: 1:N
    label: embeds
```

## Architecture

```ui:architecture
children:
  - id: obsidian
    label: Obsidian
    children:
      - id: vault
        label: Vault
      - id: workspace
        label: Workspace
  - id: plugin
    label: GlyphJS Plugin
    children:
      - id: postprocessor
        label: PostProcessor
      - id: compiler
        label: Compiler
      - id: runtime
        label: Runtime
      - id: theming
        label: Theme Sync
edges:
  - from: workspace
    to: postprocessor
    label: triggers
  - from: postprocessor
    to: compiler
    label: source
  - from: compiler
    to: runtime
    label: IR
```

## Accordion

```ui:accordion
sections:
  - title: Why not registerMarkdownCodeBlockProcessor?
    content: Obsidian internally uses the language identifier as a CSS class selector (code.language-ui:callout). The colon makes this an invalid selector — Obsidian throws a SyntaxError. registerMarkdownPostProcessor avoids this entirely.
  - title: How does theme sync work?
    content: getComputedStyle(document.body) reads Obsidian's CSS custom properties at runtime. These are mapped to GlyphJS --glyph-* variable values and passed as a custom GlyphTheme object to createGlyphRuntime().
  - title: What about mobile?
    content: Desktop only for v1. @glyphjs/ir uses Node.js crypto for block ID hashing — unavailable on iOS/Android. A browser-compatible SHA256 shim would fix this.
```

## Comparison

```ui:comparison
title: Integration approach
options:
  - name: Bundled packages
  - name: CLI bridge
features:
  - name: Works offline
    values:
      - "Yes"
      - "No"
  - name: Full interactivity
    values:
      - "Yes"
      - "No"
  - name: Community plugin eligible
    values:
      - "Yes"
      - "No"
  - name: Always latest version
    values:
      - "No"
      - "Yes"
```

## Tabs

```ui:tabs
tabs:
  - label: Overview
    content: |
      The GlyphJS Obsidian plugin renders interactive components natively in reading view.
      Uses `registerMarkdownPostProcessor` to scan rendered HTML for `ui:*` code blocks.
      Each block is compiled independently and mounted with React via `MarkdownRenderChild`.
  - label: Pipeline
    content: |
      1. `registerMarkdownPostProcessor` fires per section
      2. Scan `pre > code[class^=language-ui]` elements
      3. Extract block type + YAML from `getSectionInfo()`
      4. Call `compile()` to get IR
      5. Mount `createGlyphRuntime().GlyphDocument` in a replacement `<div>`
  - label: Theme
    content: |
      `getComputedStyle(document.body)` reads Obsidian CSS vars at runtime.
      These override GlyphJS built-in light/dark theme defaults.
      Re-synced on every `css-change` workspace event (theme switch, custom CSS reload).
```

## Card

```ui:card
cards:
  - title: "@glyphjs/compiler"
    description: Parses Markdown + YAML into a JSON IR. 14-step pipeline.
    tags:
      - typescript
      - remark
      - unified
  - title: "@glyphjs/runtime"
    description: React rendering engine with plugin registry and theme system.
    tags:
      - react
      - typescript
  - title: "@glyphjs/components"
    description: 28 built-in UI components covering data viz, interaction, and diagrams.
    tags:
      - d3
      - dagre
      - elkjs
```

## Infographic

```ui:infographic
sections:
  - items:
      - type: stat
        label: Components
        value: "28"
      - type: stat
        label: Bundle raw
        value: "19 MB"
      - type: stat
        label: Bundle gzip
        value: "3.7 MB"
      - type: stat
        label: Min Obsidian
        value: "1.5.0"
```

## CodeDiff

```ui:codediff
before: |
  // Old approach — broken with colons
  this.registerMarkdownCodeBlockProcessor(
    "ui:callout",
    (source, el, ctx) => {
      ctx.addChild(new GlyphBlockChild(el, source));
    }
  );
after: |
  // New approach — works reliably
  this.registerMarkdownPostProcessor((el, ctx) => {
    const codeBlocks = el.querySelectorAll('pre > code');
    for (const code of codeBlocks) {
      if (!code.className.startsWith('language-ui')) continue;
      // extract type + source, mount React root
    }
  });
```

## FileTree

```ui:filetree
tree:
  - name: packages
    children:
      - name: obsidian-plugin
        children:
          - name: src
            children:
              - name: main.ts
              - name: theme-sync.ts
          - name: manifest.json
          - name: esbuild.config.mjs
          - name: styles.css
          - name: package.json
```

## Quiz

```ui:quiz
questions:
  - type: multiple-choice
    question: Which Obsidian API correctly handles ui:* language identifiers with colons?
    options:
      - registerMarkdownCodeBlockProcessor
      - registerMarkdownPostProcessor
      - registerEditorExtension
    answer: 1
  - type: multiple-choice
    question: What CM6 primitive is required for line-spanning widget decorations?
    options:
      - ViewPlugin
      - StateField
      - EditorView.decorations
    answer: 1
```

## Kanban

```ui:kanban
columns:
  - id: todo
    title: To Do
    cards:
      - id: c1
        title: Live preview (Phase 2)
        priority: medium
      - id: c2
        title: Mobile support
        priority: low
      - id: c3
        title: Settings panel
        priority: low
  - id: in_progress
    title: In Progress
    cards:
      - id: c4
        title: Theme sync
        priority: high
  - id: done
    title: Done
    cards:
      - id: c5
        title: Reading view
        priority: high
      - id: c6
        title: All 28 components
        priority: high
```

## Poll

```ui:poll
question: Which GlyphJS component would you use most in Obsidian?
options:
  - Table
  - Chart
  - Callout
  - Graph
  - Kanban
  - Architecture
```

## Rating

```ui:rating
items:
  - label: Ease of setup
  - label: Documentation quality
  - label: Rendering performance
  - label: Theme integration
```

## Ranker

```ui:ranker
items:
  - id: "1"
    label: Live preview
  - id: "2"
    label: Obsidian theme sync
  - id: "3"
    label: Mobile support
  - id: "4"
    label: PDF export
  - id: "5"
    label: Dataview interop
```

## Slider

```ui:slider
parameters:
  - id: bundle_limit
    label: Max bundle size (MB)
    min: 0.5
    max: 10
    step: 0.5
    default: 3.7
  - id: min_version
    label: Min Obsidian version (×10)
    min: 10
    max: 20
    step: 1
    default: 15
```

## Matrix

```ui:matrix
columns:
  - id: reading
    label: Reading View
  - id: live
    label: Live Preview
  - id: mobile
    label: Mobile
rows:
  - id: p1
    label: Phase 1
  - id: p2
    label: Phase 2
  - id: p3
    label: Phase 3
```

## Form

```ui:form
fields:
  - type: text
    id: plugin_id
    label: Plugin ID
    placeholder: glyphjs
  - type: textarea
    id: description
    label: Description
    placeholder: Render interactive GlyphJS components in Obsidian
  - type: select
    id: phase
    label: Current phase
    options:
      - Phase 1 — Reading view
      - Phase 2 — Live preview
      - Phase 3 — Deep integration
  - type: checkbox
    id: mobile
    label: Mobile support
```

## Sequence

```ui:sequence
actors:
  - id: user
    label: User
  - id: obsidian
    label: Obsidian
  - id: plugin
    label: GlyphJS Plugin
  - id: compiler
    label: Compiler
messages:
  - from: user
    to: obsidian
    label: Open note (Reading View)
  - from: obsidian
    to: plugin
    label: postProcess(el, ctx)
  - from: plugin
    to: compiler
    label: compile(markdown)
  - from: compiler
    to: plugin
    label: GlyphIR
  - from: plugin
    to: obsidian
    label: React root mounted
```

## MindMap

```ui:mindmap
root: GlyphJS Obsidian Plugin
children:
  - label: Phase 1
    children:
      - label: Reading view
      - label: Theme sync
      - label: 28 components
  - label: Phase 2
    children:
      - label: Live preview
      - label: CM6 StateField
  - label: Phase 3
    children:
      - label: Deep integration
      - label: Mobile support
      - label: Settings panel
```

## Equation

```ui:equation
expression: "E = mc^2"
label: Mass-energy equivalence
```

## Annotate

```ui:annotate
text: The plugin uses registerMarkdownPostProcessor to scan rendered HTML for ui:* code blocks, then mounts React roots via MarkdownRenderChild for proper lifecycle management.
labels:
  - name: API
    color: "#027aff"
  - name: Component
    color: "#44cf6e"
  - name: Lifecycle
    color: "#df4a16"
```
