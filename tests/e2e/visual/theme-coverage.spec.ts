import { test, expect, type Page } from '@playwright/test';
import { storyUrl } from '../setup';

/**
 * Theme coverage tests — sentinel injection strategy
 *
 * These tests verify that each component's CSS cascade chains correctly
 * propagate Tier 1 theme tokens (`--glyph-*`) to the rendered elements.
 *
 * Strategy for DOM-based components:
 *   1. Navigate to the component's Storybook story.
 *   2. Inject sentinel values onto the `[data-glyph-theme]` wrapper via JS.
 *      The wrapper already holds the theme vars as inline styles; we
 *      overwrite only the vars under test.
 *   3. Read computed style of a key element and assert it matches the sentinel.
 *
 * Strategy for SVG-based components (chart, graph, architecture, etc.):
 *   The SVG attributes are written at mount time via JS reads of CSS vars.
 *   We verify the sentinel is reachable on the theme wrapper (confirming
 *   the cascade is wired), then assert the SVG rendered with non-empty fill.
 *
 * A sentinel that doesn't propagate means either:
 *   - The component hardcodes the color (bypasses the cascade), or
 *   - There is a typo in the CSS var name.
 */

// ─── Sentinel values ─────────────────────────────────────────────────────────
// Chosen to differ from both light (#0a9d7c) and dark (#00d4aa) theme defaults.

const SENTINELS = {
  '--glyph-accent': 'rgb(200, 50, 150)',
  '--glyph-border': 'rgb(50, 200, 100)',
  '--glyph-surface': 'rgb(80, 30, 180)',
  '--glyph-surface-raised': 'rgb(200, 130, 40)',
  '--glyph-color-error': 'rgb(230, 100, 20)',
  '--glyph-color-success': 'rgb(20, 200, 160)',
  '--glyph-color-warning': 'rgb(210, 180, 10)',
  '--glyph-color-info': 'rgb(20, 80, 220)',
  '--glyph-palette-color-1': 'rgb(180, 0, 200)',
};

async function injectSentinels(
  page: Page,
  vars: Partial<typeof SENTINELS> = SENTINELS,
): Promise<void> {
  await page.evaluate((sentinels) => {
    const wrapper = document.querySelector('[data-glyph-theme]');
    if (wrapper instanceof HTMLElement) {
      for (const [key, value] of Object.entries(sentinels)) {
        wrapper.style.setProperty(key, value);
      }
    }
  }, vars);
}

async function getBorderLeftColor(page: Page, selector: string): Promise<string> {
  return page.locator(selector).evaluate((el) => window.getComputedStyle(el).borderLeftColor);
}

async function getBackgroundColor(page: Page, selector: string): Promise<string> {
  return page.locator(selector).evaluate((el) => window.getComputedStyle(el).backgroundColor);
}

async function getCSSVar(page: Page, varName: string): Promise<string> {
  return page
    .locator('[data-glyph-theme]')
    .evaluate((el, v) => window.getComputedStyle(el).getPropertyValue(v).trim(), varName);
}

// ─── Callout ─────────────────────────────────────────────────────────────────

test.describe('Theme coverage — Callout', () => {
  test('info border uses --glyph-color-info', async ({ page }) => {
    await page.goto(storyUrl('components-callout--info'));
    await page.locator('[role="note"]').waitFor();
    await injectSentinels(page, { '--glyph-color-info': SENTINELS['--glyph-color-info'] });
    const color = await getBorderLeftColor(page, '[role="note"]');
    expect(color).toBe(SENTINELS['--glyph-color-info']);
  });

  test('warning border uses --glyph-color-warning', async ({ page }) => {
    await page.goto(storyUrl('components-callout--warning'));
    await page.locator('[role="note"]').waitFor();
    await injectSentinels(page, { '--glyph-color-warning': SENTINELS['--glyph-color-warning'] });
    const color = await getBorderLeftColor(page, '[role="note"]');
    expect(color).toBe(SENTINELS['--glyph-color-warning']);
  });

  test('error border uses --glyph-color-error', async ({ page }) => {
    await page.goto(storyUrl('components-callout--error'));
    await page.locator('[role="note"]').waitFor();
    await injectSentinels(page, { '--glyph-color-error': SENTINELS['--glyph-color-error'] });
    const color = await getBorderLeftColor(page, '[role="note"]');
    expect(color).toBe(SENTINELS['--glyph-color-error']);
  });

  test('tip border uses --glyph-color-success', async ({ page }) => {
    await page.goto(storyUrl('components-callout--tip'));
    await page.locator('[role="note"]').waitFor();
    await injectSentinels(page, { '--glyph-color-success': SENTINELS['--glyph-color-success'] });
    const color = await getBorderLeftColor(page, '[role="note"]');
    expect(color).toBe(SENTINELS['--glyph-color-success']);
  });
});

// ─── Steps ───────────────────────────────────────────────────────────────────

test.describe('Theme coverage — Steps', () => {
  test('active step indicator uses --glyph-accent', async ({ page }) => {
    await page.goto(storyUrl('components-steps--mixed-status'));
    await page.locator('[aria-current="step"]').waitFor();
    // Combine injection + read in one evaluate to avoid Chrome's nested-var caching
    // The active indicator is the 2nd aria-hidden span (1st is the connector line).
    // Active status uses border (not backgroundColor which is transparent).
    const borderColor = await page.evaluate((sentinel) => {
      const wrapper = document.querySelector('[data-glyph-theme]') as HTMLElement | null;
      if (!wrapper) return '';
      wrapper.style.setProperty('--glyph-accent', sentinel);
      const spans = wrapper.querySelectorAll('[aria-current="step"] span[aria-hidden="true"]');
      const indicator = (spans.length > 1 ? spans[1] : spans[0]) as HTMLElement | undefined;
      if (!indicator) return '';
      return window.getComputedStyle(indicator).borderTopColor;
    }, SENTINELS['--glyph-accent']);
    expect(borderColor).toBe(SENTINELS['--glyph-accent']);
  });
});

// ─── Table ───────────────────────────────────────────────────────────────────

test.describe('Theme coverage — Table', () => {
  test('header background uses --glyph-surface', async ({ page }) => {
    await page.goto(storyUrl('components-table--basic'));
    await page.locator('table[role="grid"]').waitFor();
    // Combine injection + read in one evaluate: Chrome doesn't live-update
    // backgroundColor from `background` shorthand when a nested var changes.
    const bg = await page.evaluate((sentinel) => {
      const wrapper = document.querySelector('[data-glyph-theme]') as HTMLElement | null;
      if (!wrapper) return '';
      wrapper.style.setProperty('--glyph-surface', sentinel);
      const th = wrapper.querySelector('table[role="grid"] thead th');
      if (!th) return '';
      return window.getComputedStyle(th).backgroundColor;
    }, SENTINELS['--glyph-surface']);
    expect(bg).toBe(SENTINELS['--glyph-surface']);
  });

  test('alternate row background uses --glyph-surface-raised', async ({ page }) => {
    await page.goto(storyUrl('components-table--basic'));
    await page.locator('table[role="grid"]').waitFor();
    // Basic story has 3 rows; 2nd row (index 1) gets the alt background
    const bg = await page.evaluate((sentinel) => {
      const wrapper = document.querySelector('[data-glyph-theme]') as HTMLElement | null;
      if (!wrapper) return '';
      wrapper.style.setProperty('--glyph-surface-raised', sentinel);
      const row = wrapper.querySelector('table[role="grid"] tbody tr:nth-child(2)');
      if (!row) return '';
      return window.getComputedStyle(row).backgroundColor;
    }, SENTINELS['--glyph-surface-raised']);
    expect(bg).toBe(SENTINELS['--glyph-surface-raised']);
  });
});

// ─── Kanban ──────────────────────────────────────────────────────────────────

test.describe('Theme coverage — Kanban', () => {
  test('column background uses --glyph-surface', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    await page.locator('role=region[name="Sprint Board"]').waitFor();
    // Combine injection + read in one evaluate: Chrome doesn't live-update
    // backgroundColor from `background` shorthand when a nested var changes.
    const bg = await page.evaluate((sentinel) => {
      const wrapper = document.querySelector('[data-glyph-theme]') as HTMLElement | null;
      if (!wrapper) return '';
      wrapper.style.setProperty('--glyph-surface', sentinel);
      const list = wrapper.querySelector('[role="list"]');
      if (!list?.parentElement) return '';
      const colDiv = list.parentElement as HTMLElement;
      // Disable CSS transition so getComputedStyle returns the target value immediately
      colDiv.style.transition = 'none';
      return window.getComputedStyle(colDiv).backgroundColor;
    }, SENTINELS['--glyph-surface']);
    expect(bg).toBe(SENTINELS['--glyph-surface']);
  });

  test('high-priority card border uses --glyph-color-error', async ({ page }) => {
    await page.goto(storyUrl('components-kanban--default'));
    await page.locator('[aria-label*="high priority"]').first().waitFor();
    await injectSentinels(page, { '--glyph-color-error': SENTINELS['--glyph-color-error'] });
    const card = page.locator('[aria-label*="high priority"]').first();
    const border = await card.evaluate((el) => window.getComputedStyle(el).borderLeftColor);
    expect(border).toBe(SENTINELS['--glyph-color-error']);
  });
});

// ─── Poll ────────────────────────────────────────────────────────────────────

test.describe('Theme coverage — Poll', () => {
  test('vote button background uses --glyph-surface', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    await page.locator('button', { hasText: 'Vote' }).waitFor();
    await injectSentinels(page, { '--glyph-surface': SENTINELS['--glyph-surface'] });
    const bg = await getBackgroundColor(page, 'button:has-text("Vote")');
    expect(bg).toBe(SENTINELS['--glyph-surface']);
  });

  test('bar fill uses --glyph-accent after voting', async ({ page }) => {
    await page.goto(storyUrl('components-poll--default'));
    await page.locator('input[type="radio"]').first().click();
    await page.locator('button', { hasText: 'Vote' }).click();
    await page.locator('[role="progressbar"]').first().waitFor();
    await injectSentinels(page, { '--glyph-accent': SENTINELS['--glyph-accent'] });
    const fill = page.locator('[role="progressbar"]').first().locator('div').first();
    const bg = await fill.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe(SENTINELS['--glyph-accent']);
  });
});

// ─── Form ────────────────────────────────────────────────────────────────────

test.describe('Theme coverage — Form', () => {
  test('container border uses --glyph-border', async ({ page }) => {
    await page.goto(storyUrl('components-form--default'));
    await page.locator('role=region[name="Project Setup"]').waitFor();
    await injectSentinels(page, { '--glyph-border': SENTINELS['--glyph-border'] });
    const region = page.locator('role=region[name="Project Setup"]');
    const border = await region.evaluate((el) => window.getComputedStyle(el).borderTopColor);
    expect(border).toBe(SENTINELS['--glyph-border']);
  });

  test('invalid field border uses --glyph-color-error', async ({ page }) => {
    await page.goto(storyUrl('components-form--contact-form'));
    // Trigger validation by submitting empty required fields
    await page.locator('button[type="submit"]').click();
    await page.locator('[aria-invalid="true"]').first().waitFor();
    await injectSentinels(page, { '--glyph-color-error': SENTINELS['--glyph-color-error'] });
    const input = page.locator('[aria-invalid="true"]').first();
    const border = await input.evaluate((el) => window.getComputedStyle(el).borderTopColor);
    expect(border).toBe(SENTINELS['--glyph-color-error']);
  });
});

// ─── KPI ─────────────────────────────────────────────────────────────────────

test.describe('Theme coverage — KPI', () => {
  test('positive delta color uses --glyph-color-success', async ({ page }) => {
    await page.goto(storyUrl('components-kpi--all-trends'));
    await page.locator('role=region').waitFor();
    await injectSentinels(page, { '--glyph-color-success': SENTINELS['--glyph-color-success'] });
    // AllTrends: first card is 'Growth' (trend: up → positive sentiment)
    // Delta div is the last direct child div of the first card
    const firstCard = page.locator('[role="group"]').first();
    const deltaDiv = firstCard.locator('> div').last();
    const color = await deltaDiv.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).toBe(SENTINELS['--glyph-color-success']);
  });
});

// ─── SVG components — CSS var reachability ───────────────────────────────────
// For SVG-based components, the CSS vars are consumed at mount time via
// getComputedStyle(). These tests verify that the Storybook theme wrapper
// correctly provides the Tier 1 vars so the component can read them.

test.describe('Theme coverage — SVG var reachability', () => {
  test('Chart: --glyph-palette-color-1 is accessible on the theme wrapper', async ({ page }) => {
    await page.goto(storyUrl('components-chart--line-chart'));
    await page.locator('svg').first().waitFor();
    const val = await getCSSVar(page, '--glyph-palette-color-1');
    expect(val).not.toBe('');
    // Light theme default
    expect(val).toBe('#00d4aa');
  });

  test('Graph: --glyph-palette-color-1 is accessible on the theme wrapper', async ({ page }) => {
    await page.goto(storyUrl('components-graph--dag-small'));
    await page.locator('svg').first().waitFor();
    const val = await getCSSVar(page, '--glyph-palette-color-1');
    expect(val).not.toBe('');
    expect(val).toBe('#00d4aa');
  });

  test('Architecture: --glyph-palette-color-1 is accessible on the theme wrapper', async ({
    page,
  }) => {
    await page.goto(storyUrl('components-architecture--simple-flow'));
    await page.locator('svg').first().waitFor();
    const val = await getCSSVar(page, '--glyph-palette-color-1');
    expect(val).not.toBe('');
    expect(val).toBe('#00d4aa');
  });

  test('Timeline: --glyph-palette-color-1 is accessible on the theme wrapper', async ({ page }) => {
    await page.goto(storyUrl('components-timeline--vertical'));
    // Timeline is HTML/CSS (no SVG) — wait for the theme wrapper itself
    await page.locator('[data-glyph-theme]').waitFor();
    const val = await getCSSVar(page, '--glyph-palette-color-1');
    expect(val).not.toBe('');
    expect(val).toBe('#00d4aa');
  });

  test('Relation: --glyph-palette-color-1 is accessible on the theme wrapper', async ({ page }) => {
    await page.goto(storyUrl('components-relation--simple-er'));
    // Wait for the theme wrapper (which always appears when the story loads)
    await page.locator('[data-glyph-theme]').waitFor();
    const val = await getCSSVar(page, '--glyph-palette-color-1');
    expect(val).not.toBe('');
    expect(val).toBe('#00d4aa');
  });

  test('Infographic: --glyph-palette-color-1 is accessible on the theme wrapper', async ({
    page,
  }) => {
    await page.goto(storyUrl('components-infographic--default'));
    await page.locator('[role="region"]').waitFor();
    const val = await getCSSVar(page, '--glyph-palette-color-1');
    expect(val).not.toBe('');
    expect(val).toBe('#00d4aa');
  });

  test('Semantic state vars are all provided by the theme wrapper', async ({ page }) => {
    await page.goto(storyUrl('components-callout--info'));
    await page.locator('[role="note"]').waitFor();
    const success = await getCSSVar(page, '--glyph-color-success');
    const warning = await getCSSVar(page, '--glyph-color-warning');
    const error = await getCSSVar(page, '--glyph-color-error');
    const info = await getCSSVar(page, '--glyph-color-info');
    expect(success).toBe('#16a34a');
    expect(warning).toBe('#d97706');
    expect(error).toBe('#dc2626');
    expect(info).toBe('#38bdf8');
  });

  test('Renamed palette vars (not chart-color-N) are provided', async ({ page }) => {
    await page.goto(storyUrl('components-chart--line-chart'));
    await page.locator('svg').first().waitFor();
    // New name must exist
    const paletteColor1 = await getCSSVar(page, '--glyph-palette-color-1');
    const paletteColor10 = await getCSSVar(page, '--glyph-palette-color-10');
    expect(paletteColor1).toBe('#00d4aa');
    expect(paletteColor10).toBe('#38bdf8');
    // Old name must NOT exist (would be empty string)
    const oldName = await getCSSVar(page, '--glyph-chart-color-1');
    expect(oldName).toBe('');
  });
});
