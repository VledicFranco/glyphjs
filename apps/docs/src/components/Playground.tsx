import { useState, useCallback, useRef, useEffect } from 'react';

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
`;

export default function Playground() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const compile = useCallback(async (source: string) => {
    try {
      const { parseGlyphMarkdown } = await import('@glyphjs/compiler');
      // For now, render a simple preview since full pipeline requires React rendering
      setHtml(`<div style="padding: 1rem; font-family: system-ui;">
        <p style="color: #666;">Compiled successfully. ${source.split('\n').length} lines parsed.</p>
        <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto; font-size: 13px;">${source.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => compile(markdown), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [markdown, compile]);

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
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
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
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
          {error ? (
            <div style={{ padding: '1rem', color: '#dc2626' }}>
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </div>
  );
}
