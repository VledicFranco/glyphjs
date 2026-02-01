import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:6006',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'pnpm --filter @glyphjs/components storybook --ci --port 6006',
    port: 6006,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
