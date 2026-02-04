import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('FileTree visual tests', () => {
  test('Default story renders', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-filetree--default&viewMode=story`);
    const tree = page.locator('[role="tree"]');
    await expect(tree).toBeVisible({ timeout: 15000 });
  });

  test('FlatFiles story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-filetree--flat-files&viewMode=story`,
    );
    const tree = page.locator('[role="tree"]');
    await expect(tree).toBeVisible({ timeout: 15000 });
  });

  test('DeepNesting story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-filetree--deep-nesting&viewMode=story`,
    );
    const tree = page.locator('[role="tree"]');
    await expect(tree).toBeVisible({ timeout: 15000 });
  });

  test('WithAnnotations story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-filetree--with-annotations&viewMode=story`,
    );
    const tree = page.locator('[role="tree"]');
    await expect(tree).toBeVisible({ timeout: 15000 });
  });

  test('CollapsedByDefault story renders', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-filetree--collapsed-by-default&viewMode=story`,
    );
    const tree = page.locator('[role="tree"]');
    await expect(tree).toBeVisible({ timeout: 15000 });
  });
});
