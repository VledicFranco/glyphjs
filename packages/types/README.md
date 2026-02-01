# @glyphjs/types

Shared TypeScript type definitions for the Glyph JS ecosystem.

## Install

```bash
pnpm add @glyphjs/types
```

## Usage

```ts
import type { GlyphIR, Block, CompilationResult } from '@glyphjs/types';

const doc: GlyphIR = {
  version: '0.1',
  documentId: 'doc-1',
  metadata: { title: 'Hello' },
  blocks: [],
  references: [],
};
```

## What's included

- **IR types** -- `GlyphIR`, `Block`, `Reference`, `CompilationResult`, and related interfaces
- **AST types** -- `GlyphRoot`, `GlyphUIBlock`, `RawRef` for the parsed markdown AST
- **Block data types** -- `HeadingData`, `ParagraphData`, `CodeData`, `ListData`, and more
- **Patch types** -- `GlyphPatch`, `GlyphPatchOperation` for IR diffing/patching
- **Runtime types** -- `GlyphRuntime`, `GlyphTheme`, `BlockProps`, `GlyphRuntimeConfig`
- **Plugin types** -- `GlyphComponentDefinition`, `GlyphComponentProps`

## Docs

https://github.com/nicholasgriffintn/glyphjs
