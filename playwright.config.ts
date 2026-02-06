import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'storybook',
      testDir: './tests/e2e/visual',
      use: { browserName: 'chromium', baseURL: 'http://localhost:6006' },
    },
    {
      name: 'demo',
      testDir: './tests/e2e',
      testMatch: [
        'pipeline.spec.ts',
        'components.spec.ts',
        'theming.spec.ts',
        'errors.spec.ts',
        'determinism.spec.ts',
        'markdown.spec.ts',
      ],
      use: { browserName: 'chromium', baseURL: 'http://localhost:5173' },
    },
    {
      name: 'docs',
      testDir: './tests/e2e/docs',
      // Skip screenshot comparison tests in CI — baselines are platform-specific
      grepInvert: process.env.CI ? /screenshot/ : undefined,
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:4321',
        viewport: { width: 1280, height: 720 },
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @glyphjs/components storybook --ci --port 6006',
      port: 6006,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'cd apps/demo && pnpm dev --port 5173',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @glyphjs/docs preview --port 4321',
      port: 4321,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
