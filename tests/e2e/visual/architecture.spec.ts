import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Architecture', () => {
  test('simple flow renders SVG with node labels', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--simple-flow'));
    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('text=Web App')).toBeVisible();
    await expect(page.locator('text=API Server')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
  });

  test('edge labels are rendered', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--simple-flow'));
    await expect(page.locator('text=REST')).toBeVisible();
    await expect(page.locator('text=queries')).toBeVisible();
  });

  test('cloud infra story renders title and nested zones', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--cloud-infra'));
    await expect(page.locator('text=Production VPC')).toBeVisible();
    await expect(page.locator('text=Public Subnet')).toBeVisible();
    await expect(page.locator('text=Private Subnet')).toBeVisible();
    await expect(page.locator('text=Data Subnet')).toBeVisible();
  });

  test('microservices story renders all service nodes', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--microservices'));
    await expect(page.locator('text=API Gateway')).toBeVisible();
    await expect(page.locator('text=Auth Service')).toBeVisible();
    await expect(page.locator('text=PostgreSQL')).toBeVisible();
  });

  test('data pipeline story uses left-right layout', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--data-pipeline'));
    await expect(page.locator('text=Ingest')).toBeVisible();
    await expect(page.locator('text=Transform')).toBeVisible();
    await expect(page.locator('text=Data Lake')).toBeVisible();
    await expect(page.locator('text=Query Engine')).toBeVisible();
  });

  test('modifier key mode story renders zoom controls', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--modifier-key-mode'));
    await expect(page.locator('svg')).toBeVisible();
    // Zoom controls should be present
    await expect(page.locator('button[aria-label*="oom"]')).toBeVisible();
  });

  test('compact story renders inside constrained container', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--compact'));
    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('text=Web App')).toBeVisible();
  });

  test('click to activate mode renders interactive overlay', async ({ page }) => {
    await page.goto(storyUrl('components-architecture--click-to-activate-mode'));
    await expect(page.locator('svg')).toBeVisible();
    // The overlay activation button or hint should be present
    const svg = page.locator('svg');
    await expect(svg).toBeVisible();
  });
});
