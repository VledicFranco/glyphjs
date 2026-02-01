/**
 * Unit tests for ID generation and collision resolution.
 */
import { describe, it, expect } from 'vitest';
import {
  generateBlockId,
  generateDocumentId,
  resolveBlockIdCollisions,
} from '../index.js';

// ─── generateBlockId ──────────────────────────────────────────

describe('generateBlockId', () => {
  it('returns a string with "b-" prefix followed by 12 hex chars', () => {
    const id = generateBlockId('doc1', 'paragraph', 'hello world');
    expect(id).toMatch(/^b-[0-9a-f]{12}$/);
  });

  it('is deterministic: same inputs produce same output', () => {
    const id1 = generateBlockId('doc-abc', 'heading', 'My Title');
    const id2 = generateBlockId('doc-abc', 'heading', 'My Title');
    expect(id1).toBe(id2);
  });

  it('produces different IDs for different content', () => {
    const id1 = generateBlockId('doc1', 'paragraph', 'content A');
    const id2 = generateBlockId('doc1', 'paragraph', 'content B');
    expect(id1).not.toBe(id2);
  });

  it('produces different IDs for different document IDs', () => {
    const id1 = generateBlockId('doc-1', 'paragraph', 'same content');
    const id2 = generateBlockId('doc-2', 'paragraph', 'same content');
    expect(id1).not.toBe(id2);
  });

  it('produces different IDs for different block types', () => {
    const id1 = generateBlockId('doc1', 'paragraph', 'same content');
    const id2 = generateBlockId('doc1', 'heading', 'same content');
    expect(id1).not.toBe(id2);
  });

  it('handles empty content', () => {
    const id = generateBlockId('doc1', 'paragraph', '');
    expect(id).toMatch(/^b-[0-9a-f]{12}$/);
  });

  it('handles unicode content', () => {
    const id = generateBlockId('doc1', 'paragraph', 'Hello');
    expect(id).toMatch(/^b-[0-9a-f]{12}$/);
  });
});

// ─── generateDocumentId ───────────────────────────────────────

describe('generateDocumentId', () => {
  it('returns glyphId directly when provided', () => {
    const id = generateDocumentId({ glyphId: 'my-custom-id' });
    expect(id).toBe('my-custom-id');
  });

  it('prioritizes glyphId over filePath and content', () => {
    const id = generateDocumentId({
      glyphId: 'custom',
      filePath: '/path/to/file.md',
      content: 'some content',
    });
    expect(id).toBe('custom');
  });

  it('normalizes filePath backslashes to forward slashes', () => {
    const id = generateDocumentId({
      filePath: 'C:\\Users\\test\\file.md',
    });
    expect(id).toBe('C:/Users/test/file.md');
  });

  it('returns filePath with forward slashes unchanged', () => {
    const id = generateDocumentId({
      filePath: '/home/user/doc.glyph',
    });
    expect(id).toBe('/home/user/doc.glyph');
  });

  it('prioritizes filePath over content', () => {
    const id = generateDocumentId({
      filePath: '/my/file.md',
      content: 'some content',
    });
    expect(id).toBe('/my/file.md');
  });

  it('generates content hash when only content is provided', () => {
    const id = generateDocumentId({ content: 'hello world' });
    expect(id).toMatch(/^doc-[0-9a-f]{16}$/);
  });

  it('is deterministic for content-based IDs', () => {
    const id1 = generateDocumentId({ content: 'test content' });
    const id2 = generateDocumentId({ content: 'test content' });
    expect(id1).toBe(id2);
  });

  it('produces different hashes for different content', () => {
    const id1 = generateDocumentId({ content: 'content A' });
    const id2 = generateDocumentId({ content: 'content B' });
    expect(id1).not.toBe(id2);
  });

  it('handles empty options gracefully', () => {
    const id = generateDocumentId({});
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

// ─── resolveBlockIdCollisions ─────────────────────────────────

describe('resolveBlockIdCollisions', () => {
  it('returns input unchanged when no duplicates', () => {
    const ids = ['b-aaa', 'b-bbb', 'b-ccc'];
    expect(resolveBlockIdCollisions(ids)).toEqual(['b-aaa', 'b-bbb', 'b-ccc']);
  });

  it('appends -1 suffix to the first duplicate', () => {
    const ids = ['b-aaa', 'b-aaa'];
    const result = resolveBlockIdCollisions(ids);
    expect(result).toEqual(['b-aaa', 'b-aaa-1']);
  });

  it('appends incrementing suffixes for multiple duplicates', () => {
    const ids = ['b-aaa', 'b-aaa', 'b-aaa'];
    const result = resolveBlockIdCollisions(ids);
    expect(result).toEqual(['b-aaa', 'b-aaa-1', 'b-aaa-2']);
  });

  it('handles multiple groups of duplicates independently', () => {
    const ids = ['b-aaa', 'b-bbb', 'b-aaa', 'b-bbb', 'b-ccc'];
    const result = resolveBlockIdCollisions(ids);
    expect(result).toEqual([
      'b-aaa',
      'b-bbb',
      'b-aaa-1',
      'b-bbb-1',
      'b-ccc',
    ]);
  });

  it('handles empty array', () => {
    expect(resolveBlockIdCollisions([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(resolveBlockIdCollisions(['b-only'])).toEqual(['b-only']);
  });

  it('preserves original array order', () => {
    const ids = ['b-ccc', 'b-aaa', 'b-bbb'];
    const result = resolveBlockIdCollisions(ids);
    expect(result).toEqual(['b-ccc', 'b-aaa', 'b-bbb']);
  });

  it('results have unique IDs after resolution', () => {
    const ids = ['b-x', 'b-x', 'b-x', 'b-y', 'b-y'];
    const result = resolveBlockIdCollisions(ids);
    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });
});
