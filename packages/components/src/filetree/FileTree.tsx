import type { ReactElement, KeyboardEvent } from 'react';
import { useState, useRef, useCallback } from 'react';
import type { GlyphComponentProps } from '@glyphjs/types';

// ─── Types ───────────────────────────────────────────────────

interface FileNode {
  name: string;
  annotation?: string;
  children?: FileNode[];
}

export interface FileTreeData {
  root?: string;
  tree: FileNode[];
  defaultExpanded: boolean;
}

// ─── Icons (Unicode) ─────────────────────────────────────────

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '\u{1F1F9}'; // 🇹 — TS indicator
    case 'js':
    case 'jsx':
      return '\u{1F1EF}'; // 🇯 — JS indicator
    case 'json':
      return '\u{1F4CB}'; // 📋
    case 'md':
    case 'mdx':
      return '\u{1F4DD}'; // 📝
    case 'css':
    case 'scss':
    case 'less':
      return '\u{1F3A8}'; // 🎨
    case 'html':
      return '\u{1F310}'; // 🌐
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return '\u{1F5BC}'; // 🖼
    case 'yml':
    case 'yaml':
      return '\u{2699}'; // ⚙
    default:
      return '\u{1F4C4}'; // 📄
  }
}

// ─── Tree Item Component ─────────────────────────────────────

interface TreeItemProps {
  node: FileNode;
  level: number;
  defaultExpanded: boolean;
  flatIndex: number;
  focusedIndex: number;
  setSize: number;
  posInSet: number;
  onFocusChange: (index: number) => void;
  flatItems: FlatItem[];
}

interface FlatItem {
  node: FileNode;
  level: number;
  isDir: boolean;
}

function TreeItem({
  node,
  level,
  defaultExpanded,
  flatIndex,
  focusedIndex,
  setSize,
  posInSet,
  onFocusChange,
  flatItems,
}: TreeItemProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const itemRef = useRef<HTMLLIElement>(null);
  const isDir = Array.isArray(node.children) && node.children.length > 0;
  const isFocused = flatIndex === focusedIndex;

  const handleToggle = useCallback(() => {
    if (isDir) setExpanded((prev) => !prev);
  }, [isDir]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>) => {
      let handled = true;

      switch (e.key) {
        case 'ArrowDown': {
          const next = flatIndex + 1;
          if (next < flatItems.length) onFocusChange(next);
          break;
        }
        case 'ArrowUp': {
          const prev = flatIndex - 1;
          if (prev >= 0) onFocusChange(prev);
          break;
        }
        case 'ArrowRight':
          if (isDir && !expanded) {
            setExpanded(true);
          } else if (isDir && expanded) {
            const next = flatIndex + 1;
            if (next < flatItems.length) onFocusChange(next);
          }
          break;
        case 'ArrowLeft':
          if (isDir && expanded) {
            setExpanded(false);
          } else if (level > 0) {
            // Move to parent
            for (let idx = flatIndex - 1; idx >= 0; idx--) {
              const item = flatItems[idx];
              if (item && item.level < level && item.isDir) {
                onFocusChange(idx);
                break;
              }
            }
          }
          break;
        case 'Enter':
        case ' ':
          handleToggle();
          break;
        case 'Home':
          onFocusChange(0);
          break;
        case 'End':
          onFocusChange(flatItems.length - 1);
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [flatIndex, flatItems, isDir, expanded, level, onFocusChange, handleToggle],
  );

  const icon = isDir ? (expanded ? '\u{1F4C2}' : '\u{1F4C1}') : getFileIcon(node.name);
  const ariaLabel = node.annotation ? `${node.name}, ${node.annotation}` : node.name;

  return (
    <li
      ref={itemRef}
      role="treeitem"
      aria-expanded={isDir ? expanded : undefined}
      aria-label={ariaLabel}
      aria-level={level + 1}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      tabIndex={isFocused ? 0 : -1}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        onFocusChange(flatIndex);
        handleToggle();
      }}
      style={{
        listStyle: 'none',
        cursor: isDir ? 'pointer' : 'default',
        padding: '2px 0',
        outline: 'none',
        borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
        background: isFocused ? 'var(--glyph-accent-subtle, rgba(0,212,170,0.1))' : 'transparent',
      }}
      data-flat-index={flatIndex}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          paddingLeft: `${level * 1.25}rem`,
          fontFamily: 'var(--glyph-font-mono, monospace)',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          color: 'var(--glyph-text, #d4dae3)',
          userSelect: 'none',
        }}
      >
        <span style={{ width: '1.25rem', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontWeight: isDir ? 600 : 400 }}>{node.name}</span>
        {node.annotation && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--glyph-text-muted, #6b7a94)',
              background: 'var(--glyph-surface, #0f1526)',
              padding: '0 0.375rem',
              borderRadius: 'var(--glyph-radius-sm, 0.375rem)',
              marginLeft: '0.25rem',
            }}
          >
            {node.annotation}
          </span>
        )}
      </div>
      {isDir && expanded && node.children && (
        <ul role="group" style={{ margin: 0, padding: 0 }}>
          {node.children.map((child, childIdx) => {
            const childFlatIndex = getChildFlatIndex(flatItems, flatIndex, childIdx, node.children);
            return (
              <TreeItem
                key={child.name}
                node={child}
                level={level + 1}
                defaultExpanded={defaultExpanded}
                flatIndex={childFlatIndex}
                focusedIndex={focusedIndex}
                setSize={node.children?.length ?? 0}
                posInSet={childIdx + 1}
                onFocusChange={onFocusChange}
                flatItems={flatItems}
              />
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ─── Flat Index Helpers ──────────────────────────────────────

function flattenTree(nodes: FileNode[], level: number): FlatItem[] {
  const result: FlatItem[] = [];
  for (const node of nodes) {
    const isDir = Array.isArray(node.children) && node.children.length > 0;
    result.push({ node, level, isDir });
    if (isDir && node.children) {
      result.push(...flattenTree(node.children, level + 1));
    }
  }
  return result;
}

function getChildFlatIndex(
  flatItems: FlatItem[],
  parentFlatIndex: number,
  childIdx: number,
  children: FileNode[] | undefined,
): number {
  if (!children) return parentFlatIndex + 1;
  // Find the flat index of the nth child after parentFlatIndex
  let count = 0;
  for (let i = parentFlatIndex + 1; i < flatItems.length; i++) {
    const item = flatItems[i];
    if (!item) continue;
    // Check if this item is a direct child (one of the parent's children)
    if (item.node === children[count]) {
      if (count === childIdx) return i;
      count++;
    }
  }
  return parentFlatIndex + childIdx + 1;
}

// ─── Component ──────────────────────────────────────────────

export function FileTree({ data }: GlyphComponentProps<FileTreeData>): ReactElement {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const flatItems = flattenTree(data.tree, data.root ? 1 : 0);

  const handleFocusChange = useCallback((index: number) => {
    setFocusedIndex(index);
    // Focus the corresponding element
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`[data-flat-index="${String(index)}"]`);
    el?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      className="glyph-filetree-container"
      style={{
        border: '1px solid var(--glyph-border, #1a2035)',
        borderRadius: 'var(--glyph-radius-md, 0.5rem)',
        padding: '0.75rem',
        background: 'var(--glyph-surface, #0f1526)',
      }}
    >
      <ul role="tree" aria-label={data.root ?? 'File tree'} style={{ margin: 0, padding: 0 }}>
        {data.root && (
          <li
            role="treeitem"
            aria-expanded={true}
            aria-level={1}
            aria-setsize={1}
            aria-posinset={1}
            style={{
              listStyle: 'none',
              padding: '2px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontFamily: 'var(--glyph-font-mono, monospace)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--glyph-heading, #edf0f5)',
              }}
            >
              <span style={{ width: '1.25rem', textAlign: 'center' }}>{'\u{1F4C2}'}</span>
              {data.root}
            </div>
            <ul role="group" style={{ margin: 0, padding: 0 }}>
              {data.tree.map((node, idx) => {
                const flatIndex = getFlatIndexForTopLevel(flatItems, idx, data.tree);
                return (
                  <TreeItem
                    key={node.name}
                    node={node}
                    level={1}
                    defaultExpanded={data.defaultExpanded}
                    flatIndex={flatIndex}
                    focusedIndex={focusedIndex}
                    setSize={data.tree.length}
                    posInSet={idx + 1}
                    onFocusChange={handleFocusChange}
                    flatItems={flatItems}
                  />
                );
              })}
            </ul>
          </li>
        )}
        {!data.root &&
          data.tree.map((node, idx) => {
            const flatIndex = getFlatIndexForTopLevel(flatItems, idx, data.tree);
            return (
              <TreeItem
                key={node.name}
                node={node}
                level={0}
                defaultExpanded={data.defaultExpanded}
                flatIndex={flatIndex}
                focusedIndex={focusedIndex}
                setSize={data.tree.length}
                posInSet={idx + 1}
                onFocusChange={handleFocusChange}
                flatItems={flatItems}
              />
            );
          })}
      </ul>
    </div>
  );
}

function getFlatIndexForTopLevel(flatItems: FlatItem[], idx: number, tree: FileNode[]): number {
  let count = 0;
  for (let i = 0; i < flatItems.length; i++) {
    const item = flatItems[i];
    if (item && item.node === tree[count]) {
      if (count === idx) return i;
      count++;
    }
  }
  return idx;
}
