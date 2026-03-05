import type { HTMLAttributes, ReactNode } from 'react';
import type { BlockProps, CodeData } from '@glyphjs/types';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { highlighter, HLJS_TOKEN_VARS } from '../highlight/languages.js';

// ─── Token span ────────────────────────────────────────────────

function TokenSpan({ className, style, children }: HTMLAttributes<HTMLSpanElement>): ReactNode {
  const tokenClass = className?.split(' ').find((c) => HLJS_TOKEN_VARS[c] !== undefined);
  const tokenColor = tokenClass ? HLJS_TOKEN_VARS[tokenClass] : undefined;
  return (
    <span className={className} style={tokenColor ? { ...style, color: tokenColor } : style}>
      {children}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a fenced code block as `<pre><code>` with syntax highlighting.
 * Uses lowlight (highlight.js grammar) for token detection and applies
 * `--glyph-code-token-*` CSS custom properties for theming.
 * Falls back to plain text for unknown or missing languages.
 */
export function GlyphCodeBlock({ block }: BlockProps): ReactNode {
  const data = block.data as CodeData;
  const language = data.language ?? undefined;

  const preStyle = {
    background: 'var(--glyph-code-bg, #e8ecf3)',
    color: 'var(--glyph-code-text, #1a2035)',
    fontFamily: 'var(--glyph-font-mono, monospace)',
    padding: 'var(--glyph-spacing-md, 1rem)',
    borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
    overflow: 'auto' as const,
  };

  let content: ReactNode = data.value;
  if (language && highlighter.listLanguages().includes(language)) {
    const tree = highlighter.highlight(language, data.value);
    content = toJsxRuntime(tree, {
      jsx,
      jsxs,
      Fragment,
      components: { span: TokenSpan as never },
    });
  }

  return (
    <pre
      data-language={language}
      aria-label={language ? `Code block (${language})` : 'Code block'}
      style={preStyle}
    >
      <code className={language ? `language-${language}` : undefined}>{content}</code>
    </pre>
  );
}
