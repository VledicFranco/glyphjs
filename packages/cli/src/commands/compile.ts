import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { compile } from '@glyphjs/compiler';
import { logDiagnostics } from '../utils/logger.js';

export interface CompileCommandOptions {
  output?: string;
  compact?: boolean;
  verbose?: boolean;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export async function compileCommand(input: string, options: CompileCommandOptions): Promise<void> {
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

  const result = compile(markdown, { filePath });
  const indent = options.compact ? undefined : 2;
  const json = JSON.stringify(result.ir, null, indent);

  if (options.verbose) {
    logDiagnostics(result.diagnostics, filePath ?? '<stdin>');
  }

  try {
    if (options.output) {
      const outPath = resolve(process.cwd(), options.output);
      await writeFile(outPath, json + '\n', 'utf-8');
    } else {
      process.stdout.write(json + '\n');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error — Could not write output: ${message}\n`);
    process.exitCode = 2;
    return;
  }

  if (result.hasErrors) {
    process.exitCode = 1;
  }
}
