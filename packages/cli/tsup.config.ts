import { defineConfig } from 'tsup';

export default defineConfig([
  // 1. Node CLI entry
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    target: 'node20',
    sourcemap: true,
    banner: { js: '#!/usr/bin/env node' },
    external: ['commander', 'playwright'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // 2. Browser hydration bundle (IIFE, inlined into exported HTML)
  {
    entry: { hydrate: 'src/rendering/hydrate-entry.tsx' },
    format: ['iife'],
    platform: 'browser',
    target: 'es2020',
    minify: true,
    clean: false,
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
]);
