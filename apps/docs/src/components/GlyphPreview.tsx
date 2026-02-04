import { useMemo, useState, useEffect, useCallback } from 'react';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import type { GlyphTheme } from '@glyphjs/types';
import {
  calloutDefinition,
  chartDefinition,
  graphDefinition,
  relationDefinition,
  stepsDefinition,
  tableDefinition,
  tabsDefinition,
  timelineDefinition,
  architectureDefinition,
} from '@glyphjs/components';

const allComponents = [
  calloutDefinition,
  chartDefinition,
  graphDefinition,
  relationDefinition,
  stepsDefinition,
  tableDefinition,
  tabsDefinition,
  timelineDefinition,
  architectureDefinition,
];

function useStarlightTheme(): 'light' | 'dark' {
  const getTheme = useCallback(
    () =>
      (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light') as 'light' | 'dark',
    [],
  );

  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme);

  useEffect(() => {
    setTheme(getTheme());
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [getTheme]);

  return theme;
}

interface GlyphPreviewProps {
  source: string;
  theme?: GlyphTheme;
}

export default function GlyphPreview({ source, theme: customTheme }: GlyphPreviewProps) {
  const starlightTheme = useStarlightTheme();

  const runtime = useMemo(
    () =>
      createGlyphRuntime({
        theme: customTheme ?? starlightTheme,
        components: allComponents,
      }),
    [customTheme, starlightTheme],
  );

  const { ir, error } = useMemo(() => {
    try {
      const result = compile(source);
      return { ir: result.ir, error: null };
    } catch (e) {
      return { ir: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [source]);

  const GlyphDocument = runtime.GlyphDocument;

  return (
    <div
      data-glyph-preview
      data-glyph-status={error ? 'error' : ir ? 'ready' : 'empty'}
      style={{
        borderRadius: '3px',
        padding: '1.5rem',
        margin: '1rem 0',
      }}
    >
      {error ? (
        <div style={{ color: '#c84a4a', fontFamily: 'monospace', fontSize: '13px' }}>{error}</div>
      ) : ir ? (
        <GlyphDocument ir={ir} />
      ) : null}
    </div>
  );
}
