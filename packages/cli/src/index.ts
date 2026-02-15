import { createRequire } from 'node:module';
import { Command } from 'commander';
import { compileCommand } from './commands/compile.js';
import { renderCommand } from './commands/render.js';
import { exportCommand } from './commands/export.js';
import { serveCommand } from './commands/serve.js';

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
  .command('render')
  .description('Render ui: blocks from a Markdown file to PNG screenshots')
  .argument('<input>', 'input file path, or "-" to read from stdin')
  .option('-o, --output <path>', 'output file or directory path')
  .option('-d, --output-dir <dir>', 'output directory for screenshots')
  .option('-t, --theme <theme>', 'theme to use: light or dark', 'light')
  .option('--theme-file <path>', 'YAML file with custom theme variables')
  .option('-b, --block-id <id>', 'render only the block with this ID')
  .option('-w, --width <px>', 'viewport width in pixels', '1280')
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
  .option('--images-dir <dir>', 'directory for rendered block images (md export)', './images/')
  .option('-v, --verbose', 'show diagnostics on stderr')
  .action((input: string, opts: Record<string, string | boolean | undefined>) => {
    return exportCommand(input, {
      format: opts['format'] as string,
      output: opts['output'] as string | undefined,
      theme: (opts['theme'] as 'light' | 'dark') ?? 'light',
      themeFile: opts['themeFile'] as string | undefined,
      width: opts['width'] ? Number(opts['width']) : undefined,
      title: opts['title'] as string | undefined,
      pageSize: opts['pageSize'] as string | undefined,
      margin: opts['margin'] as string | undefined,
      landscape: opts['landscape'] === true,
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
