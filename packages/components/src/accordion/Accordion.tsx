import { useCallback, useRef, type ReactElement } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ─────────────────────────────────────────────────────

export interface AccordionSection {
  title: string;
  content: string;
}

export interface AccordionData {
  title?: string;
  sections: AccordionSection[];
  defaultOpen?: number[];
  multiple?: boolean;
}

// ─── Component ─────────────────────────────────────────────────

export function Accordion({
  data,
  block,
  onInteraction,
}: GlyphComponentProps<AccordionData>): ReactElement {
  const { title, sections, defaultOpen = [], multiple = true } = data;
  const baseId = `glyph-accordion-${block.id}`;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(
    (e: React.SyntheticEvent<HTMLDetailsElement>, sectionIndex: number) => {
      const target = e.currentTarget;
      const expanded = target.open;

      if (!multiple && expanded && containerRef.current) {
        // Exclusive mode: close all other open details
        const allDetails = containerRef.current.querySelectorAll('details');
        for (const details of allDetails) {
          if (details !== target && details.open) {
            details.open = false;
          }
        }
      }

      onInteraction?.({
        kind: 'accordion-toggle',
        timestamp: new Date().toISOString(),
        blockId: block.id,
        blockType: block.type,
        payload: {
          sectionIndex,
          sectionTitle: sections[sectionIndex]?.title ?? '',
          expanded,
        },
      });
    },
    [multiple, sections, block.id, block.type, onInteraction],
  );

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--glyph-font-body, system-ui, sans-serif)',
    color: 'var(--glyph-text, #1a2035)',
    border: '1px solid var(--glyph-border, #d0d8e4)',
    borderRadius: 'var(--glyph-radius-md, 0.5rem)',
    overflow: 'hidden',
  };

  const sectionStyle = (isLast: boolean): React.CSSProperties => ({
    borderBottom: isLast ? 'none' : '1px solid var(--glyph-border, #d0d8e4)',
  });

  const summaryStyle: React.CSSProperties = {
    padding: 'var(--glyph-spacing-md, 1rem)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9375rem',
    background: 'var(--glyph-surface, #e8ecf3)',
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    userSelect: 'none',
  };

  const contentStyle: React.CSSProperties = {
    padding: 'var(--glyph-spacing-md, 1rem)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
  };

  return (
    <div
      id={baseId}
      ref={containerRef}
      role="region"
      aria-label={title ?? 'Accordion'}
      style={containerStyle}
    >
      {title && (
        <div
          style={{
            fontWeight: 700,
            fontSize: '1.125rem',
            padding: 'var(--glyph-spacing-md, 1rem)',
            borderBottom: '1px solid var(--glyph-border, #d0d8e4)',
            color: 'var(--glyph-heading, #0a0e1a)',
          }}
        >
          {title}
        </div>
      )}
      {sections.map((section, i) => (
        <details
          key={i}
          open={defaultOpen.includes(i)}
          onToggle={(e) => handleToggle(e, i)}
          style={sectionStyle(i === sections.length - 1)}
        >
          <summary style={summaryStyle}>
            <span aria-hidden="true" style={{ fontSize: '0.75rem', width: '1rem', flexShrink: 0 }}>
              ▸
            </span>
            {section.title}
          </summary>
          <div style={contentStyle}>{section.content}</div>
        </details>
      ))}
    </div>
  );
}
