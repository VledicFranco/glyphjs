// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Diagnostic } from '@glyphjs/types';
import { DiagnosticsOverlay } from '../diagnostics/DiagnosticsOverlay.js';
import { BlockDiagnosticIndicator } from '../diagnostics/BlockDiagnosticIndicator.js';

// ─── Test data ──────────────────────────────────────────────────

const errorDiagnostic: Diagnostic = {
  severity: 'error',
  code: 'PARSE_ERROR',
  message: 'Unexpected token at line 5',
  source: 'parser',
  position: {
    start: { line: 5, column: 12 },
    end: { line: 5, column: 20 },
  },
};

const warningDiagnostic: Diagnostic = {
  severity: 'warning',
  code: 'UNUSED_BLOCK',
  message: 'Block is defined but never referenced',
  source: 'compiler',
  position: {
    start: { line: 10, column: 1 },
    end: { line: 10, column: 30 },
  },
};

const infoDiagnostic: Diagnostic = {
  severity: 'info',
  code: 'HINT_OPTIMIZE',
  message: 'Consider using a code block for this content',
  source: 'runtime',
};

// ─── DiagnosticsOverlay ─────────────────────────────────────────

describe('DiagnosticsOverlay', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when diagnostics array is empty', () => {
    const { container } = render(<DiagnosticsOverlay diagnostics={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders the overlay with error diagnostics', () => {
    render(<DiagnosticsOverlay diagnostics={[errorDiagnostic]} />);

    const overlay = screen.getByRole('complementary', {
      name: 'Diagnostics overlay',
    });
    expect(overlay).toBeInTheDocument();

    // Check the summary
    expect(screen.getByText('1 error')).toBeInTheDocument();

    // Check the diagnostic message
    expect(
      screen.getByText('Unexpected token at line 5'),
    ).toBeInTheDocument();

    // Check the error severity label
    expect(screen.getByText('error')).toBeInTheDocument();

    // Check the code
    expect(screen.getByText('[PARSE_ERROR]')).toBeInTheDocument();

    // Check the position
    expect(screen.getByText('at 5:12')).toBeInTheDocument();
  });

  it('renders a summary with multiple severity counts', () => {
    render(
      <DiagnosticsOverlay
        diagnostics={[errorDiagnostic, warningDiagnostic, infoDiagnostic]}
      />,
    );

    expect(screen.getByText('1 error, 1 warning, 1 info')).toBeInTheDocument();
  });

  it('pluralizes error count correctly', () => {
    const twoErrors: Diagnostic[] = [
      { ...errorDiagnostic, code: 'ERR1' },
      { ...errorDiagnostic, code: 'ERR2', message: 'Another error' },
    ];

    render(<DiagnosticsOverlay diagnostics={twoErrors} />);

    expect(screen.getByText('2 errors')).toBeInTheDocument();
  });

  it('pluralizes warning count correctly', () => {
    const twoWarnings: Diagnostic[] = [
      { ...warningDiagnostic, code: 'W1' },
      { ...warningDiagnostic, code: 'W2', message: 'Another warning' },
    ];

    render(<DiagnosticsOverlay diagnostics={twoWarnings} />);

    expect(screen.getByText('2 warnings')).toBeInTheDocument();
  });

  it('dismisses on close button click', () => {
    render(
      <DiagnosticsOverlay diagnostics={[errorDiagnostic]} />,
    );

    const overlay = screen.getByRole('complementary', {
      name: 'Diagnostics overlay',
    });
    expect(overlay).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', {
      name: 'Dismiss diagnostics',
    });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByRole('complementary', { name: 'Diagnostics overlay' }),
    ).not.toBeInTheDocument();
  });

  it('dismisses on Escape key press', () => {
    render(
      <DiagnosticsOverlay diagnostics={[errorDiagnostic]} />,
    );

    expect(
      screen.getByRole('complementary', { name: 'Diagnostics overlay' }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(
      screen.queryByRole('complementary', { name: 'Diagnostics overlay' }),
    ).not.toBeInTheDocument();
  });

  it('does not dismiss on other key presses', () => {
    render(
      <DiagnosticsOverlay diagnostics={[errorDiagnostic]} />,
    );

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(
      screen.getByRole('complementary', { name: 'Diagnostics overlay' }),
    ).toBeInTheDocument();
  });

  it('resets dismissed state when diagnostics change', () => {
    const { rerender } = render(
      <DiagnosticsOverlay diagnostics={[errorDiagnostic]} />,
    );

    // Dismiss the overlay
    const closeBtn = screen.getByRole('button', {
      name: 'Dismiss diagnostics',
    });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByRole('complementary', { name: 'Diagnostics overlay' }),
    ).not.toBeInTheDocument();

    // Re-render with new diagnostics
    const newDiagnostics: Diagnostic[] = [
      {
        severity: 'warning',
        code: 'NEW_WARNING',
        message: 'New issue found',
        source: 'compiler',
      },
    ];
    rerender(<DiagnosticsOverlay diagnostics={newDiagnostics} />);

    // Overlay should be visible again
    expect(
      screen.getByRole('complementary', { name: 'Diagnostics overlay' }),
    ).toBeInTheDocument();
    expect(screen.getByText('New issue found')).toBeInTheDocument();
  });

  it('does not display position when diagnostic has no position', () => {
    render(<DiagnosticsOverlay diagnostics={[infoDiagnostic]} />);

    // The info diagnostic has no position, so "at" should not appear
    expect(screen.queryByText(/^at \d+:\d+$/)).not.toBeInTheDocument();
  });

  it('renders all diagnostics in the list', () => {
    const all = [errorDiagnostic, warningDiagnostic, infoDiagnostic];
    render(<DiagnosticsOverlay diagnostics={all} />);

    expect(
      screen.getByText('Unexpected token at line 5'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Block is defined but never referenced'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Consider using a code block for this content'),
    ).toBeInTheDocument();
  });

  it('renders the diagnostic code when present', () => {
    render(<DiagnosticsOverlay diagnostics={[errorDiagnostic]} />);

    expect(screen.getByText('[PARSE_ERROR]')).toBeInTheDocument();
  });

  it('has correct ARIA attributes on the overlay', () => {
    render(<DiagnosticsOverlay diagnostics={[errorDiagnostic]} />);

    const overlay = screen.getByRole('complementary');
    expect(overlay).toHaveAttribute('aria-label', 'Diagnostics overlay');
    expect(overlay).toHaveAttribute('data-glyph-diagnostics-overlay');
  });
});

// ─── BlockDiagnosticIndicator ───────────────────────────────────

describe('BlockDiagnosticIndicator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when diagnostics array is empty', () => {
    const { container } = render(
      <BlockDiagnosticIndicator diagnostics={[]} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders a badge button for a single error diagnostic', () => {
    render(
      <BlockDiagnosticIndicator diagnostics={[errorDiagnostic]} />,
    );

    const badge = screen.getByRole('button', {
      name: '1 diagnostic',
    });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-expanded', 'false');
  });

  it('pluralizes the aria-label for multiple diagnostics', () => {
    render(
      <BlockDiagnosticIndicator
        diagnostics={[errorDiagnostic, warningDiagnostic]}
      />,
    );

    const badge = screen.getByRole('button', {
      name: '2 diagnostics',
    });
    expect(badge).toBeInTheDocument();
  });

  it('toggles expanded state on click', () => {
    render(
      <BlockDiagnosticIndicator diagnostics={[errorDiagnostic]} />,
    );

    const badge = screen.getByRole('button', { name: '1 diagnostic' });
    expect(badge).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(badge);

    expect(badge).toHaveAttribute('aria-expanded', 'true');
    // The details tooltip should now be visible
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(badge);

    expect(badge).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows diagnostic details when expanded', () => {
    render(
      <BlockDiagnosticIndicator diagnostics={[errorDiagnostic]} />,
    );

    const badge = screen.getByRole('button', { name: '1 diagnostic' });
    fireEvent.click(badge);

    expect(screen.getByText('Unexpected token at line 5')).toBeInTheDocument();
    expect(screen.getByText('[PARSE_ERROR]')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('at 5:12')).toBeInTheDocument();
  });

  it('shows the highest severity icon (error > warning > info)', () => {
    // When there's a mix, the badge should reflect the highest severity
    render(
      <BlockDiagnosticIndicator
        diagnostics={[warningDiagnostic, errorDiagnostic]}
      />,
    );

    // The badge should exist and use error color
    const badge = screen.getByRole('button', { name: '2 diagnostics' });
    expect(badge).toBeInTheDocument();
    // jsdom normalizes hex to rgb; #dc2626 = rgb(220, 38, 38)
    expect(badge.style.backgroundColor).toBe('rgb(220, 38, 38)');
  });

  it('uses warning color when there are only warnings and infos', () => {
    render(
      <BlockDiagnosticIndicator
        diagnostics={[warningDiagnostic, infoDiagnostic]}
      />,
    );

    const badge = screen.getByRole('button', { name: '2 diagnostics' });
    // jsdom normalizes hex to rgb; #d97706 = rgb(217, 119, 6)
    expect(badge.style.backgroundColor).toBe('rgb(217, 119, 6)');
  });

  it('uses info color when there are only info diagnostics', () => {
    render(
      <BlockDiagnosticIndicator diagnostics={[infoDiagnostic]} />,
    );

    const badge = screen.getByRole('button', { name: '1 diagnostic' });
    // jsdom normalizes hex to rgb; #2563eb = rgb(37, 99, 235)
    expect(badge.style.backgroundColor).toBe('rgb(37, 99, 235)');
  });

  it('does not display position when diagnostic has no position', () => {
    render(
      <BlockDiagnosticIndicator diagnostics={[infoDiagnostic]} />,
    );

    const badge = screen.getByRole('button', { name: '1 diagnostic' });
    fireEvent.click(badge);

    // The info diagnostic has no position
    expect(screen.queryByText(/^at \d+:\d+$/)).not.toBeInTheDocument();
  });

  it('shows all diagnostics in the expanded details', () => {
    const all = [errorDiagnostic, warningDiagnostic, infoDiagnostic];
    render(<BlockDiagnosticIndicator diagnostics={all} />);

    const badge = screen.getByRole('button', { name: '3 diagnostics' });
    fireEvent.click(badge);

    expect(
      screen.getByText('Unexpected token at line 5'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Block is defined but never referenced'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Consider using a code block for this content'),
    ).toBeInTheDocument();
  });

  it('has a data-glyph-diagnostic-indicator attribute on the wrapper', () => {
    const { container } = render(
      <BlockDiagnosticIndicator diagnostics={[errorDiagnostic]} />,
    );

    const wrapper = container.querySelector(
      '[data-glyph-diagnostic-indicator]',
    );
    expect(wrapper).not.toBeNull();
  });

  it('has the correct title attribute with count', () => {
    render(
      <BlockDiagnosticIndicator
        diagnostics={[errorDiagnostic, warningDiagnostic]}
      />,
    );

    const badge = screen.getByRole('button', { name: '2 diagnostics' });
    expect(badge).toHaveAttribute('title', '2 diagnostics');
  });

  it('has singular title for single diagnostic', () => {
    render(
      <BlockDiagnosticIndicator diagnostics={[warningDiagnostic]} />,
    );

    const badge = screen.getByRole('button', { name: '1 diagnostic' });
    expect(badge).toHaveAttribute('title', '1 diagnostic');
  });
});

// ─── Diagnostics integration behavior ───────────────────────────

describe('Diagnostics integration', () => {
  it('DiagnosticsOverlay and BlockDiagnosticIndicator render the same diagnostic data consistently', () => {
    const diagnostics = [errorDiagnostic, warningDiagnostic];

    const { container: overlayContainer } = render(
      <DiagnosticsOverlay diagnostics={diagnostics} />,
    );
    const { container: indicatorContainer } = render(
      <BlockDiagnosticIndicator diagnostics={diagnostics} />,
    );

    // Both should render (not be empty)
    expect(overlayContainer.innerHTML).not.toBe('');
    expect(indicatorContainer.innerHTML).not.toBe('');
  });

  it('DiagnosticsOverlay shows summary for mixed severity diagnostics', () => {
    const diagnostics = [
      errorDiagnostic,
      errorDiagnostic,
      warningDiagnostic,
      infoDiagnostic,
    ];

    render(<DiagnosticsOverlay diagnostics={diagnostics} />);

    expect(screen.getByText('2 errors, 1 warning, 1 info')).toBeInTheDocument();
  });
});
