import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { SSRPlaceholder } from '../ssr/SSRPlaceholder.js';
import { useIsClient } from '../ssr/useIsClient.js';

// ─── useIsClient ──────────────────────────────────────────────

function ClientStatus(): React.ReactElement {
  const isClient = useIsClient();
  return <span data-testid="status">{isClient ? 'client' : 'server'}</span>;
}

describe('useIsClient', () => {
  it('returns false during SSR (renderToString)', () => {
    const html = renderToString(<ClientStatus />);
    expect(html).toContain('server');
    expect(html).not.toContain('client');
  });

  it('returns true after hydration on the client', () => {
    render(<ClientStatus />);
    expect(screen.getByTestId('status').textContent).toBe('client');
  });
});

// ─── SSRPlaceholder ───────────────────────────────────────────

describe('SSRPlaceholder', () => {
  it('renders a placeholder div during SSR instead of children', () => {
    const html = renderToString(
      <SSRPlaceholder width={600} height={400}>
        <div data-testid="chart">Chart content</div>
      </SSRPlaceholder>,
    );

    // Should contain the placeholder marker
    expect(html).toContain('data-ssr-placeholder="true"');
    // Should NOT contain the children content
    expect(html).not.toContain('Chart content');
  });

  it('applies width and height styles to the placeholder', () => {
    const html = renderToString(
      <SSRPlaceholder width="100%" height={300}>
        <div>Child</div>
      </SSRPlaceholder>,
    );

    expect(html).toContain('width:100%');
    expect(html).toContain('height:300px');
  });

  it('applies className to the placeholder', () => {
    const html = renderToString(
      <SSRPlaceholder className="my-chart-placeholder">
        <div>Child</div>
      </SSRPlaceholder>,
    );

    expect(html).toContain('my-chart-placeholder');
  });

  it('renders children on the client after mount', () => {
    render(
      <SSRPlaceholder width={600} height={400}>
        <div data-testid="chart">Chart content</div>
      </SSRPlaceholder>,
    );

    // After mount, children should be rendered
    expect(screen.getByTestId('chart').textContent).toBe('Chart content');
  });

  it('does not render the placeholder div on the client after mount', () => {
    const { container } = render(
      <SSRPlaceholder width={600} height={400}>
        <div>Chart content</div>
      </SSRPlaceholder>,
    );

    // After hydration, the placeholder should be gone
    const placeholder = container.querySelector('[data-ssr-placeholder]');
    expect(placeholder).toBeNull();
  });

  it('uses default dimensions when none are provided', () => {
    const html = renderToString(
      <SSRPlaceholder>
        <div>Child</div>
      </SSRPlaceholder>,
    );

    // Defaults: width='100%', height=300
    expect(html).toContain('width:100%');
    expect(html).toContain('height:300px');
  });

  it('does not crash when rendering a complex tree during SSR', () => {
    const html = renderToString(
      <div>
        <h1>Document Title</h1>
        <SSRPlaceholder width="100%" height={500} className="graph-area">
          <div>
            <svg>
              <circle cx="50" cy="50" r="40" />
            </svg>
          </div>
        </SSRPlaceholder>
        <p>Some text after the placeholder.</p>
      </div>,
    );

    expect(html).toContain('Document Title');
    expect(html).toContain('data-ssr-placeholder="true"');
    expect(html).toContain('Some text after the placeholder.');
    // The SVG children should NOT appear in the SSR output
    expect(html).not.toContain('<circle');
  });
});
