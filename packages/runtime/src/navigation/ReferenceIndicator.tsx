import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Reference } from '@glyphjs/types';
import { useReferences } from '../context.js';
import { useNavigation } from './useNavigation.js';

// ─── Props ────────────────────────────────────────────────────

interface ReferenceIndicatorProps {
  blockId: string;
}

// ─── Styles ───────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginTop: '4px',
};

const badgeBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '1px 6px',
  borderRadius: '9999px',
  fontSize: '11px',
  lineHeight: '1.4',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  cursor: 'pointer',
  border: '1px solid',
  textDecoration: 'none',
  transition: 'opacity 150ms ease',
};

const outgoingBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  backgroundColor: '#eff6ff',
  borderColor: '#bfdbfe',
  color: '#1d4ed8',
};

const incomingBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  backgroundColor: '#f0fdf4',
  borderColor: '#bbf7d0',
  color: '#15803d',
};

// ─── Component ────────────────────────────────────────────────

/**
 * Renders clickable reference badges for a given block.
 *
 * - Outgoing references are shown as " -> target-label"
 * - Incoming references are shown as " <- source-label"
 * - Clicking a badge navigates (smooth-scroll + highlight) to the
 *   referenced block.
 */
export function ReferenceIndicator({
  blockId,
}: ReferenceIndicatorProps): ReactNode {
  const { incomingRefs, outgoingRefs } = useReferences(blockId);
  const { navigateTo } = useNavigation();

  const handleClick = useCallback(
    (targetBlockId: string, ref: Reference) => {
      navigateTo(targetBlockId, ref);
    },
    [navigateTo],
  );

  if (outgoingRefs.length === 0 && incomingRefs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={`References for block ${blockId}`}
      style={containerStyle}
    >
      {outgoingRefs.map((ref) => {
        const targetId =
          ref.sourceBlockId === blockId
            ? ref.targetBlockId
            : ref.sourceBlockId;
        const label = ref.label ?? targetId;

        return (
          <button
            key={`out-${ref.id}`}
            type="button"
            style={outgoingBadgeStyle}
            onClick={() => handleClick(targetId, ref)}
            aria-label={`Navigate to referenced block: ${label}`}
            title={`Go to: ${label} (${ref.type})`}
          >
            {'\u2192 '}
            {label}
          </button>
        );
      })}

      {incomingRefs.map((ref) => {
        const sourceId =
          ref.targetBlockId === blockId
            ? ref.sourceBlockId
            : ref.targetBlockId;
        const label = ref.label ?? sourceId;

        return (
          <button
            key={`in-${ref.id}`}
            type="button"
            style={incomingBadgeStyle}
            onClick={() => handleClick(sourceId, ref)}
            aria-label={`Navigate to referencing block: ${label}`}
            title={`Referenced by: ${label} (${ref.type})`}
          >
            {'\u2190 '}
            {label}
          </button>
        );
      })}
    </nav>
  );
}
