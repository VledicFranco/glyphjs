import esbuild from 'esbuild';
import fs from 'fs';

const isWatch = process.argv.includes('--watch');

// RELEASE_BUILD=true  → output main.js to the plugin root (for GitHub release artifacts)
// OBSIDIAN_VAULT_PATH → override the dev vault path on other machines
const isRelease = process.env.RELEASE_BUILD === 'true';
const VAULT_PLUGIN_DIR =
  process.env.OBSIDIAN_VAULT_PATH ?? 'C:/Users/atfm0/Repositories/oss/.obsidian/plugins/glyphjs';

const outfile = isRelease ? 'main.js' : `${VAULT_PLUGIN_DIR}/main.js`;

if (!isRelease) {
  fs.mkdirSync(VAULT_PLUGIN_DIR, { recursive: true });
}

const copyAssets = {
  name: 'copy-assets',
  setup(build) {
    build.onEnd(() => {
      if (isRelease) {
        console.log('[GlyphJS] Release build → main.js');
      } else {
        fs.copyFileSync('manifest.json', `${VAULT_PLUGIN_DIR}/manifest.json`);
        if (fs.existsSync('styles.css')) {
          fs.copyFileSync('styles.css', `${VAULT_PLUGIN_DIR}/styles.css`);
        }
        console.log('[GlyphJS] Built → ' + VAULT_PLUGIN_DIR);
      }
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
  sourcemap: isRelease ? false : 'inline',
  treeShaking: true,
  outfile,
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
