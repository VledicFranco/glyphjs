import { listBundledThemes } from '../rendering/theme-loader.js';

export function themesCommand(): void {
  const names = listBundledThemes();
  process.stdout.write('Available bundled themes:\n\n');
  for (const name of names) process.stdout.write(`  ${name}\n`);
  process.stdout.write(
    '\nUsage:  glyphjs export doc.md --format html --theme <name>\n' +
      '        glyphjs serve doc.md --theme <name>\n' +
      '        glyphjs render doc.md --theme <name>\n',
  );
}
