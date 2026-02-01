import { useState, useEffect, useRef } from 'react';

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

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSimplePreview(source: string): string {
  const lines = source.split('\n');
  const htmlParts: string[] = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      htmlParts.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      htmlParts.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      htmlParts.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith('- ')) {
      htmlParts.push(`<li>${escapeHtml(line.slice(2))}</li>`);
    } else if (line.startsWith('```ui:')) {
      const comp = line.slice(3);
      htmlParts.push(`<div style="background:#e0f2fe;border-left:3px solid #0284c7;padding:0.5rem 0.75rem;margin:0.5rem 0;border-radius:4px;font-size:0.85rem;color:#0369a1;"><strong>${escapeHtml(comp)}</strong></div>`);
    } else if (line.startsWith('```')) {
      // skip code fences
    } else if (line.trim() === '') {
      htmlParts.push('<br/>');
    } else if (line.startsWith('  ') || line.startsWith('\t')) {
      // indented content inside code block
      htmlParts.push(`<div style="font-family:monospace;font-size:0.8rem;padding-left:1rem;color:#555;">${escapeHtml(line)}</div>`);
    } else {
      htmlParts.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  return htmlParts.join('\n');
}

export default function Playground() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setHtml(renderSimplePreview(markdown));
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [markdown]);

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
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
