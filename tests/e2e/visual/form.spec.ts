import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Form', () => {
  test('default story renders all field types', async ({ page }) => {
    await page.goto(storyUrl('components-form--default'));
    await expect(page.locator('role=region[name="Project Setup"]')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('submit button renders with correct label', async ({ page }) => {
    await page.goto(storyUrl('components-form--default'));
    await expect(page.locator('button[type="submit"]')).toContainText('Create Project');
    await expect(page.locator('button[type="submit"]')).not.toBeDisabled();
  });

  test('required fields have aria-required', async ({ page }) => {
    await page.goto(storyUrl('components-form--default'));
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toHaveAttribute('aria-required', 'true');
  });

  test('contact form story renders email and message fields', async ({ page }) => {
    await page.goto(storyUrl('components-form--contact-form'));
    await expect(page.locator('role=region[name="Contact Us"]')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toHaveCount(2);
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Submit');
  });

  test('minimal story renders single field', async ({ page }) => {
    await page.goto(storyUrl('components-form--minimal'));
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Search');
  });

  test('submit button becomes disabled after successful submission', async ({ page }) => {
    await page.goto(storyUrl('components-form--minimal'));
    const input = page.locator('input[type="text"]');
    const submit = page.locator('button[type="submit"]');
    await input.fill('test query');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toContainText('Submitted');
  });

  test('required field shows aria-invalid after empty submit', async ({ page }) => {
    await page.goto(storyUrl('components-form--contact-form'));
    await page.locator('button[type="submit"]').click();
    const emailInput = page.locator('input[type="text"]').first();
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });
});
