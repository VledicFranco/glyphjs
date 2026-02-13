import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, basename, extname } from 'node:path';
import { compile } from '@glyphjs/compiler';
import type { Block, GlyphIR } from '@glyphjs/types';
import { logDiagnostics } from '../utils/logger.js';
import { checkPlaywrightAvailable, BrowserManager } from '../rendering/browser.js';
import { captureBlockScreenshot } from '../rendering/screenshot.js';
import { loadThemeFile, resolveThemeVars } from '../rendering/theme-loader.js';
import type { ThemeName } from '../rendering/ssr.js';

export interface RenderCommandOptions {
  output?: string;
  outputDir?: string;
  theme?: ThemeName;
  themeFile?: string;
  blockId?: string;
  width?: number;
  deviceScaleFactor?: number;
  verbose?: boolean;
}

/**
 * Read markdown input from file or stdin.
 */
async function readInput(input: string): Promise<{ markdown: string; filePath?: string }> {
  if (input === '-') {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    return { markdown: Buffer.concat(chunks).toString('utf-8') };
  }

  const filePath = resolve(process.cwd(), input);
  const markdown = await readFile(filePath, 'utf-8');
  return { markdown, filePath };
}

/**
 * Filter blocks to only `ui:*` types, optionally filtering by a specific block ID.
 */
function filterBlocks(ir: GlyphIR, blockId?: string): Block[] {
  const uiBlocks = ir.blocks.filter((b) => b.type.startsWith('ui:'));

  if (blockId) {
    const match = uiBlocks.filter((b) => b.id === blockId);
    if (match.length === 0) {
      throw new Error(
        `Block "${blockId}" not found. Available ui: blocks: ${uiBlocks.map((b) => b.id).join(', ') || '(none)'}`,
      );
    }
    return match;
  }

  return uiBlocks;
}

/**
 * Determine the output file path for a block screenshot.
 */
function resolveOutputPath(
  block: Block,
  index: number,
  options: RenderCommandOptions,
  inputPath?: string,
): string {
  if (options.output && !options.blockId) {
    // --output without --block-id: use output as directory
    const dir = resolve(process.cwd(), options.output);
    return join(dir, `${block.id}.png`);
  }

  if (options.output) {
    // --output with --block-id: use as exact file path
    return resolve(process.cwd(), options.output);
  }

  if (options.outputDir) {
    const dir = resolve(process.cwd(), options.outputDir);
    return join(dir, `${block.id}.png`);
  }

  // Default: current directory, named after the input file or block
  const stem = inputPath ? basename(inputPath, extname(inputPath)) : 'glyph';
  const suffix = index > 0 ? `-${index}` : '';
  return resolve(process.cwd(), `${stem}-${block.id}${suffix}.png`);
}

export async function renderCommand(input: string, options: RenderCommandOptions): Promise<void> {
  // Check Playwright availability
  const available = await checkPlaywrightAvailable();
  if (!available) {
    process.stderr.write(
      'error — Playwright is not installed. Install it with: npm install playwright\n',
    );
    process.exitCode = 2;
    return;
  }

  // Read input
  let markdown: string;
  let filePath: string | undefined;
  try {
    ({ markdown, filePath } = await readInput(input));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error — Could not read input: ${message}\n`);
    process.exitCode = 2;
    return;
  }

  // Compile
  const result = compile(markdown, { filePath });

  if (options.verbose) {
    logDiagnostics(result.diagnostics, filePath ?? '<stdin>');
  }

  if (result.hasErrors) {
    process.stderr.write('error — Compilation failed. Cannot render.\n');
    process.exitCode = 1;
    return;
  }

  // Filter blocks
  let blocks: Block[];
  try {
    blocks = filterBlocks(result.ir, options.blockId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error — ${message}\n`);
    process.exitCode = 1;
    return;
  }

  if (blocks.length === 0) {
    process.stderr.write('warn  — No ui: blocks found in the document.\n');
    process.exitCode = 0;
    return;
  }

  // Load custom theme file if provided
  let themeVars: Record<string, string> | undefined;
  if (options.themeFile) {
    try {
      const themeData = await loadThemeFile(resolve(process.cwd(), options.themeFile));
      themeVars = resolveThemeVars(themeData.base, themeData.overrides);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`error — Failed to load theme file: ${message}\n`);
      process.exitCode = 2;
      return;
    }
  }

  // Render each block
  let page;
  let errorCount = 0;
  try {
    page = await BrowserManager.newPage();

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] as (typeof blocks)[number];
      const outPath = resolveOutputPath(block, i, options, filePath);

      try {
        const screenshot = await captureBlockScreenshot(page, block, {
          theme: options.theme,
          width: options.width,
          deviceScaleFactor: options.deviceScaleFactor,
          themeVars,
        });

        // Ensure output directory exists
        const dir = resolve(outPath, '..');
        await mkdir(dir, { recursive: true });

        await writeFile(outPath, screenshot);

        if (options.verbose) {
          process.stderr.write(`info  — Rendered ${block.id} → ${outPath}\n`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`error — Failed to render block "${block.id}": ${message}\n`);
        errorCount++;
      }
    }
  } finally {
    await BrowserManager.shutdown();
  }

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}
