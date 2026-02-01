# Glyph JS

[![CI](https://github.com/VledicFranco/glyphjs/actions/workflows/ci.yml/badge.svg)](https://github.com/VledicFranco/glyphjs/actions/workflows/ci.yml)
[![Deploy Docs](https://github.com/VledicFranco/glyphjs/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/VledicFranco/glyphjs/actions/workflows/deploy-docs.yml)

A Markdown-to-interactive-UI rendering engine. Write enhanced Markdown with embedded `ui:` components and render rich, interactive documents in React.

## Packages

| Package | Description |
|---------|-------------|
| `@glyphjs/types` | TypeScript type definitions for IR, AST, plugins, and runtime |
| `@glyphjs/schemas` | Zod schemas for all 8 built-in UI components |
| `@glyphjs/parser` | Remark plugin for parsing `ui:` fenced code blocks |
| `@glyphjs/ir` | Intermediate representation: validation, diffing, patching, migration |
| `@glyphjs/compiler` | End-to-end Markdown-to-IR compiler |
| `@glyphjs/runtime` | React rendering engine with theming, layouts, and plugins |
| `@glyphjs/components` | 8 built-in UI components (graph, table, chart, etc.) |

## Quick Start

```bash
pnpm add @glyphjs/parser @glyphjs/compiler @glyphjs/runtime @glyphjs/components
```

```tsx
import { parseGlyphMarkdown } from '@glyphjs/parser';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';

const ast = parseGlyphMarkdown(markdownString);
const { ir } = compile(ast);
const { GlyphDocument } = createGlyphRuntime({ ir });

function App() {
  return <GlyphDocument />;
}
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## License

MIT
