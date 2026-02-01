import type { ReactNode } from 'react';
import type { BlockProps, ImageData } from '@glyphjs/types';

// ─── Component ────────────────────────────────────────────────

/**
 * Renders an image block as a `<figure>` containing an `<img>` with lazy loading.
 * If `data.title` is present, renders a `<figcaption>`.
 */
export function GlyphImage({ block }: BlockProps): ReactNode {
  const data = block.data as ImageData;

  return (
    <figure>
      <img src={data.src} alt={data.alt ?? ''} loading="lazy" />
      {data.title ? <figcaption>{data.title}</figcaption> : null}
    </figure>
  );
}
