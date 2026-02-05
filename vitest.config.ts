import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./packages/runtime/vitest.setup.ts'],
    include: ['packages/*/src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/*/src/**/*.test.{ts,tsx}',
        'packages/*/src/**/*.stories.{ts,tsx}',
        'packages/*/src/**/index.ts',
      ],
      thresholds: {
        branches: 68,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
});
