<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.svg">
    <img alt="Glyph JS" src="assets/logo-light.svg" width="340">
  </picture>
</p>

<p align="center">
  A Markdown-to-interactive-UI rendering engine.<br>
  Write enhanced Markdown with embedded <code>ui:</code> components and render rich, interactive documents in React.
</p>

<p align="center">
  <a href="https://github.com/VledicFranco/glyphjs/actions/workflows/ci.yml"><img src="https://github.com/VledicFranco/glyphjs/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/VledicFranco/glyphjs/actions/workflows/deploy-docs.yml"><img src="https://github.com/VledicFranco/glyphjs/actions/workflows/deploy-docs.yml/badge.svg" alt="Deploy Docs"></a>
  <a href="https://www.npmjs.com/package/@glyphjs/compiler"><img src="https://img.shields.io/npm/v/@glyphjs/compiler" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@glyphjs/compiler"><img src="https://img.shields.io/npm/dm/@glyphjs/compiler" alt="downloads"></a>
</p>

## Packages

| Package               | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| `@glyphjs/types`      | TypeScript type definitions for IR, AST, plugins, and runtime         |
| `@glyphjs/schemas`    | Zod schemas for all 8 built-in UI components                          |
| `@glyphjs/parser`     | Remark plugin for parsing `ui:` fenced code blocks                    |
| `@glyphjs/ir`         | Intermediate representation: validation, diffing, patching, migration |
| `@glyphjs/compiler`   | End-to-end Markdown-to-IR compiler                                    |
| `@glyphjs/runtime`    | React rendering engine with theming, layouts, and plugins             |
| `@glyphjs/components` | 8 built-in UI components (graph, table, chart, etc.)                  |

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
