import type { ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';

// ─── Types ─────────────────────────────────────────────────────

export interface CalloutData {
  type: 'info' | 'warning' | 'error' | 'tip';
  title?: string | InlineNode[];
  content: string | InlineNode[];
  markdown?: boolean;
}

type CalloutType = CalloutData['type'];

// ─── Icon map ──────────────────────────────────────────────────

const CALLOUT_ICONS: Record<CalloutType, string> = {
  info: '\u2139\uFE0F',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
  tip: '\uD83D\uDCA1',
};

// ─── Label map (for aria-label) ────────────────────────────────

const CALLOUT_LABELS: Record<CalloutType, string> = {
  info: 'Information',
  warning: 'Warning',
  error: 'Error',
  tip: 'Tip',
};

// ─── Component ─────────────────────────────────────────────────

/**
 * Renders a styled callout box with variant-specific icon, optional title,
 * and content text.  Styling is driven by `--glyph-callout-{type}-bg` and
 * `--glyph-callout-{type}-border` CSS custom properties so consumers can
 * re-theme via the Glyph theme system.
 */
export function Callout({ data }: GlyphComponentProps<CalloutData>): ReactElement {
  const { type, title, content } = data;

  const containerStyle: React.CSSProperties = {
    backgroundColor: `var(--glyph-callout-${type}-bg)`,
    borderLeft: `4px solid var(--glyph-callout-${type}-border)`,
    borderRadius: 'var(--glyph-radius-md, 0.1875rem)',
    padding: 'var(--glyph-spacing-md, 1rem)',
    margin: 'var(--glyph-spacing-sm, 0.5rem) 0',
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
    display: 'flex',
    gap: 'var(--glyph-spacing-sm, 0.5rem)',
    alignItems: 'flex-start',
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    fontSize: '1.25em',
    lineHeight: 1,
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    marginBottom: 'var(--glyph-spacing-xs, 0.25rem)',
  };

  return (
    <div role="note" aria-label={CALLOUT_LABELS[type]} style={containerStyle}>
      <span style={iconStyle} aria-hidden="true">
        {CALLOUT_ICONS[type]}
      </span>
      <div style={bodyStyle}>
        {title && (
          <div style={titleStyle}>
            <RichText content={title} />
          </div>
        )}
        <div>
          <RichText content={content} />
        </div>
      </div>
    </div>
  );
}
