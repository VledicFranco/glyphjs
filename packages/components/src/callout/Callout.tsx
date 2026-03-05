import type { ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';

// ─── Types ─────────────────────────────────────────────────────

export interface CalloutData {
  type: 'info' | 'warning' | 'error' | 'tip';
  title?: string | InlineNode[];
  content: string | InlineNode[];
}

type CalloutType = CalloutData['type'];

// ─── Color maps ─────────────────────────────────────────────

const CALLOUT_BORDER_MAP: Record<CalloutType, string> = {
  info: 'var(--glyph-callout-info-border, var(--glyph-color-info, #38bdf8))',
  warning: 'var(--glyph-callout-warning-border, var(--glyph-color-warning, #d97706))',
  error: 'var(--glyph-callout-error-border, var(--glyph-color-error, #dc2626))',
  tip: 'var(--glyph-callout-tip-border, var(--glyph-color-success, #16a34a))',
};

const CALLOUT_BG_MAP: Record<CalloutType, string> = {
  info: 'var(--glyph-callout-info-bg, rgba(56, 189, 248, 0.08))',
  warning: 'var(--glyph-callout-warning-bg, rgba(217, 119, 6, 0.08))',
  error: 'var(--glyph-callout-error-bg, rgba(220, 38, 38, 0.08))',
  tip: 'var(--glyph-callout-tip-bg, rgba(22, 163, 74, 0.08))',
};

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
    backgroundColor: CALLOUT_BG_MAP[type],
    borderLeft: `4px solid ${CALLOUT_BORDER_MAP[type]}`,
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
