import { defineConfig } from 'vitest/config';

/** Shared vitest configuration for all packages. */
export const sharedConfig = defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
  },
});

/** Shared vitest configuration for packages that need jsdom (React components). */
export const sharedJsdomConfig = defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
  },
});
