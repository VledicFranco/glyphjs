import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import type { GlyphIR } from '@glyphjs/types';

const DEFAULT_MARKDOWN = `# Hello Glyph JS

This is a live playground. Edit the Markdown on the left to see it rendered on the right.

\`\`\`ui:callout
type: tip
title: Try It Out
content: |
  Modify this document or paste your own Glyph Markdown here.
  The preview updates automatically.
\`\`\`

## Features

- Standard **Markdown** rendering
- Embedded \`ui:\` components
- Real-time preview

\`\`\`ui:steps
steps:
  - title: Write Markdown
    status: completed
    content: Start with standard Markdown syntax.
  - title: Add Components
    status: active
    content: Use ui: fenced code blocks for interactive components.
  - title: See Results
    status: pending
    content: The rendered output appears in real time.
\`\`\`
`;

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

export default function Playground() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [ir, setIr] = useState<GlyphIR | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const runtime = useMemo(
    () =>
      createGlyphRuntime({
        theme: 'light',
        components: allComponents,
      }),
    [],
  );

  const GlyphDocument = runtime.GlyphDocument;

  const compileSource = useCallback((src: string) => {
    try {
      const result = compile(src);
      setIr(result.ir);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIr(null);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => compileSource(markdown), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [markdown, compileSource]);

  useEffect(() => {
    compileSource(markdown);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '1rem', minHeight: '500px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Editor</div>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          style={{
            width: '100%',
            height: '460px',
            fontFamily: 'Inter, "Fira Code", "Cascadia Code", Consolas, monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            padding: '0.75rem',
            border: '1px solid #dce1e8',
            borderRadius: '3px',
            resize: 'vertical',
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Preview</div>
        <div
          style={{
            height: '460px',
            border: '1px solid #dce1e8',
            borderRadius: '3px',
            overflow: 'auto',
            padding: '1rem',
          }}
        >
          {error ? (
            <div style={{ color: '#c84a4a', fontFamily: 'monospace', fontSize: '13px' }}>
              {error}
            </div>
          ) : ir ? (
            <GlyphDocument ir={ir} />
          ) : (
            <p style={{ color: '#7a8599', fontStyle: 'italic' }}>
              Type some markdown to see the preview...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
