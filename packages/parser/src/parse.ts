import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import type { GlyphRoot } from '@glyphjs/types';
import { remarkGlyph } from './plugin.js';

/**
 * Parse a Glyph Markdown string into a GlyphRoot AST.
 *
 * Sets up a unified pipeline with:
 * 1. remark-parse — standard Markdown parsing
 * 2. remark-frontmatter — YAML frontmatter support
 * 3. remarkGlyph — transforms ui: fenced blocks into GlyphUIBlock nodes
 */
export function parseGlyphMarkdown(markdown: string): GlyphRoot {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGlyph);

  const tree = processor.parse(markdown);
  const result = processor.runSync(tree);
  return result as unknown as GlyphRoot;
}
