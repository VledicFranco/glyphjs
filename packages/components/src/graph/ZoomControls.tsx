import type { ReactElement, CSSProperties } from 'react';

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * Zoom control buttons for graph interactions.
 * Provides +/- buttons and a reset button for zoom/pan.
 */
export function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps): ReactElement {
  return (
    <div style={CONTROLS_CONTAINER_STYLE}>
      <button
        onClick={onZoomIn}
        style={BUTTON_STYLE}
        aria-label="Zoom in"
        title="Zoom in"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <line x1="8" y1="4" x2="8" y2="12" strokeWidth="2" />
          <line x1="4" y1="8" x2="12" y2="8" strokeWidth="2" />
        </svg>
      </button>

      <button
        onClick={onZoomOut}
        style={BUTTON_STYLE}
        aria-label="Zoom out"
        title="Zoom out"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <line x1="4" y1="8" x2="12" y2="8" strokeWidth="2" />
        </svg>
      </button>

      <button
        onClick={onReset}
        style={BUTTON_STYLE}
        aria-label="Reset zoom"
        title="Reset zoom"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="10" height="10" strokeWidth="2" rx="1" />
        </svg>
      </button>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const CONTROLS_CONTAINER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  zIndex: 10,
};

const BUTTON_STYLE: CSSProperties = {
  width: '32px',
  height: '32px',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--glyph-surface-raised, #f4f6fa)',
  border: '1px solid var(--glyph-border, #d0d8e4)',
  borderRadius: '4px',
  color: 'var(--glyph-text, #1a2035)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};
