import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: true,
    include: ['packages/*/src/**/*.test.ts', 'tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
