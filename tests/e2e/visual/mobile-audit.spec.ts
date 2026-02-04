import { test, expect } from '@playwright/test';
import { storyUrl } from '../setup';

/**
 * Mobile rendering audit — screenshot every default story at 375px (iPhone SE)
 * to identify components that render poorly on small screens.
 */

const STORIES = [
  'components-accordion--default',
  'components-architecture--simple-flow',
  'components-callout--info',
  'components-card--default',
  'components-chart--line-chart',
  'components-chart--bar-chart',
  'components-codediff--default',
  'components-comparison--default',
  'components-comparison--max-options',
  'components-equation--default',
  'components-filetree--default',
  'components-flowchart--default',
  'components-flowchart--decision-heavy',
  'components-graph--dag-small',
  'components-graph--dag-medium',
  'components-infographic--default',
  'components-infographic--full-dashboard',
  'components-kpi--default',
  'components-kpi--four-columns',
  'components-mindmap--default',
  'components-quiz--default',
  'components-relation--default',
  'components-sequence--default',
  'components-sequence--many-messages',
  'components-steps--mixed-status',
  'components-table--basic',
  'components-table--sortable',
  'components-tabs--three-tabs',
  'components-timeline--vertical',
  'components-timeline--horizontal',
];

test.describe('Mobile rendering audit (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const storyId of STORIES) {
    test(`${storyId} renders at 375px`, async ({ page }) => {
      await page.goto(storyUrl(storyId));
      // Wait for content to render
      await page.waitForTimeout(2000);

      // Check for horizontal overflow — the body should not be wider than viewport
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = 375;
      const overflow = bodyWidth - viewportWidth;

      // Take a screenshot for visual inspection
      await page.screenshot({
        path: `test-results/mobile-audit/${storyId}.png`,
        fullPage: true,
      });

      // Log overflow for all stories
      if (overflow > 0) {
        console.log(
          `${overflow > 10 ? 'OVERFLOW' : 'minor'}: ${storyId} — body scrollWidth ${bodyWidth}px (overflow ${overflow}px)`,
        );
      }

      // Fail on significant horizontal overflow (> 10px tolerance)
      expect(overflow, `${storyId} has ${overflow}px horizontal overflow`).toBeLessThanOrEqual(10);
    });
  }
});
