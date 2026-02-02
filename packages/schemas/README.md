# @glyphjs/schemas

Zod schemas for Glyph JS UI components with automatic JSON Schema generation.

## Install

```bash
pnpm add @glyphjs/schemas
```

## Usage

```ts
import { graphSchema, tableSchema, getJsonSchema } from '@glyphjs/schemas';

// Validate component data at runtime
const result = graphSchema.safeParse({
  nodes: [{ id: 'a', label: 'Node A' }],
  edges: [{ from: 'a', to: 'b' }],
});

// Generate JSON Schema for any component
const jsonSchema = getJsonSchema('graph');
```

## Available schemas

| Schema           | Component                    |
| ---------------- | ---------------------------- |
| `graphSchema`    | Directed graphs / flowcharts |
| `tableSchema`    | Data tables                  |
| `chartSchema`    | Bar, line, and area charts   |
| `relationSchema` | Entity-relationship diagrams |
| `timelineSchema` | Chronological timelines      |
| `calloutSchema`  | Callout / admonition blocks  |
| `tabsSchema`     | Tabbed content panels        |
| `stepsSchema`    | Step-by-step sequences       |

## Docs

https://github.com/VledicFranco/glyphjs
