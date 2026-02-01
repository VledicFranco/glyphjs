/**
 * Unit tests for IR migration system.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerMigration,
  migrateIR,
  clearMigrations,
  createEmptyIR,
} from '../index.js';
import type { GlyphIR } from '@glyphjs/types';

// ─── Setup ────────────────────────────────────────────────────

function makeIR(version: string): GlyphIR {
  return {
    ...createEmptyIR('test-doc'),
    version,
  };
}

beforeEach(() => {
  clearMigrations();
});

// ─── Sequential Migration ─────────────────────────────────────

describe('migrateIR', () => {
  it('applies a single migration step', () => {
    registerMigration({
      from: '1.0.0',
      to: '2.0.0',
      migrate: (ir) => ({
        ...ir,
        metadata: { ...ir.metadata, title: 'Migrated' },
      }),
    });

    const ir = makeIR('1.0.0');
    const result = migrateIR(ir, '2.0.0');

    expect(result.version).toBe('2.0.0');
    expect(result.metadata.title).toBe('Migrated');
  });

  it('applies sequential migrations in order', () => {
    registerMigration({
      from: '1.0.0',
      to: '1.1.0',
      migrate: (ir) => ({
        ...ir,
        metadata: { ...ir.metadata, title: 'Step 1' },
      }),
    });

    registerMigration({
      from: '1.1.0',
      to: '2.0.0',
      migrate: (ir) => ({
        ...ir,
        metadata: {
          ...ir.metadata,
          description: `After: ${ir.metadata.title ?? 'unknown'}`,
        },
      }),
    });

    const ir = makeIR('1.0.0');
    const result = migrateIR(ir, '2.0.0');

    expect(result.version).toBe('2.0.0');
    expect(result.metadata.title).toBe('Step 1');
    expect(result.metadata.description).toBe('After: Step 1');
  });

  it('applies a chain of three migrations', () => {
    registerMigration({
      from: '1.0.0',
      to: '1.1.0',
      migrate: (ir) => ({
        ...ir,
        metadata: { ...ir.metadata, tags: ['v1.1'] },
      }),
    });

    registerMigration({
      from: '1.1.0',
      to: '1.2.0',
      migrate: (ir) => ({
        ...ir,
        metadata: {
          ...ir.metadata,
          tags: [...(ir.metadata.tags ?? []), 'v1.2'],
        },
      }),
    });

    registerMigration({
      from: '1.2.0',
      to: '2.0.0',
      migrate: (ir) => ({
        ...ir,
        metadata: {
          ...ir.metadata,
          tags: [...(ir.metadata.tags ?? []), 'v2.0'],
        },
      }),
    });

    const ir = makeIR('1.0.0');
    const result = migrateIR(ir, '2.0.0');

    expect(result.version).toBe('2.0.0');
    expect(result.metadata.tags).toEqual(['v1.1', 'v1.2', 'v2.0']);
  });

  // ─── Already current version (no-op) ─────────────────────

  it('returns IR unchanged when already at target version', () => {
    const ir = makeIR('1.0.0');
    const result = migrateIR(ir, '1.0.0');

    expect(result.version).toBe('1.0.0');
    expect(result.id).toBe(ir.id);
  });

  // ─── Unknown / missing migration ──────────────────────────

  it('throws when no migration is registered for the current version', () => {
    const ir = makeIR('1.0.0');

    expect(() => migrateIR(ir, '2.0.0')).toThrow(
      /No migration registered from version "1.0.0"/,
    );
  });

  it('throws when migration chain has a gap', () => {
    registerMigration({
      from: '1.0.0',
      to: '1.1.0',
      migrate: (ir) => ir,
    });
    // Missing migration from 1.1.0 to 2.0.0

    const ir = makeIR('1.0.0');

    expect(() => migrateIR(ir, '2.0.0')).toThrow(
      /No migration registered from version "1.1.0"/,
    );
  });

  // ─── Downgrade not allowed ─────────────────────────────────

  it('throws when attempting a downgrade', () => {
    const ir = makeIR('2.0.0');

    expect(() => migrateIR(ir, '1.0.0')).toThrow(
      /Cannot downgrade/,
    );
  });

  // ─── Overshoot detection ───────────────────────────────────

  it('throws when a migration would overshoot the target', () => {
    registerMigration({
      from: '1.0.0',
      to: '3.0.0',
      migrate: (ir) => ir,
    });

    const ir = makeIR('1.0.0');

    expect(() => migrateIR(ir, '2.0.0')).toThrow(
      /overshoot/,
    );
  });

  // ─── clearMigrations ──────────────────────────────────────

  it('clearMigrations removes all registered migrations', () => {
    registerMigration({
      from: '1.0.0',
      to: '2.0.0',
      migrate: (ir) => ir,
    });

    clearMigrations();

    const ir = makeIR('1.0.0');
    expect(() => migrateIR(ir, '2.0.0')).toThrow(
      /No migration registered/,
    );
  });

  // ─── Migration preserves document structure ────────────────

  it('preserves blocks and references through migration', () => {
    registerMigration({
      from: '1.0.0',
      to: '2.0.0',
      migrate: (ir) => ir,
    });

    const ir: GlyphIR = {
      ...makeIR('1.0.0'),
      blocks: [
        {
          id: 'b-test00000001',
          type: 'paragraph',
          data: { children: [{ type: 'text', value: 'hello' }] },
          position: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
      ],
      references: [
        {
          id: 'ref-00000001',
          type: 'navigates-to',
          sourceBlockId: 'b-test00000001',
          targetBlockId: 'b-test00000001',
        },
      ],
    };

    const result = migrateIR(ir, '2.0.0');

    expect(result.version).toBe('2.0.0');
    expect(result.blocks).toHaveLength(1);
    expect(result.references).toHaveLength(1);
    expect(result.blocks[0]?.id).toBe('b-test00000001');
  });
});
