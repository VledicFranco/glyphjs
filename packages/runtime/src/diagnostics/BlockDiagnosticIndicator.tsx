import { useState, useCallback } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import type { Diagnostic } from '@glyphjs/types';

// ─── Props ────────────────────────────────────────────────────

interface BlockDiagnosticIndicatorProps {
  diagnostics: Diagnostic[];
}

// ─── Severity helpers ─────────────────────────────────────────

const severityColors: Record<Diagnostic['severity'], string> = {
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',
};

const severityBackgrounds: Record<Diagnostic['severity'], string> = {
  error: '#fef2f2',
  warning: '#fffbeb',
  info: '#eff6ff',
};

const severityIcons: Record<Diagnostic['severity'], string> = {
  error: '\u2716',
  warning: '\u26A0',
  info: '\u2139',
};

/** Determine the highest severity present in the diagnostics list. */
function highestSeverity(
  diagnostics: Diagnostic[],
): Diagnostic['severity'] {
  let has: Diagnostic['severity'] = 'info';
  for (const d of diagnostics) {
    if (d.severity === 'error') return 'error';
    if (d.severity === 'warning') has = 'warning';
  }
  return has;
}

function formatPosition(diagnostic: Diagnostic): string {
  if (!diagnostic.position) return '';
  const { start } = diagnostic.position;
  return `${String(start.line)}:${String(start.column)}`;
}

// ─── Styles ───────────────────────────────────────────────────

const wrapperStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
};

const detailsStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '4px',
  minWidth: '280px',
  maxWidth: '400px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: '12px',
  zIndex: 9998,
  overflow: 'hidden',
};

const detailItemStyle: CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #f3f4f6',
};

// ─── Component ────────────────────────────────────────────────

/**
 * Per-block indicator badge for blocks that have diagnostics.
 * Displays a small color-coded icon; click to expand inline details.
 */
export function BlockDiagnosticIndicator({
  diagnostics,
}: BlockDiagnosticIndicatorProps): ReactNode {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (diagnostics.length === 0) {
    return null;
  }

  const severity = highestSeverity(diagnostics);
  const color = severityColors[severity];
  const icon = severityIcons[severity];

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: color,
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    lineHeight: 1,
    padding: 0,
  };

  return (
    <span style={wrapperStyle} data-glyph-diagnostic-indicator>
      <button
        type="button"
        style={badgeStyle}
        onClick={toggle}
        aria-label={`${String(diagnostics.length)} diagnostic${diagnostics.length > 1 ? 's' : ''}`}
        aria-expanded={expanded}
        title={`${String(diagnostics.length)} diagnostic${diagnostics.length > 1 ? 's' : ''}`}
      >
        {icon}
      </button>

      {expanded && (
        <div style={detailsStyle} role="tooltip">
          {diagnostics.map((diagnostic, index) => {
            const dColor = severityColors[diagnostic.severity];
            const bg = severityBackgrounds[diagnostic.severity];
            const dIcon = severityIcons[diagnostic.severity];
            const pos = formatPosition(diagnostic);

            return (
              <div
                key={`${diagnostic.code}-${String(index)}`}
                style={{ ...detailItemStyle, backgroundColor: bg }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ color: dColor, fontWeight: 700 }}>
                    {dIcon}
                  </span>
                  <span style={{ color: dColor, fontWeight: 600 }}>
                    {diagnostic.severity}
                  </span>
                  {diagnostic.code && (
                    <span style={{ color: '#6b7280', fontSize: '10px' }}>
                      [{diagnostic.code}]
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: '#1f2937',
                    marginTop: '2px',
                    lineHeight: '1.4',
                  }}
                >
                  {diagnostic.message}
                </div>
                {pos && (
                  <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                    at {pos}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}
