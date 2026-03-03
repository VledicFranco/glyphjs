import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { compile } from '@glyphjs/compiler';
import type { Diagnostic } from '@glyphjs/types';
import { formatDiagnostic } from '../utils/logger.js';

export interface LintCommandOptions {
  format?: 'text' | 'json';
  strict?: boolean;
  quiet?: boolean;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function countsBySeverity(diagnostics: Diagnostic[]): { errors: number; warnings: number } {
  return {
    errors: diagnostics.filter((d) => d.severity === 'error').length,
    warnings: diagnostics.filter((d) => d.severity === 'warning').length,
  };
}

function lintSummary(errors: number, warnings: number): string {
  if (errors === 0 && warnings === 0) return 'No issues found.';
  const parts: string[] = [];
  if (errors > 0) parts.push(`${errors} error${errors === 1 ? '' : 's'}`);
  if (warnings > 0) parts.push(`${warnings} warning${warnings === 1 ? '' : 's'}`);
  return `Found ${parts.join(', ')}.`;
}

function isLintFailure(diagnostics: Diagnostic[], strict: boolean): boolean {
  return diagnostics.some((d) => d.severity === 'error' || (strict && d.severity === 'warning'));
}

export async function lintCommand(input: string, options: LintCommandOptions): Promise<void> {
  const format = options.format ?? 'text';
  const strict = options.strict ?? false;
  const quiet = options.quiet ?? false;

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
    if (format === 'json') {
      process.stdout.write(
        JSON.stringify(
          { valid: false, file: input, error: `Could not read input: ${message}`, diagnostics: [] },
          null,
          2,
        ) + '\n',
      );
    } else if (!quiet) {
      process.stderr.write(`error — Could not read input: ${message}\n`);
    }
    process.exitCode = 2;
    return;
  }

  const { diagnostics } = compile(markdown, { filePath });
  const { errors, warnings } = countsBySeverity(diagnostics);
  const failed = isLintFailure(diagnostics, strict);
  const fileLabel = filePath ?? '<stdin>';

  if (format === 'json') {
    process.stdout.write(
      JSON.stringify(
        {
          valid: !failed,
          file: fileLabel,
          errorCount: errors,
          warningCount: warnings,
          diagnostics,
        },
        null,
        2,
      ) + '\n',
    );
  } else if (!quiet) {
    for (const diag of diagnostics) {
      process.stderr.write(formatDiagnostic(diag, fileLabel) + '\n');
    }
    if (diagnostics.length > 0) {
      process.stderr.write(lintSummary(errors, warnings) + '\n');
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}
