import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { compile } from '@glyphjs/compiler';
import { logDiagnostics } from '../utils/logger.js';
import { exportHTML } from '../export/html.js';
import { exportPDF } from '../export/pdf.js';
import { exportMarkdown } from '../export/markdown.js';
import { exportDocx } from '../export/docx.js';
import type { ThemeName } from '../rendering/ssr.js';

export interface ExportCommandOptions {
  format: string;
  output?: string;
  theme?: ThemeName;
  width?: number;
  title?: string;
  pageSize?: string;
  margin?: string;
  landscape?: boolean;
  imagesDir?: string;
  verbose?: boolean;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export async function exportCommand(input: string, options: ExportCommandOptions): Promise<void> {
  // Read input
  let markdown: string;
  let filePath: string | undefined;

  try {
    if (input === '-') {
      markdown = await readStdin();
    } else {
      filePath = resolve(process.cwd(), input);
      markdown = await readFile(filePath, 'utf-8');
    }
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
    process.stderr.write('error — Compilation failed. Cannot export.\n');
    process.exitCode = 1;
    return;
  }

  // Dispatch to format handler
  let output: string | Buffer;

  switch (options.format) {
    case 'html':
      output = exportHTML(result.ir, {
        theme: options.theme,
        title: options.title,
      });
      break;
    case 'pdf':
      try {
        output = await exportPDF(result.ir, {
          theme: options.theme,
          title: options.title,
          width: options.width,
          pageSize: options.pageSize,
          margin: options.margin,
          landscape: options.landscape,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`error — PDF export failed: ${message}\n`);
        process.exitCode = 2;
        return;
      }
      break;
    case 'md': {
      try {
        const outputDir = options.output
          ? dirname(resolve(process.cwd(), options.output))
          : process.cwd();
        const mdResult = await exportMarkdown(markdown, result.ir, outputDir, {
          theme: options.theme,
          width: options.width,
          imagesDir: options.imagesDir,
        });
        output = mdResult.markdown;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`error — Markdown export failed: ${message}\n`);
        process.exitCode = 2;
        return;
      }
      break;
    }
    case 'docx': {
      try {
        output = await exportDocx(markdown, result.ir, {
          theme: options.theme,
          width: options.width,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`error — DOCX export failed: ${message}\n`);
        process.exitCode = 2;
        return;
      }
      break;
    }
    default:
      process.stderr.write(
        `error — Unknown export format "${options.format}". Supported formats: html, pdf, md, docx\n`,
      );
      process.exitCode = 2;
      return;
  }

  // Write output
  try {
    if (options.output) {
      const outPath = resolve(process.cwd(), options.output);
      if (Buffer.isBuffer(output)) {
        await writeFile(outPath, output);
      } else {
        await writeFile(outPath, output, 'utf-8');
      }
      if (options.verbose) {
        process.stderr.write(`info  — Exported to ${outPath}\n`);
      }
    } else {
      process.stdout.write(output);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error — Could not write output: ${message}\n`);
    process.exitCode = 2;
    return;
  }
}
