import { createRequire } from 'node:module';
import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';
import { lintCommand } from './commands/lint.js';
import { renderCommand } from './commands/render.js';
import { exportCommand } from './commands/export.js';
import { serveCommand } from './commands/serve.js';
import { schemasCommand } from './commands/schemas.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const program = new Command();

program
  .name('glyphjs')
  .description('GlyphJS CLI — compile, render, export, and serve documents')
  .version(version);

program
  .command('compile')
  .description('Compile a Markdown file to GlyphJS IR (JSON)')
  .argument('<input>', 'input file path, or "-" to read from stdin')
  .option('-o, --output <path>', 'write JSON to file instead of stdout')
  .option('--compact', 'output minified JSON')
  .option('-v, --verbose', 'show diagnostics on stderr')
  .action(compileCommand);

program
  .command('lint')
  .description('Validate ui: blocks in a Markdown file and report diagnostics')
  .argument('<input>', 'input file path, or "-" to read from stdin')
  .option('--format <format>', 'output format: text or json', 'text')
  .option('--strict', 'treat warnings as errors (exit 1)')
  .option('-q, --quiet', 'suppress output — rely on exit code only')
  .action((input: string, opts: Record<string, string | boolean | undefined>) => {
    return lintCommand(input, {
      format: opts['format'] as 'text' | 'json' | undefined,
      strict: opts['strict'] === true,
      quiet: opts['quiet'] === true,
    });
  });

program
  .command('schemas')
  .description('Output JSON Schema for a GlyphJS component type')
  .argument('[type]', 'component type, e.g. "chart" or "ui:chart"')
  .option('--all', 'output all component schemas as a single JSON object')
  .option('--list', 'list available component type names')
  .option('-o, --output <path>', 'write output to file instead of stdout')
  .action((type: string | undefined, opts: Record<string, string | boolean | undefined>) => {
    return schemasCommand(type, {
      all: opts['all'] === true,
      list: opts['list'] === true,
      output: opts['output'] as string | undefined,
    });
  });

program
  .command('render')
  .description('Render ui: blocks from a Markdown file to PNG screenshots')
  .argument('<input>', 'input file path, or "-" to read from stdin')
  .option('-o, --output <path>', 'output file or directory path')
  .option('-d, --output-dir <dir>', 'output directory for screenshots')
  .option('-t, --theme <theme>', 'theme to use: light or dark', 'light')
  .option('--theme-file <path>', 'YAML file with custom theme variables')
  .option('-b, --block-id <id>', 'render only the block with this ID')
  .option('-w, --width <px>', 'viewport width in pixels', '1280')
  .option('--viewport-height <px>', 'viewport height in pixels', '800')
  .option('--device-scale-factor <factor>', 'device scale factor for HiDPI', '2')
  .option('-v, --verbose', 'show diagnostics and progress on stderr')
  .action((input: string, opts: Record<string, string | boolean | undefined>) => {
    return renderCommand(input, {
      output: opts['output'] as string | undefined,
      outputDir: opts['outputDir'] as string | undefined,
      theme: (opts['theme'] as 'light' | 'dark') ?? 'light',
      themeFile: opts['themeFile'] as string | undefined,
      blockId: opts['blockId'] as string | undefined,
      width: opts['width'] ? Number(opts['width']) : undefined,
      viewportHeight: opts['viewportHeight'] ? Number(opts['viewportHeight']) : undefined,
      deviceScaleFactor: opts['deviceScaleFactor'] ? Number(opts['deviceScaleFactor']) : undefined,
      verbose: opts['verbose'] === true,
    });
  });

program
  .command('export')
  .description('Export a Markdown file to HTML, PDF, Markdown, or DOCX')
  .argument('<input>', 'input file path, or "-" to read from stdin')
  .requiredOption('--format <format>', 'output format: html|pdf|md|docx')
  .option('-o, --output <path>', 'write to file instead of stdout')
  .option('-t, --theme <theme>', 'theme to use: light or dark', 'light')
  .option('--theme-file <path>', 'YAML file with custom theme variables')
  .option('-w, --width <px>', 'document width in pixels', '1024')
  .option('--title <title>', 'override document title')
  .option('--page-size <size>', 'PDF page size (e.g. Letter, A4)', 'Letter')
  .option('--margin <margin>', 'PDF margin in CSS shorthand (e.g. "1in", "0.5in 1in")', '1in')
  .option('--landscape', 'use landscape orientation for PDF')
  .option('--continuous', 'PDF: render as one tall continuous page with no page breaks')
  .option(
    '--padding <padding>',
    'document content padding in CSS shorthand (e.g. "1rem", "2rem 3rem")',
  )
  .option('--viewport-height <px>', 'viewport height in pixels', '1024')
  .option('--max-width <css>', 'maximum content column width, e.g. "64rem" or "none"', '64rem')
  .option('--device-scale-factor <factor>', 'device pixel ratio for block images (export md)', '2')
  .option('--images-dir <dir>', 'directory for rendered block images (md export)', './images/')
  .option('-v, --verbose', 'show diagnostics on stderr')
  .action((input: string, opts: Record<string, string | boolean | undefined>) => {
    return exportCommand(input, {
      format: opts['format'] as string,
      output: opts['output'] as string | undefined,
      theme: (opts['theme'] as 'light' | 'dark') ?? 'light',
      themeFile: opts['themeFile'] as string | undefined,
      width: opts['width'] ? Number(opts['width']) : undefined,
      viewportHeight: opts['viewportHeight'] ? Number(opts['viewportHeight']) : undefined,
      maxWidth: opts['maxWidth'] as string | undefined,
      deviceScaleFactor: opts['deviceScaleFactor'] ? Number(opts['deviceScaleFactor']) : undefined,
      title: opts['title'] as string | undefined,
      pageSize: opts['pageSize'] as string | undefined,
      margin: opts['margin'] as string | undefined,
      landscape: opts['landscape'] === true,
      continuous: opts['continuous'] === true,
      padding: opts['padding'] as string | undefined,
      imagesDir: opts['imagesDir'] as string | undefined,
      verbose: opts['verbose'] === true,
    });
  });

program
  .command('serve')
  .description('Start a development server with live reload')
  .argument('<input>', 'input Markdown file path')
  .option('-p, --port <port>', 'port to listen on', '3000')
  .option('-t, --theme <theme>', 'theme to use: light or dark', 'light')
  .option('--theme-file <path>', 'YAML file with custom theme variables')
  .option('--open', 'open browser on start')
  .option('-v, --verbose', 'show diagnostics on stderr')
  .action((input: string, opts: Record<string, string | boolean | undefined>) => {
    return serveCommand(input, {
      port: opts['port'] ? Number(opts['port']) : undefined,
      theme: (opts['theme'] as 'light' | 'dark') ?? 'light',
      themeFile: opts['themeFile'] as string | undefined,
      open: opts['open'] === true,
      verbose: opts['verbose'] === true,
    });
  });

program.parse();
