import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Table', () => {
  test('renders a grid with correct structure', async ({ page }) => {
    await page.goto(storyUrl('components-table--basic'));
    const table = page.locator('[role="grid"]');
    await expect(table).toBeVisible();

    // Verify column headers
    const headers = page.locator('th[scope="col"]');
    await expect(headers).toHaveCount(3);
    await expect(headers.nth(0)).toContainText('Name');
    await expect(headers.nth(1)).toContainText('Role');
    await expect(headers.nth(2)).toContainText('Email');
  });

  test('renders all data rows', async ({ page }) => {
    await page.goto(storyUrl('components-table--basic'));
    const rows = page.locator('[role="grid"] tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.first()).toContainText('Alice');
  });

  test('sortable column header click sorts rows ascending', async ({ page }) => {
    await page.goto(storyUrl('components-table--sortable'));

    // Click the "Name" column header to sort ascending
    const nameHeader = page.locator('th[scope="col"]').filter({ hasText: 'Name' });
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    // Verify rows are sorted alphabetically
    const firstCell = page.locator('[role="grid"] tbody tr:first-child td:first-child');
    await expect(firstCell).toContainText('Alice');
  });

  test('double-clicking a sortable header toggles to descending', async ({ page }) => {
    await page.goto(storyUrl('components-table--sortable'));

    const nameHeader = page.locator('th[aria-sort]').filter({ hasText: 'Name' });

    // First click: ascending
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    // Second click: descending
    await nameHeader.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

    // Verify rows are reversed
    const firstCell = page.locator('[role="grid"] tbody tr:first-child td:first-child');
    await expect(firstCell).toContainText('Dave');
  });

  test('triple-click resets sort to none', async ({ page }) => {
    await page.goto(storyUrl('components-table--sortable'));

    const nameHeader = page.locator('th[scope="col"]').filter({ hasText: 'Name' });
    await nameHeader.click(); // ascending
    await nameHeader.click(); // descending
    await nameHeader.click(); // none
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none');
  });

  test('filter input filters rows', async ({ page }) => {
    await page.goto(storyUrl('components-table--filterable'));

    // All 5 rows should be visible initially
    await expect(page.locator('[role="grid"] tbody tr')).toHaveCount(5);

    // Type into the Product filter
    const productFilter = page.locator('input[aria-label="Filter Product"]');
    await productFilter.fill('Widget');

    // Only 2 rows should remain (Widget A and Widget B)
    await expect(page.locator('[role="grid"] tbody tr')).toHaveCount(2);
  });

  test('filter by category narrows results', async ({ page }) => {
    await page.goto(storyUrl('components-table--filterable'));

    const categoryFilter = page.locator('input[aria-label="Filter Category"]');
    await categoryFilter.fill('Tools');

    // Only Tools rows should remain (Gadget C and Gadget D)
    await expect(page.locator('[role="grid"] tbody tr')).toHaveCount(2);
    await expect(page.locator('[role="grid"] tbody')).toContainText('Gadget C');
    await expect(page.locator('[role="grid"] tbody')).toContainText('Gadget D');
  });

  test('sortable header responds to keyboard Enter', async ({ page }) => {
    await page.goto(storyUrl('components-table--sortable'));

    const nameHeader = page.locator('th[scope="col"]').filter({ hasText: 'Name' });
    await nameHeader.focus();
    await page.keyboard.press('Enter');
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  test('aggregation footer renders computed values', async ({ page }) => {
    await page.goto(storyUrl('components-table--with-aggregation'));

    const footer = page.locator('tfoot');
    await expect(footer).toBeVisible();
    // Revenue sum = 120000 + 150000 + 130000 + 180000 = 580000
    await expect(footer).toContainText('580000');
  });
});
