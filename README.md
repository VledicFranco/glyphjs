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
  <a href="https://github.com/VledicFranco/glyphjs/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VledicFranco/glyphjs" alt="license"></a>
</p>

---

## Install

```bash
npm install @glyphjs/compiler @glyphjs/runtime @glyphjs/components
```

> Requires **React 18+** and **ReactDOM 18+** as peer dependencies.

## Quick Start

```tsx
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import { defaultComponents } from '@glyphjs/components';

const markdown = `
# Hello Glyph

\`\`\`ui:callout
type: tip
title: It works!
content: This Markdown is now a rich, interactive document.
\`\`\`
`;

const { ir } = compile(markdown);
const runtime = createGlyphRuntime({
  components: defaultComponents,
  theme: 'light',
});

function App() {
  return <runtime.GlyphDocument ir={ir} />;
}
```

## Packages

| Package                                                                    | Description                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`@glyphjs/types`](https://www.npmjs.com/package/@glyphjs/types)           | TypeScript type definitions for IR, AST, plugins, and runtime |
| [`@glyphjs/schemas`](https://www.npmjs.com/package/@glyphjs/schemas)       | Zod schemas for all built-in UI components                    |
| [`@glyphjs/parser`](https://www.npmjs.com/package/@glyphjs/parser)         | Remark plugin for parsing `ui:` fenced code blocks            |
| [`@glyphjs/ir`](https://www.npmjs.com/package/@glyphjs/ir)                 | IR utilities: validation, diffing, patching, migration        |
| [`@glyphjs/compiler`](https://www.npmjs.com/package/@glyphjs/compiler)     | End-to-end Markdown-to-IR compiler                            |
| [`@glyphjs/runtime`](https://www.npmjs.com/package/@glyphjs/runtime)       | React rendering engine with theming, layouts, and plugins     |
| [`@glyphjs/components`](https://www.npmjs.com/package/@glyphjs/components) | 21 built-in UI components                                     |
| [`@glyphjs/brand`](https://www.npmjs.com/package/@glyphjs/brand)           | Logo assets and palette constants                             |

## Components

21 built-in components covering content structuring, data visualization, diagramming, and interactivity:

| Category      | Components                                                            |
| ------------- | --------------------------------------------------------------------- |
| **Content**   | Callout, Tabs, Steps, Accordion, Card, KPI                            |
| **Data**      | Table, Chart, Comparison, CodeDiff                                    |
| **Diagrams**  | Graph, Relation, Flowchart, Sequence, MindMap, Architecture, FileTree |
| **Narrative** | Timeline, Infographic, Equation, Quiz                                 |

Browse the full catalog in the [component docs](https://vledicfranco.github.io/glyphjs/components/).

## Documentation

Full documentation is available at **[vledicfranco.github.io/glyphjs](https://vledicfranco.github.io/glyphjs/)**.

- [Getting Started](https://vledicfranco.github.io/glyphjs/getting-started/) -- Install and render your first document
- [Authoring Guide](https://vledicfranco.github.io/glyphjs/authoring-guide/) -- Markdown syntax and `ui:` block reference
- [Components](https://vledicfranco.github.io/glyphjs/components/) -- Full component catalog with live examples
- [Playground](https://vledicfranco.github.io/glyphjs/playground/) -- Try Glyph JS in your browser
- [IR Spec](https://vledicfranco.github.io/glyphjs/reference/ir-spec/) -- Intermediate Representation reference
- [Plugin API](https://vledicfranco.github.io/glyphjs/reference/plugin-api/) -- Extend the runtime with custom components
- [Theming](https://vledicfranco.github.io/glyphjs/reference/theming/) -- Customize colors, typography, and spacing

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (Turborepo)
pnpm test             # Unit tests (Vitest)
pnpm lint             # ESLint + Prettier check
pnpm typecheck        # TypeScript type check
```

## License

MIT
