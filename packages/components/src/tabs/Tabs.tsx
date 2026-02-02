import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

/** Shape of the validated `data` for a `ui:tabs` block. */
export interface TabsData {
  tabs: { label: string; content: string }[];
}

/**
 * `ui:tabs` component.
 *
 * Renders a tabbed interface following the WAI-ARIA Tabs pattern.
 * - Tab navigation via click.
 * - Keyboard: ArrowLeft / ArrowRight to cycle tabs, Home / End for first / last.
 * - ARIA roles: tablist, tab, tabpanel with proper aria-selected, aria-controls,
 *   and aria-labelledby attributes.
 */
export function Tabs({ data, block, theme }: GlyphComponentProps<TabsData>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = data.tabs;
  const baseId = `glyph-tabs-${block.id}`;

  const focusTab = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, tabs.length - 1));
      setActiveIndex(clampedIndex);
      tabRefs.current[clampedIndex]?.focus();
    },
    [tabs.length],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          const next = (activeIndex + 1) % tabs.length;
          focusTab(next);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const prev = (activeIndex - 1 + tabs.length) % tabs.length;
          focusTab(prev);
          break;
        }
        case 'Home': {
          e.preventDefault();
          focusTab(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          focusTab(tabs.length - 1);
          break;
        }
      }
    },
    [activeIndex, focusTab, tabs.length],
  );

  /* ─── Theming ────────────────────────────────────────────── */
  const borderColor = theme.resolveVar('--glyph-border') || (theme.isDark ? '#1e2633' : '#dce1e8');
  const activeBg =
    theme.resolveVar('--glyph-surface-raised') || (theme.isDark ? '#1a2230' : '#f8f9fb');
  const inactiveBg = theme.resolveVar('--glyph-surface') || (theme.isDark ? '#111820' : '#eef1f5');
  const activeColor = theme.resolveVar('--glyph-heading') || (theme.isDark ? '#e8ecf1' : '#0f1319');
  const inactiveColor =
    theme.resolveVar('--glyph-text-muted') || (theme.isDark ? '#7a8599' : '#7a8599');
  const panelBg = theme.resolveVar('--glyph-surface-raised') || activeBg;
  const fontFamily = theme.resolveVar('--glyph-font-body') || '"Inter", system-ui, sans-serif';
  const accentColor = theme.resolveVar('--glyph-accent') || '#d4a843';
  const borderRadius = theme.resolveVar('--glyph-radius-lg') || '0.25rem';

  return (
    <div
      style={{
        fontFamily,
        border: `1px solid ${borderColor}`,
        borderRadius,
        overflow: 'hidden',
      }}
    >
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Tabs"
        style={{
          display: 'flex',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: inactiveBg,
          margin: 0,
          padding: 0,
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const tabId = `${baseId}-tab-${String(index)}`;
          const panelId = `${baseId}-panel-${String(index)}`;

          return (
            <button
              key={tabId}
              id={tabId}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={handleKeyDown}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                background: isActive ? activeBg : 'transparent',
                color: isActive ? activeColor : inactiveColor,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                outline: 'revert',
                outlineOffset: '2px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        const tabId = `${baseId}-tab-${String(index)}`;
        const panelId = `${baseId}-panel-${String(index)}`;

        return (
          <div
            key={panelId}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            aria-live="polite"
            hidden={!isActive}
            tabIndex={0}
            style={{
              padding: '16px',
              backgroundColor: panelBg,
              color: activeColor,
              lineHeight: 1.6,
            }}
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
