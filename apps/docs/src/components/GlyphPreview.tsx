import { useMemo } from 'react';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import {
  calloutDefinition,
  chartDefinition,
  graphDefinition,
  relationDefinition,
  stepsDefinition,
  tableDefinition,
  tabsDefinition,
  timelineDefinition,
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
];

interface GlyphPreviewProps {
  source: string;
}

export default function GlyphPreview({ source }: GlyphPreviewProps) {
  const runtime = useMemo(
    () =>
      createGlyphRuntime({
        theme: 'light',
        components: allComponents,
      }),
    [],
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
        border: '1px solid #dce1e8',
        borderRadius: '3px',
        padding: '1.5rem',
        margin: '1rem 0',
        background: '#f8f9fb',
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
