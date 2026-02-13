import type { Browser, Page } from 'playwright';

let browserInstance: Browser | null = null;

/**
 * Check whether the `playwright` package is available at runtime.
 * Returns `true` if importable, `false` otherwise.
 */
export async function checkPlaywrightAvailable(): Promise<boolean> {
  try {
    await import('playwright');
    return true;
  } catch {
    return false;
  }
}

/**
 * Manages a singleton Chromium browser instance for screenshot capture.
 * Lazily launches the browser on first use and reuses it across calls.
 */
export const BrowserManager = {
  /**
   * Launch (or return the existing) Chromium browser.
   */
  async launch(): Promise<Browser> {
    if (browserInstance) return browserInstance;

    const { chromium } = await import('playwright');
    browserInstance = await chromium.launch({ headless: true });
    return browserInstance;
  },

  /**
   * Create a new page in the managed browser.
   */
  async newPage(): Promise<Page> {
    const browser = await this.launch();
    return browser.newPage();
  },

  /**
   * Close the managed browser and reset the singleton.
   */
  async shutdown(): Promise<void> {
    if (browserInstance) {
      await browserInstance.close();
      browserInstance = null;
    }
  },
};
