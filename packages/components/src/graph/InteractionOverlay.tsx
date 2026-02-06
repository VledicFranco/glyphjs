import type { ReactElement, CSSProperties } from 'react';
import type { InteractionMode } from './useZoomInteraction.js';

export interface InteractionOverlayProps {
  mode: InteractionMode;
  isActive: boolean;
  onActivate: () => void;
  width: string;
  height: string;
}

/**
 * Visual feedback overlay for graph interaction modes.
 * Shows tooltips or activation prompts based on the mode.
 */
export function InteractionOverlay({
  mode,
  isActive,
  onActivate,
  width,
  height,
}: InteractionOverlayProps): ReactElement {
  // For modifier-key mode: show tooltip
  if (mode === 'modifier-key') {
    return (
      <div
        className="glyph-interaction-overlay"
        style={{
          ...OVERLAY_BASE_STYLE,
          width,
          height,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div style={TOOLTIP_STYLE}>
          <span style={TOOLTIP_TEXT_STYLE}>Alt + scroll to zoom</span>
        </div>
      </div>
    );
  }

  // For click-to-activate mode: show activation overlay
  if (mode === 'click-to-activate' && !isActive) {
    return (
      <>
        <div
          className="glyph-interaction-overlay"
          style={{
            ...OVERLAY_BASE_STYLE,
            ...ACTIVATION_OVERLAY_STYLE,
            width,
            height,
          }}
          onClick={onActivate}
          role="button"
          tabIndex={0}
          aria-label="Click to activate graph interaction"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onActivate();
            }
          }}
        >
          <div style={ACTIVATION_TEXT_STYLE}>Click to interact</div>
        </div>
        <div style={SR_ONLY_STYLE} role="status" aria-live="polite" aria-atomic="true">
          Graph interaction inactive. Click to activate.
        </div>
      </>
    );
  }

  // Active state: show border highlight
  if (mode === 'click-to-activate' && isActive) {
    return (
      <>
        <div
          style={{
            ...OVERLAY_BASE_STYLE,
            width,
            height,
            pointerEvents: 'none',
            border: '2px solid var(--glyph-interaction-active-border, #0a9d7c)',
            borderRadius: '4px',
          }}
          aria-hidden="true"
        />
        <div style={SR_ONLY_STYLE} role="status" aria-live="polite" aria-atomic="true">
          Graph interaction active. Press Escape to deactivate.
        </div>
      </>
    );
  }

  return <></>;
}

// ─── Styles ──────────────────────────────────────────────────────

const OVERLAY_BASE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};

const TOOLTIP_STYLE: CSSProperties = {
  position: 'absolute',
  bottom: '12px',
  right: '12px',
  padding: '6px 10px',
  backgroundColor: 'var(--glyph-interaction-tooltip-bg, rgba(26, 32, 53, 0.9))',
  color: 'var(--glyph-interaction-tooltip-text, #f4f6fa)',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  pointerEvents: 'none',
};

const TOOLTIP_TEXT_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const ACTIVATION_OVERLAY_STYLE: CSSProperties = {
  backgroundColor: 'var(--glyph-interaction-overlay-bg, rgba(244, 246, 250, 0.8))',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const ACTIVATION_TEXT_STYLE: CSSProperties = {
  padding: '12px 20px',
  backgroundColor: 'var(--glyph-interaction-tooltip-bg, rgba(26, 32, 53, 0.9))',
  color: 'var(--glyph-interaction-tooltip-text, #f4f6fa)',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: 500,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
};

/** CSS properties to visually hide content while keeping it accessible to screen readers. */
const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
