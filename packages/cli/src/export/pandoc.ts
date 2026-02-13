import { execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

/** Well-known install locations for Pandoc (checked when not on PATH). */
const PANDOC_SEARCH_PATHS =
  process.platform === 'win32'
    ? [
        join(homedir(), 'AppData', 'Local', 'Pandoc', 'pandoc.exe'),
        join(process.env['ProgramFiles'] ?? 'C:\\Program Files', 'Pandoc', 'pandoc.exe'),
        join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'Pandoc', 'pandoc.exe'),
      ]
    : ['/usr/local/bin/pandoc', '/opt/homebrew/bin/pandoc'];

let resolvedPandoc: string | undefined;

/**
 * Resolve the pandoc binary path. Checks PATH first, then well-known locations.
 */
async function findPandoc(): Promise<string | null> {
  if (resolvedPandoc) return resolvedPandoc;

  // Try PATH first
  const onPath = await tryExec('pandoc');
  if (onPath) {
    resolvedPandoc = 'pandoc';
    return resolvedPandoc;
  }

  // Search well-known install directories
  for (const candidate of PANDOC_SEARCH_PATHS) {
    try {
      await access(candidate);
      const works = await tryExec(candidate);
      if (works) {
        resolvedPandoc = candidate;
        return resolvedPandoc;
      }
    } catch {
      // not found, try next
    }
  }

  return null;
}

function tryExec(bin: string): Promise<string | null> {
  return new Promise((resolve) => {
    execFile(bin, ['--version'], (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      const firstLine = stdout.split('\n')[0] ?? '';
      resolve(firstLine.trim());
    });
  });
}

/**
 * Check whether Pandoc is available on the system PATH or in well-known locations.
 * Returns the version string if found, or `null` if not installed.
 */
export async function checkPandocAvailable(): Promise<string | null> {
  const bin = await findPandoc();
  if (!bin) return null;

  return new Promise((resolve) => {
    execFile(bin, ['--version'], (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      const firstLine = stdout.split('\n')[0] ?? '';
      resolve(firstLine.trim());
    });
  });
}

/**
 * Run Pandoc to convert a Markdown file to DOCX.
 *
 * @param inputPath - Relative or absolute path to the input Markdown file
 * @param outputPath - Relative or absolute path for the output DOCX file
 * @param cwd - Working directory for the Pandoc process
 */
export async function runPandoc(inputPath: string, outputPath: string, cwd: string): Promise<void> {
  const bin = resolvedPandoc ?? (await findPandoc());
  if (!bin) {
    throw new Error('Pandoc binary not found. Call checkPandocAvailable() first.');
  }

  return new Promise((resolve, reject) => {
    execFile(
      bin,
      [inputPath, '--from=markdown', '--to=docx', `--output=${outputPath}`],
      { cwd },
      (error, _stdout, stderr) => {
        if (error) {
          const message = stderr?.trim() || error.message;
          reject(new Error(`Pandoc failed: ${message}`));
          return;
        }
        resolve();
      },
    );
  });
}
