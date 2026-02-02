# @glyphjs/compiler

Compiles Glyph markdown into a validated IR (Intermediate Representation) with schema validation and diagnostics.

## Install

```bash
pnpm add @glyphjs/compiler
```

## Usage

```ts
import { compile } from '@glyphjs/compiler';

const markdown = `
# My Document

\`\`\`ui:graph
nodes:
  - id: a
    label: Start
edges:
  - from: a
    to: b
\`\`\`
`;

const result = compile(markdown);
// result.ir       -- the compiled GlyphIR document
// result.diagnostics -- any warnings or errors
```

## API

- `compile(markdown, options?)` -- end-to-end markdown-to-IR compilation
- `translateNode(node, context)` -- convert a single AST node to IR blocks
- `extractAllInlineReferences(ir)` -- extract cross-block references
- `compileContainerBlocks(blocks)` -- compile nested container structures
- `createDiagnostic(...)` -- helper for building diagnostic objects

## Docs

https://github.com/VledicFranco/glyphjs
