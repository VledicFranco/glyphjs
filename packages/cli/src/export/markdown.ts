import { resolve } from 'node:path';
import type { GlyphIR } from '@glyphjs/types';
import {
  renderAndRewriteBlocks,
  type RenderBlocksOptions,
  type RenderBlocksResult,
} from './render-blocks.js';

export interface ExportMarkdownOptions extends RenderBlocksOptions {
  /** Directory for rendered block images, relative to output dir. Defaults to './images/'. */
  imagesDir?: string;
}

export type ExportMarkdownResult = RenderBlocksResult;

/**
 * Export a GlyphJS document to Markdown with ui: blocks replaced by image references.
 *
 * @param originalMarkdown - The original markdown source text
 * @param ir - The compiled IR
 * @param outputDir - Absolute path to the output directory
 * @param options - Export options including imagesDir, theme, and width
 */
export async function exportMarkdown(
  originalMarkdown: string,
  ir: GlyphIR,
  outputDir: string,
  options: ExportMarkdownOptions = {},
): Promise<ExportMarkdownResult> {
  const imagesDirRel = options.imagesDir ?? './images/';
  const imagesDir = resolve(outputDir, imagesDirRel);
  const imageRefPrefix = imagesDirRel.replace(/\/$/, '');

  return renderAndRewriteBlocks(originalMarkdown, ir, imagesDir, imageRefPrefix, {
    theme: options.theme,
    width: options.width,
  });
}
