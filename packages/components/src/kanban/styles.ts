import type { CSSProperties } from 'react';

export const containerStyle: CSSProperties = {
  fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
  color: 'var(--glyph-text, #1a2035)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: 'var(--glyph-radius-md, 0.5rem)',
  overflow: 'hidden',
};

export const headerStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '1.125rem',
  padding: 'var(--glyph-spacing-md, 1rem)',
  borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
  color: 'var(--glyph-heading, #0a0e1a)',
};

export const boardStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--glyph-spacing-sm, 0.5rem)',
  padding: 'var(--glyph-spacing-md, 1rem)',
  overflowX: 'auto',
  minHeight: '200px',
};

export function columnStyle(isOver: boolean): CSSProperties {
  return {
    flex: '1 1 0',
    minWidth: '180px',
    background: isOver
      ? 'var(--glyph-accent-subtle, #e6f6f2)'
      : 'var(--glyph-kanban-column-bg, var(--glyph-surface, #e8ecf3))',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    padding: 'var(--glyph-spacing-sm, 0.5rem)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background 0.15s ease',
  };
}

export const columnHeaderStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '0.8125rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: '0.375rem 0.5rem',
  marginBottom: '0.375rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const columnCountStyle: CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 400,
  color: 'var(--glyph-text-muted, #6b7a94)',
};

export function cardStyle(isGrabbed: boolean, priority?: string): CSSProperties {
  const priorityColors: Record<string, string> = {
    high: 'var(--glyph-kanban-priority-high, #dc2626)',
    medium: 'var(--glyph-kanban-priority-medium, #f59e0b)',
    low: 'var(--glyph-kanban-priority-low, #22c55e)',
  };

  return {
    background: 'var(--glyph-kanban-card-bg, var(--glyph-surface-raised, #f4f6fa))',
    border: `1px solid var(--glyph-kanban-card-border, var(--glyph-border, #d0d8e4))`,
    borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
    padding: '0.625rem 0.75rem',
    marginBottom: '0.375rem',
    cursor: isGrabbed ? 'grabbing' : 'grab',
    userSelect: 'none',
    boxShadow: isGrabbed
      ? 'var(--glyph-kanban-drag-shadow, var(--glyph-shadow-md, 0 4px 12px rgba(0,0,0,0.15)))'
      : 'none',
    borderLeft:
      priority && priorityColors[priority] ? `3px solid ${priorityColors[priority]}` : undefined,
    outline: isGrabbed ? '2px solid var(--glyph-accent, #0a9d7c)' : 'none',
    outlineOffset: '-2px',
  };
}

export const cardTitleStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: '0.25rem',
};

export const cardDescStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
  lineHeight: 1.4,
};

export const tagContainerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.25rem',
  marginTop: '0.375rem',
};

export const tagStyle: CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 600,
  padding: '0.125rem 0.375rem',
  borderRadius: '9999px',
  background: 'var(--glyph-accent-subtle, #e6f6f2)',
  color: 'var(--glyph-accent, #0a9d7c)',
};

export const limitStyle: CSSProperties = {
  fontSize: '0.625rem',
  color: 'var(--glyph-text-muted, #6b7a94)',
};
