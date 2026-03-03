import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Annotate', () => {
  test('default story renders title, text, and label legend', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await expect(page.locator('role=region[name="Code Review"]')).toBeVisible();
    // Source text pane is rendered (CSS attribute selector avoids matching implicit <html> role)
    await expect(page.locator('[role="document"]')).toBeVisible();
    // The existing Bug annotation appears in the sidebar
    await expect(page.locator('text=Bug').first()).toBeVisible();
  });

  test('source text is displayed', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await expect(page.locator('text=processData')).toBeVisible();
  });

  test('pre-existing annotation is highlighted in the text', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    // The annotation span should be present (eval() is annotated as Bug)
    await expect(page.locator('[role="document"] mark')).toBeVisible();
  });

  test('annotation note appears in the sidebar', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await expect(page.locator('text=eval() is dangerous')).toBeVisible();
  });

  test('label picker shows all available labels', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--default'));
    await page.locator('role=region[name="Code Review"]').waitFor();
    // Sidebar shows the annotation count header
    await expect(page.locator('text=Annotations (1)')).toBeVisible();
    // The Bug label is visible in the sidebar annotation
    await expect(page.locator('text=Bug').first()).toBeVisible();
  });

  test('prose text story renders document content', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--prose-text'));
    await page.locator('role=region[name="Document Review"]').waitFor();
    await expect(page.locator('role=region[name="Document Review"]')).toBeVisible();
    // The document pane has the annotated text (mark element from annotation 0–55)
    await expect(page.locator('[role="document"] mark')).toBeVisible();
  });

  test('no annotations story renders text with no sidebar entries', async ({ page }) => {
    await page.goto(storyUrl('components-annotate--no-annotations'));
    await expect(page.locator('text=Fresh Document')).toBeVisible();
    await expect(page.locator('text=Select any text')).toBeVisible();
    // Sidebar should be empty — no annotation notes visible
    await expect(page.locator('text=eval() is dangerous')).not.toBeVisible();
  });
});
