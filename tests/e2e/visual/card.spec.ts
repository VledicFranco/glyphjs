import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Card component', () => {
  test('renders in storybook', async ({ page }) => {
    await page.goto(storyUrl('components-card--default'));
    const component = page.locator('[role="region"]');
    await expect(component).toBeVisible();
  });

  test('default story renders card titles', async ({ page }) => {
    await page.goto(storyUrl('components-card--default'));
    await expect(page.locator('text=Installation')).toBeVisible();
    await expect(page.locator('text=Configuration')).toBeVisible();
    await expect(page.locator('text=Deployment')).toBeVisible();
  });

  test('outlined story renders with outlined variant', async ({ page }) => {
    await page.goto(storyUrl('components-card--outlined'));
    const component = page.locator('[role="region"]');
    await expect(component).toBeVisible();
    await expect(page.locator('text=Features')).toBeVisible();
  });

  test('elevated story renders with elevated variant', async ({ page }) => {
    await page.goto(storyUrl('components-card--elevated'));
    const component = page.locator('[role="region"]');
    await expect(component).toBeVisible();
    await expect(page.locator('text=Popular Packages')).toBeVisible();
  });

  test('single card story renders one card', async ({ page }) => {
    await page.goto(storyUrl('components-card--single-card'));
    const articles = page.locator('article');
    await expect(articles).toHaveCount(1);
    await expect(page.locator('text=Welcome to GlyphJS')).toBeVisible();
  });

  test('region has correct aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-card--default'));
    const region = page.locator('[role="region"]');
    await expect(region).toHaveAttribute('aria-label', 'Getting Started');
  });
});
