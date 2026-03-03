import esbuild from 'esbuild';
import fs from 'fs';

const isWatch = process.argv.includes('--watch');

const VAULT_PLUGIN_DIR =
  'C:/Users/atfm0/Repositories/oss/.obsidian/plugins/glyphjs';

fs.mkdirSync(VAULT_PLUGIN_DIR, { recursive: true });

const copyAssets = {
  name: 'copy-assets',
  setup(build) {
    build.onEnd(() => {
      fs.copyFileSync('manifest.json', `${VAULT_PLUGIN_DIR}/manifest.json`);
      if (fs.existsSync('styles.css')) {
        fs.copyFileSync('styles.css', `${VAULT_PLUGIN_DIR}/styles.css`);
      }
      console.log('[GlyphJS] Built → ' + VAULT_PLUGIN_DIR);
    });
  },
};

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    // Obsidian / Electron — provided by the host at runtime
    'obsidian',
    'electron',
    // Node.js built-ins — available in Electron's renderer process
    'crypto',
    'fs',
    'path',
    'os',
    'util',
    'stream',
    'buffer',
    // CodeMirror — must not be bundled (Obsidian provides them)
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  format: 'cjs',
  target: 'es2020',
  jsx: 'automatic',
  sourcemap: 'inline',
  treeShaking: true,
  outfile: `${VAULT_PLUGIN_DIR}/main.js`,
  logLevel: 'info',
  plugins: [copyAssets],
});

if (isWatch) {
  await ctx.watch();
  console.log('[GlyphJS] Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
