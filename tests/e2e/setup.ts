/**
 * Shared helpers for Playwright e2e tests.
 *
 * `storyUrl` builds the iframe URL for a given Storybook story ID so that
 * each test can load the component in isolation without the Storybook
 * chrome.
 */
export function storyUrl(storyId: string): string {
  return `/iframe.html?id=${storyId}&viewMode=story`;
}
