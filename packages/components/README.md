# @glyphjs/components

Built-in UI components for Glyph JS: graphs, tables, charts, timelines, and more.

## Install

```bash
pnpm add @glyphjs/components react react-dom
```

## Usage

```tsx
import { graphDefinition, tableDefinition } from '@glyphjs/components';
import { createGlyphRuntime } from '@glyphjs/runtime';

const runtime = createGlyphRuntime();

// Register built-in components
runtime.register(graphDefinition);
runtime.register(tableDefinition);
```

### Using components directly

```tsx
import { Graph, Table, Chart } from '@glyphjs/components';

<Graph
  data={{
    nodes: [{ id: 'a', label: 'Node A' }],
    edges: [{ from: 'a', to: 'b' }],
  }}
/>
```

## Available components

| Component | Description |
|-----------|-------------|
| `Graph` | Directed graph with dagre and force layouts |
| `Table` | Data table with headers and rows |
| `Chart` | Bar, line, and area charts via D3 |
| `Relation` | Entity-relationship diagrams |
| `Timeline` | Chronological event timelines |
| `Callout` | Callout / admonition blocks (info, warning, etc.) |
| `Tabs` | Tabbed content panels |
| `Steps` | Step-by-step instructional sequences |

## Docs

https://github.com/nicholasgriffintn/glyphjs
