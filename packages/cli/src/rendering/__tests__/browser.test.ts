import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock playwright ──────────────────────────────────────────

const mockPage = { goto: vi.fn(), close: vi.fn() };
const mockBrowser = {
  newPage: vi.fn().mockResolvedValue(mockPage),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue(mockBrowser),
  },
}));

import { BrowserManager, checkPlaywrightAvailable } from '../browser.js';

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(async () => {
  // Ensure browser is shut down between tests to reset singleton
  await BrowserManager.shutdown();
});

describe('checkPlaywrightAvailable', () => {
  it('returns true when playwright is importable', async () => {
    const available = await checkPlaywrightAvailable();
    expect(available).toBe(true);
  });
});

describe('BrowserManager', () => {
  it('launches a browser on first call', async () => {
    const { chromium } = await import('playwright');
    const browser = await BrowserManager.launch();

    expect(chromium.launch).toHaveBeenCalledWith({ headless: true });
    expect(browser).toBe(mockBrowser);
  });

  it('reuses the browser on subsequent calls', async () => {
    const { chromium } = await import('playwright');

    const first = await BrowserManager.launch();
    const second = await BrowserManager.launch();

    expect(first).toBe(second);
    expect(chromium.launch).toHaveBeenCalledTimes(1);
  });

  it('creates a new page via the browser', async () => {
    const page = await BrowserManager.newPage();

    expect(page).toBe(mockPage);
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
  });

  it('closes the browser and resets on shutdown', async () => {
    await BrowserManager.launch();
    await BrowserManager.shutdown();

    expect(mockBrowser.close).toHaveBeenCalledTimes(1);

    // After shutdown, a new launch should create a fresh browser
    const { chromium } = await import('playwright');
    await BrowserManager.launch();
    expect(chromium.launch).toHaveBeenCalledTimes(2);
  });

  it('shutdown is a no-op when browser is not running', async () => {
    // No launch, just shutdown — should not throw
    await expect(BrowserManager.shutdown()).resolves.toBeUndefined();
    expect(mockBrowser.close).not.toHaveBeenCalled();
  });
});
