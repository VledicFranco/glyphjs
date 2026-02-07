import { useMemo, type ReactElement } from 'react';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';
import { computeDiff } from './diff.js';
import type { DiffLine } from './diff.js';

// ─── Types ─────────────────────────────────────────────────────

export interface CodeDiffData {
  language?: string;
  before: string;
  after: string;
  beforeLabel?: string | InlineNode[];
  afterLabel?: string | InlineNode[];
  markdown?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────

function summarizeDiff(lines: DiffLine[]): string {
  const added = lines.filter((l) => l.kind === 'add').length;
  const removed = lines.filter((l) => l.kind === 'del').length;
  return `Code diff: ${String(added)} line${added !== 1 ? 's' : ''} added, ${String(removed)} line${removed !== 1 ? 's' : ''} removed`;
}

const GUTTER_MARKERS: Record<string, string> = {
  add: '+',
  del: '-',
  eq: ' ',
};

const ARIA_LABELS: Record<string, string> = {
  add: 'added',
  del: 'removed',
  eq: 'unchanged',
};

// ─── Component ─────────────────────────────────────────────────

export function CodeDiff({ data, block }: GlyphComponentProps<CodeDiffData>): ReactElement {
  const { before, after, beforeLabel, afterLabel } = data;
  const baseId = `glyph-codediff-${block.id}`;

  const diffLines = useMemo(() => computeDiff(before, after), [before, after]);
  const summary = useMemo(() => summarizeDiff(diffLines), [diffLines]);

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--glyph-font-mono, ui-monospace, "Cascadia Code", "Fira Code", monospace)',
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    color: 'var(--glyph-text, #1a2035)',
    border: '1px solid var(--glyph-border, #d0d8e4)',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    overflow: 'hidden',
  };

  const labelBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    padding: 'var(--glyph-spacing-xs, 0.25rem) var(--glyph-spacing-md, 1rem)',
    background: 'var(--glyph-codediff-gutter-bg, var(--glyph-surface, #e8ecf3))',
    borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--glyph-text-muted, #6b7a94)',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  };

  const gutterStyle: React.CSSProperties = {
    width: '1.5rem',
    textAlign: 'center',
    userSelect: 'none',
    color: 'var(--glyph-text-muted, #6b7a94)',
    background: 'var(--glyph-codediff-gutter-bg, var(--glyph-surface, #e8ecf3))',
    borderRight: '1px solid var(--glyph-border, #d0d8e4)',
    verticalAlign: 'top',
    padding: '0 0.25rem',
  };

  const lineNoStyle: React.CSSProperties = {
    width: '2.5rem',
    textAlign: 'right',
    userSelect: 'none',
    color: 'var(--glyph-text-muted, #6b7a94)',
    paddingRight: '0.5rem',
    verticalAlign: 'top',
  };

  const codeStyle: React.CSSProperties = {
    paddingLeft: '0.5rem',
    whiteSpace: 'pre',
    overflowX: 'auto',
    verticalAlign: 'top',
  };

  function rowBg(kind: string): string | undefined {
    if (kind === 'add') return 'var(--glyph-codediff-add-bg, rgba(22, 163, 106, 0.1))';
    if (kind === 'del') return 'var(--glyph-codediff-del-bg, rgba(220, 38, 38, 0.1))';
    return undefined;
  }

  function rowColor(kind: string): string | undefined {
    if (kind === 'add') return 'var(--glyph-codediff-add-color, inherit)';
    if (kind === 'del') return 'var(--glyph-codediff-del-color, inherit)';
    return undefined;
  }

  return (
    <div id={baseId} role="region" aria-label={summary} style={containerStyle}>
      {(beforeLabel || afterLabel) && (
        <div style={labelBarStyle}>
          {beforeLabel && (
            <span>
              <RichText content={beforeLabel} />
            </span>
          )}
          {beforeLabel && afterLabel && <span>→</span>}
          {afterLabel && (
            <span>
              <RichText content={afterLabel} />
            </span>
          )}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table role="grid" style={tableStyle}>
          <tbody>
            {diffLines.map((line, i) => (
              <tr
                key={i}
                aria-label={ARIA_LABELS[line.kind]}
                style={{ background: rowBg(line.kind), color: rowColor(line.kind) }}
              >
                <td style={gutterStyle}>{GUTTER_MARKERS[line.kind]}</td>
                <td style={lineNoStyle}>{line.oldLineNo ?? ''}</td>
                <td style={lineNoStyle}>{line.newLineNo ?? ''}</td>
                <td style={codeStyle}>{line.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
