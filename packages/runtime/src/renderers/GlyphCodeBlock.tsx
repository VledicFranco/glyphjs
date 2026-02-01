import type { ReactNode } from 'react';
import type { BlockProps, CodeData } from '@glyphjs/types';

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a fenced code block as `<pre><code>`.
 * Adds a `data-language` attribute and a `language-{lang}` CSS class
 * so users can integrate their own syntax highlighter (e.g. Prism, Shiki).
 */
export function GlyphCodeBlock({ block }: BlockProps): ReactNode {
  const data = block.data as CodeData;
  const language = data.language ?? undefined;

  return (
    <pre data-language={language}>
      <code className={language ? `language-${language}` : undefined}>
        {data.value}
      </code>
    </pre>
  );
}
