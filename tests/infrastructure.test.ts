import { describe, it, expect } from 'vitest';
import { createTestBlock, createTestIR } from './helpers/factories';

describe('test infrastructure', () => {
  it('creates a test block', () => {
    const block = createTestBlock();
    expect(block.type).toBe('paragraph');
    expect(block.id).toBe('test-block-001');
  });

  it('creates a test IR', () => {
    const ir = createTestIR();
    expect(ir.version).toBe('1');
    expect(ir.blocks).toEqual([]);
  });

  it('creates a test block with overrides', () => {
    const block = createTestBlock({ type: 'heading', id: 'custom-id' });
    expect(block.type).toBe('heading');
    expect(block.id).toBe('custom-id');
  });
});
