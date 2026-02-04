import type { ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface StepItem {
  title: string;
  status?: 'pending' | 'active' | 'completed';
  content: string;
}

export interface StepsData {
  steps: StepItem[];
}

type StepStatus = NonNullable<StepItem['status']>;

// ─── Status labels (for aria-label) ───────────────────────────

const STATUS_LABELS: Record<StepStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
};

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a vertical list of steps with status indicators.
 * Each step displays a circle (pending), highlighted circle (active),
 * or a checkmark (completed).
 *
 * Theming is driven by CSS custom properties:
 *  - `--glyph-steps-pending-color`
 *  - `--glyph-steps-active-color`
 *  - `--glyph-steps-completed-color`
 *  - `--glyph-steps-connector-color`
 */
export function Steps({ data }: GlyphComponentProps<StepsData>): ReactElement {
  const { steps } = data;

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 'var(--glyph-spacing-sm, 0.5rem) 0',
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
  };

  return (
    <ol role="list" style={listStyle}>
      {steps.map((step, index) => {
        const status: StepStatus = step.status ?? 'pending';
        const isLast = index === steps.length - 1;

        return (
          <li
            key={index}
            aria-label={`Step ${String(index + 1)}: ${step.title} — ${STATUS_LABELS[status]}`}
            {...(status === 'active' ? { 'aria-current': 'step' as const } : {})}
            style={itemStyle(isLast)}
          >
            {/* Connector line (drawn behind the indicator) */}
            {!isLast && <span aria-hidden="true" style={connectorStyle(status)} />}

            {/* Status indicator circle / checkmark */}
            <span aria-hidden="true" style={indicatorStyle(status)}>
              {status === 'completed' ? '\u2713' : ''}
            </span>

            {/* Text body */}
            <div style={bodyStyle}>
              <div style={titleStyle(status)}>{step.title}</div>
              <div style={contentStyle(status)}>{step.content}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Style helpers ───────────────────────────────────────────

const INDICATOR_SIZE = '1.5rem';
const CONNECTOR_WIDTH = '2px';

function colorForStatus(status: StepStatus): string {
  switch (status) {
    case 'pending':
      return 'var(--glyph-steps-pending-color, #7a8599)';
    case 'active':
      return 'var(--glyph-steps-active-color, #00d4aa)';
    case 'completed':
      return 'var(--glyph-steps-completed-color, #22c55e)';
  }
}

function itemStyle(isLast: boolean): React.CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    gap: 'var(--glyph-spacing-sm, 0.75rem)',
    alignItems: 'flex-start',
    paddingBottom: isLast ? 0 : 'var(--glyph-spacing-md, 1.25rem)',
  };
}

function connectorStyle(status: StepStatus): React.CSSProperties {
  return {
    position: 'absolute',
    left: `calc(${INDICATOR_SIZE} / 2 - ${CONNECTOR_WIDTH} / 2)`,
    top: INDICATOR_SIZE,
    bottom: 0,
    width: CONNECTOR_WIDTH,
    backgroundColor:
      status === 'completed'
        ? 'var(--glyph-steps-completed-color, #22c55e)'
        : 'var(--glyph-steps-connector-color, #d0d8e4)',
  };
}

function indicatorStyle(status: StepStatus): React.CSSProperties {
  const color = colorForStatus(status);

  return {
    flexShrink: 0,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    lineHeight: 1,
    color: status === 'completed' ? '#fff' : color,
    backgroundColor: status === 'completed' ? color : 'transparent',
    border: status === 'completed' ? 'none' : `${CONNECTOR_WIDTH} solid ${color}`,
    boxSizing: 'border-box',
  };
}

const bodyStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  paddingTop: '0.1rem',
};

function titleStyle(status: StepStatus): React.CSSProperties {
  return {
    fontWeight: 600,
    color:
      status === 'pending'
        ? 'var(--glyph-steps-pending-color, #7a8599)'
        : 'var(--glyph-text, #1a2035)',
  };
}

function contentStyle(status: StepStatus): React.CSSProperties {
  return {
    marginTop: 'var(--glyph-spacing-xs, 0.25rem)',
    fontSize: '0.9em',
    color:
      status === 'pending'
        ? 'var(--glyph-steps-pending-color, #7a8599)'
        : 'var(--glyph-text-muted, #7a8599)',
  };
}
