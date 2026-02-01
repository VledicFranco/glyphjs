import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Tabs', () => {
  test('renders a tablist with correct number of tabs', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--two-tabs'));
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(2);
  });

  test('first tab is selected by default', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--two-tabs'));
    const firstTab = page.locator('[role="tab"]').first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');

    const secondTab = page.locator('[role="tab"]').nth(1);
    await expect(secondTab).toHaveAttribute('aria-selected', 'false');
  });

  test('clicking a tab switches the active panel', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--two-tabs'));

    // First panel should be visible, second hidden
    const panels = page.locator('[role="tabpanel"]');
    await expect(panels.first()).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();

    // Click the second tab
    const secondTab = page.locator('[role="tab"]').nth(1);
    await secondTab.click();

    // Second panel should now be visible
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    await expect(panels.nth(1)).toBeVisible();
    await expect(panels.first()).toBeHidden();
  });

  test('keyboard navigation with ArrowRight cycles tabs', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--three-tabs'));

    const tabs = page.locator('[role="tab"]');
    // Focus the first tab
    await tabs.first().focus();
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');

    // Press ArrowRight to move to the second tab
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(1)).toBeFocused();

    // Press ArrowRight again to move to the third tab
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(2)).toBeFocused();

    // Press ArrowRight once more to wrap around to the first tab
    await page.keyboard.press('ArrowRight');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.first()).toBeFocused();
  });

  test('keyboard navigation with ArrowLeft cycles tabs backwards', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--three-tabs'));

    const tabs = page.locator('[role="tab"]');
    await tabs.first().focus();

    // Press ArrowLeft to wrap to the last tab
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(2)).toBeFocused();
  });

  test('Home and End keys navigate to first and last tabs', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--three-tabs'));

    const tabs = page.locator('[role="tab"]');
    // Move to the second tab first
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');

    // Press End to jump to the last tab
    await page.keyboard.press('End');
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');

    // Press Home to jump to the first tab
    await page.keyboard.press('Home');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  });

  test('tab panels have correct aria-labelledby linking', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--two-tabs'));

    const firstTab = page.locator('[role="tab"]').first();
    const tabId = await firstTab.getAttribute('id');

    const firstPanel = page.locator('[role="tabpanel"]').first();
    await expect(firstPanel).toHaveAttribute('aria-labelledby', tabId!);
  });

  test('tabs have aria-controls linking to panels', async ({ page }) => {
    await page.goto(storyUrl('components-tabs--two-tabs'));

    const firstTab = page.locator('[role="tab"]').first();
    const controlsId = await firstTab.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();

    const linkedPanel = page.locator(`#${controlsId!}`);
    await expect(linkedPanel).toHaveAttribute('role', 'tabpanel');
  });
});
