import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Block, GlyphIR } from '@glyphjs/types';
import { checkPlaywrightAvailable, BrowserManager } from '../rendering/browser.js';
import { captureBlockScreenshot } from '../rendering/screenshot.js';
import type { ThemeName } from '../rendering/ssr.js';

export interface RenderBlocksOptions {
  theme?: ThemeName;
  width?: number;
}

export interface RenderBlocksResult {
  markdown: string;
  imagePaths: string[];
}

/**
 * Render all `ui:*` blocks to PNG images and rewrite the source markdown,
 * replacing fenced code blocks with image references.
 *
 * @param originalMarkdown - The original markdown source text
 * @param ir - The compiled IR (used to find ui: blocks and their positions)
 * @param imagesDir - Absolute path to the directory where images will be written
 * @param imageRefPrefix - Relative prefix used in markdown image references
 * @param options - Optional theme and width settings
 */
export async function renderAndRewriteBlocks(
  originalMarkdown: string,
  ir: GlyphIR,
  imagesDir: string,
  imageRefPrefix: string,
  options: RenderBlocksOptions = {},
): Promise<RenderBlocksResult> {
  const { theme = 'light', width = 1280 } = options;

  // Filter to only ui: blocks that have position info
  const uiBlocks = ir.blocks.filter(
    (b): b is Block & { position: NonNullable<Block['position']> } =>
      b.type.startsWith('ui:') && b.position != null,
  );

  if (uiBlocks.length === 0) {
    return { markdown: originalMarkdown, imagePaths: [] };
  }

  const available = await checkPlaywrightAvailable();
  if (!available) {
    throw new Error(
      'Playwright is required for block rendering but is not installed.\n' +
        'Install it with: npx playwright install chromium',
    );
  }

  await mkdir(imagesDir, { recursive: true });

  const imagePaths: string[] = [];

  try {
    const page = await BrowserManager.newPage();

    for (const block of uiBlocks) {
      const buffer = await captureBlockScreenshot(page, block, { theme, width });
      const filename = `${block.id}.png`;
      const imagePath = join(imagesDir, filename);
      await writeFile(imagePath, buffer);
      imagePaths.push(imagePath);
    }
  } finally {
    await BrowserManager.shutdown();
  }

  // Rewrite markdown: replace fenced code blocks with image references.
  // Work bottom-to-top so line numbers for earlier blocks remain valid.
  const lines = originalMarkdown.split('\n');

  const sortedBlocks = [...uiBlocks].sort((a, b) => b.position.start.line - a.position.start.line);

  for (const block of sortedBlocks) {
    const startIdx = block.position.start.line - 1; // 1-indexed → 0-indexed
    const endIdx = block.position.end.line - 1;
    const count = endIdx - startIdx + 1;
    const imageRef = `![${block.id}](${imageRefPrefix}/${block.id}.png)`;
    lines.splice(startIdx, count, imageRef);
  }

  return { markdown: lines.join('\n'), imagePaths };
}
