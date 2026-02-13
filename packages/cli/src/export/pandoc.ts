import { execFile } from 'node:child_process';

/**
 * Check whether Pandoc is available on the system PATH.
 * Returns the version string if found, or `null` if not installed.
 */
export async function checkPandocAvailable(): Promise<string | null> {
  return new Promise((resolve) => {
    execFile('pandoc', ['--version'], (error, stdout) => {
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
  return new Promise((resolve, reject) => {
    execFile(
      'pandoc',
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
