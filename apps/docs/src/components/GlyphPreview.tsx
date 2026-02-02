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
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1rem 0',
        background: '#fff',
      }}
    >
      {error ? (
        <div style={{ color: '#e74c3c', fontFamily: 'monospace', fontSize: '13px' }}>
          {error}
        </div>
      ) : ir ? (
        <GlyphDocument ir={ir} />
      ) : null}
    </div>
  );
}
