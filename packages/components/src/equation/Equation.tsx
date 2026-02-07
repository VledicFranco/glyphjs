import type { CSSProperties, ReactElement } from 'react';
import katex from 'katex';
import type { GlyphComponentProps, InlineNode } from '@glyphjs/types';
import { RichText } from '@glyphjs/runtime';

// ─── Types ───────────────────────────────────────────────────

export interface EquationStep {
  expression: string;
  annotation?: string | InlineNode[];
}

export interface EquationData {
  expression?: string;
  label?: string | InlineNode[];
  steps?: EquationStep[];
  markdown?: boolean;
}

// ─── LaTeX Rendering ─────────────────────────────────────────

function renderLatex(expression: string): { html: string; error: boolean } {
  try {
    const html = katex.renderToString(expression, {
      throwOnError: false,
      displayMode: true,
    });
    return { html, error: false };
  } catch {
    return { html: '', error: true };
  }
}

// ─── Styles ──────────────────────────────────────────────────

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const labelStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  marginTop: '0.25rem',
};

const stepsContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '100%',
};

const stepRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5rem',
};

const annotationStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  fontStyle: 'italic',
  minWidth: '120px',
};

const fallbackStyle: CSSProperties = {
  fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
  fontSize: '0.875rem',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  background: 'var(--glyph-surface-raised, #162038)',
  color: 'var(--glyph-text, #d4dae3)',
  border: '1px solid var(--glyph-border, #1a2035)',
};

// ─── Component ──────────────────────────────────────────────

export function Equation({ data }: GlyphComponentProps<EquationData>): ReactElement {
  // Single expression mode
  if (data.expression !== undefined) {
    const { html, error } = renderLatex(data.expression);
    const ariaLabel = `Equation: ${data.expression}`;

    return (
      <div style={containerStyle} role="math" aria-label={ariaLabel}>
        {error || html === '' ? (
          <code style={fallbackStyle}>{data.expression}</code>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: html }} />
        )}
        {data.label !== undefined && (
          <div style={labelStyle}>
            <RichText content={data.label} />
          </div>
        )}
      </div>
    );
  }

  // Steps mode
  if (data.steps !== undefined && data.steps.length > 0) {
    const allExpressions = data.steps.map((s) => s.expression).join('; ');
    const ariaLabel = `Equation steps: ${allExpressions}`;

    return (
      <div style={containerStyle} role="math" aria-label={ariaLabel}>
        <div style={stepsContainerStyle}>
          {data.steps.map((step, idx) => {
            const { html, error } = renderLatex(step.expression);

            return (
              <div key={idx} style={stepRowStyle}>
                {error || html === '' ? (
                  <code style={fallbackStyle}>{step.expression}</code>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: html }} />
                )}
                {step.annotation !== undefined && (
                  <span style={annotationStyle}>
                    <RichText content={step.annotation} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {data.label !== undefined && (
          <div style={labelStyle}>
            <RichText content={data.label} />
          </div>
        )}
      </div>
    );
  }

  // Fallback (shouldn't happen with valid data)
  return (
    <div style={containerStyle} role="math" aria-label="Empty equation">
      <span style={{ color: 'var(--glyph-text-muted, #6b7a94)' }}>No equation provided</span>
    </div>
  );
}
