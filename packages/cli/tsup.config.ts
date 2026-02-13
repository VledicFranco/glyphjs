import { defineConfig } from 'tsup';

export default defineConfig({
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
});
