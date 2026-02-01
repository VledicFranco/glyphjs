import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import type { Diagnostic } from '@glyphjs/types';

// ─── Props ────────────────────────────────────────────────────

interface DiagnosticsOverlayProps {
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
  error: '\u2716', // heavy multiplication sign
  warning: '\u26A0', // warning sign
  info: '\u2139', // information source
};

function formatPosition(diagnostic: Diagnostic): string {
  if (!diagnostic.position) return '';
  const { start } = diagnostic.position;
  return `${String(start.line)}:${String(start.column)}`;
}

// ─── Styles ───────────────────────────────────────────────────

const overlayStyle: CSSProperties = {
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  maxWidth: '480px',
  maxHeight: '60vh',
  overflowY: 'auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: '13px',
  zIndex: 9999,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  borderRadius: '8px 8px 0 0',
};

const closeButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#6b7280',
  padding: '2px 6px',
  borderRadius: '4px',
  lineHeight: 1,
};

const itemStyle: CSSProperties = {
  padding: '8px 14px',
  borderBottom: '1px solid #f3f4f6',
};

const itemHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const codeStyle: CSSProperties = {
  color: '#6b7280',
  fontSize: '11px',
};

const messageStyle: CSSProperties = {
  marginTop: '2px',
  color: '#1f2937',
  lineHeight: '1.4',
};

const positionStyle: CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  marginTop: '2px',
};

// ─── Component ────────────────────────────────────────────────

/**
 * Dev-mode overlay that displays compilation diagnostics.
 * Shows an aggregate summary and a scrollable list of diagnostics
 * with severity icons/colors, codes, messages, and source positions.
 * Dismissable via a close button or the Escape key.
 * Only rendered when diagnostics are present.
 */
export function DiagnosticsOverlay({
  diagnostics,
}: DiagnosticsOverlayProps): ReactNode {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when diagnostics change
  useEffect(() => {
    setDismissed(false);
  }, [diagnostics]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setDismissed(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const summary = useMemo(() => {
    let errors = 0;
    let warnings = 0;
    let infos = 0;
    for (const d of diagnostics) {
      if (d.severity === 'error') errors++;
      else if (d.severity === 'warning') warnings++;
      else infos++;
    }
    const parts: string[] = [];
    if (errors > 0) parts.push(`${String(errors)} error${errors > 1 ? 's' : ''}`);
    if (warnings > 0)
      parts.push(`${String(warnings)} warning${warnings > 1 ? 's' : ''}`);
    if (infos > 0) parts.push(`${String(infos)} info`);
    return parts.join(', ');
  }, [diagnostics]);

  if (diagnostics.length === 0 || dismissed) {
    return null;
  }

  return (
    <div
      style={overlayStyle}
      data-glyph-diagnostics-overlay
      role="complementary"
      aria-label="Diagnostics overlay"
    >
      {/* Header with summary and close button */}
      <div style={headerStyle}>
        <span style={{ fontWeight: 600, color: '#1f2937' }}>{summary}</span>
        <button
          type="button"
          style={closeButtonStyle}
          onClick={handleDismiss}
          aria-label="Dismiss diagnostics"
        >
          {'\u2715'}
        </button>
      </div>

      {/* Diagnostic list */}
      <div>
        {diagnostics.map((diagnostic, index) => {
          const color = severityColors[diagnostic.severity];
          const bg = severityBackgrounds[diagnostic.severity];
          const icon = severityIcons[diagnostic.severity];
          const pos = formatPosition(diagnostic);

          return (
            <div
              key={`${diagnostic.code}-${String(index)}`}
              style={{ ...itemStyle, backgroundColor: bg }}
            >
              <div style={itemHeaderStyle}>
                <span style={{ color, fontWeight: 700 }}>{icon}</span>
                <span style={{ color, fontWeight: 600 }}>
                  {diagnostic.severity}
                </span>
                {diagnostic.code && (
                  <span style={codeStyle}>[{diagnostic.code}]</span>
                )}
              </div>
              <div style={messageStyle}>{diagnostic.message}</div>
              {pos && <div style={positionStyle}>at {pos}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
