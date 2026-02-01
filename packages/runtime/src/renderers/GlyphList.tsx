import type { ReactNode } from 'react';
import type { BlockProps, ListData, ListItemData } from '@glyphjs/types';
import { InlineRenderer } from './InlineRenderer.js';

// ─── Sub-list renderer ────────────────────────────────────────

function renderSubList(list: ListData): ReactNode {
  const items = list.items.map((item, i) => renderListItem(item, i));

  if (list.ordered) {
    return <ol start={list.start}>{items}</ol>;
  }
  return <ul>{items}</ul>;
}

function renderListItem(item: ListItemData, index: number): ReactNode {
  return (
    <li key={index}>
      <InlineRenderer nodes={item.children} />
      {item.subList ? renderSubList(item.subList) : null}
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────

/**
 * Renders a list block as `<ol>` or `<ul>` based on `data.ordered`.
 * Supports `start` attribute for ordered lists and nested sub-lists.
 */
export function GlyphList({ block }: BlockProps): ReactNode {
  const data = block.data as ListData;

  return renderSubList(data);
}
