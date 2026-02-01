import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

test.describe('Timeline', () => {
  test('renders with role="img" and descriptive aria-label', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--vertical'));
    const timeline = page.locator('[role="img"]');
    await expect(timeline).toBeVisible();

    const ariaLabel = await timeline.getAttribute('aria-label');
    expect(ariaLabel).toContain('Timeline');
    expect(ariaLabel).toContain('4 events');
  });

  test('renders the correct number of event markers', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--vertical'));
    // Each event has a visual container that is aria-hidden
    // Count by looking for the event title text elements
    const timeline = page.locator('[role="img"]');
    await expect(timeline).toContainText('Project Kickoff');
    await expect(timeline).toContainText('Alpha Release');
    await expect(timeline).toContainText('Beta Release');
    await expect(timeline).toContainText('v1.0 Launch');
  });

  test('screen-reader fallback list contains all events', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--vertical'));
    // The ordered list is visually hidden but present for assistive tech
    const srList = page.locator('[role="img"] ol');
    await expect(srList).toHaveCount(1);

    const items = srList.locator('li');
    await expect(items).toHaveCount(4);
  });

  test('each event in the fallback list has a time element', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--vertical'));
    const timeElements = page.locator('[role="img"] ol time');
    await expect(timeElements).toHaveCount(4);

    // Verify the first time element has a dateTime attribute
    const firstTime = timeElements.first();
    const dateTime = await firstTime.getAttribute('dateTime');
    expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('horizontal timeline renders all events', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--horizontal'));
    const timeline = page.locator('[role="img"]');
    await expect(timeline).toBeVisible();

    const ariaLabel = await timeline.getAttribute('aria-label');
    expect(ariaLabel).toContain('4 events');

    await expect(timeline).toContainText('Q1 Start');
    await expect(timeline).toContainText('Q4 Start');
  });

  test('timeline with descriptions renders description text', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--with-descriptions'));
    const timeline = page.locator('[role="img"]');
    await expect(timeline).toContainText('Company incorporated in Delaware');
    await expect(timeline).toContainText('Raised $2M from angel investors');
  });

  test('timeline events are rendered in chronological order in fallback list', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--vertical'));
    const items = page.locator('[role="img"] ol li');

    // First event should be earliest (Project Kickoff - Jan 15)
    await expect(items.first()).toContainText('Project Kickoff');
    // Last event should be latest (v1.0 Launch - Aug 10)
    await expect(items.last()).toContainText('v1.0 Launch');
  });
});
