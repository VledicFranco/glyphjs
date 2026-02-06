import type { ReactNode } from 'react';
import type { InlineNode } from '@glyphjs/types';
import { InlineRenderer } from './InlineRenderer.js';

export interface RichTextProps {
  content: string | InlineNode[];
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Renders text that may be plain string or formatted InlineNode[].
 * Type guard checks if content is array, then uses InlineRenderer.
 *
 * This component enables component text fields to support both:
 * - Plain strings (backward compatibility)
 * - Markdown-parsed InlineNode arrays (when markdown: true)
 */
export function RichText({ content, style, className }: RichTextProps): ReactNode {
  if (Array.isArray(content)) {
    return (
      <span style={style} className={className}>
        <InlineRenderer nodes={content} />
      </span>
    );
  }
  return (
    <span style={style} className={className}>
      {content}
    </span>
  );
}
