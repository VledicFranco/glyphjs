import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import type { GlyphIR } from '@glyphjs/types';
import { checkPandocAvailable, runPandoc } from './pandoc.js';
import { renderAndRewriteBlocks, type RenderBlocksOptions } from './render-blocks.js';

export type ExportDocxOptions = RenderBlocksOptions;

/**
 * Export a GlyphJS document to DOCX format via Pandoc.
 *
 * Pipeline:
 * 1. Check Pandoc availability
 * 2. Render ui: blocks to images and rewrite markdown
 * 3. Write processed markdown to a temp directory
 * 4. Run Pandoc to convert markdown → docx
 * 5. Return the DOCX file as a Buffer
 *
 * @param originalMarkdown - The original markdown source text
 * @param ir - The compiled IR
 * @param options - Export options including theme and width
 */
export async function exportDocx(
  originalMarkdown: string,
  ir: GlyphIR,
  options: ExportDocxOptions = {},
): Promise<Buffer> {
  const pandocVersion = await checkPandocAvailable();
  if (!pandocVersion) {
    throw new Error(
      'Pandoc is required for DOCX export but is not installed.\n' +
        'Install it from: https://pandoc.org/installing.html',
    );
  }

  const tmpDir = join(tmpdir(), `glyphjs-docx-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  try {
    // Render blocks to images in the temp dir; use '.' prefix so Pandoc finds them
    const result = await renderAndRewriteBlocks(originalMarkdown, ir, tmpDir, '.', {
      theme: options.theme,
      width: options.width,
    });

    // Write processed markdown
    const mdPath = join(tmpDir, 'document.md');
    await writeFile(mdPath, result.markdown, 'utf-8');

    // Run Pandoc
    await runPandoc('document.md', 'output.docx', tmpDir);

    // Read and return the DOCX
    const docxPath = join(tmpDir, 'output.docx');
    return await readFile(docxPath);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
