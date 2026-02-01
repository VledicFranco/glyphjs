# @glyphjs/parser

Markdown parser with a remark plugin for `ui:` fenced code blocks.

## Install

```bash
pnpm add @glyphjs/parser
```

## Usage

```ts
import { parseGlyphMarkdown } from '@glyphjs/parser';

const markdown = `
# Hello

\`\`\`ui:graph
nodes:
  - id: a
    label: Node A
edges:
  - from: a
    to: b
\`\`\`
`;

const ast = parseGlyphMarkdown(markdown);
```

### Using the remark plugin directly

```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { remarkGlyph } from '@glyphjs/parser';

const processor = unified().use(remarkParse).use(remarkGlyph);
const tree = processor.parse(markdown);
```

## Docs

https://github.com/nicholasgriffintn/glyphjs
