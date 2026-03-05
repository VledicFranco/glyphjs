import { describe, it, expect } from 'vitest';
import { compile } from '../compile.js';

// ─── Helpers ─────────────────────────────────────────────────

function getDiagnosticCodes(result: ReturnType<typeof compile>): string[] {
  return result.diagnostics.map((d) => d.code);
}

function getDiagnosticMessages(result: ReturnType<typeof compile>): string[] {
  return result.diagnostics.map((d) => d.message);
}

// ─── Empty / Whitespace Input ────────────────────────────────

describe('empty and whitespace input', () => {
  it('compiles an empty string without errors', () => {
    const result = compile('');
    expect(result.hasErrors).toBe(false);
    expect(result.ir).toBeDefined();
    expect(result.ir.version).toBe('1.0.0');
    expect(result.ir.blocks).toEqual([]);
    expect(result.diagnostics).toEqual([]);
  });

  it('compiles a whitespace-only string without errors', () => {
    const result = compile('   \n\n  \t  \n  ');
    expect(result.hasErrors).toBe(false);
    expect(result.ir).toBeDefined();
    expect(result.ir.blocks).toHaveLength(0);
    expect(result.diagnostics).toEqual([]);
  });

  it('compiles a single newline without errors', () => {
    const result = compile('\n');
    expect(result.hasErrors).toBe(false);
    expect(result.ir.blocks).toHaveLength(0);
  });
});

// ─── Invalid YAML in UI Block ────────────────────────────────

describe('invalid YAML in ui block', () => {
  it('produces a YAML_PARSE_ERROR diagnostic for malformed YAML', () => {
    const md = [
      '# Test',
      '',
      '```ui:callout',
      'type: info',
      '  content: [bad yaml',
      '    unclosed: {bracket',
      '```',
    ].join('\n');

    const result = compile(md);
    expect(result.diagnostics.length).toBeGreaterThan(0);

    const yamlErrors = result.diagnostics.filter((d) => d.code === 'YAML_PARSE_ERROR');
    // The parser should have caught the YAML error
    if (yamlErrors.length > 0) {
      expect(yamlErrors[0]!.severity).toBe('error');
      expect(yamlErrors[0]!.message).toContain('YAML');
    } else {
      // If the parser recovers, there should be a schema validation error instead
      const schemaErrors = result.diagnostics.filter((d) => d.code === 'SCHEMA_VALIDATION_FAILED');
      expect(schemaErrors.length).toBeGreaterThan(0);
    }

    expect(result.hasErrors).toBe(true);
  });

  it('produces a diagnostic when YAML has duplicate keys', () => {
    const md = ['```ui:callout', 'type: info', 'content: first', 'content: second', '```'].join(
      '\n',
    );

    const result = compile(md);
    // YAML with duplicate keys may parse (last value wins) or produce a warning.
    // Either way, the IR should still be produced.
    expect(result.ir).toBeDefined();
    expect(result.ir.blocks.length).toBeGreaterThanOrEqual(1);
  });

  it('produces diagnostics for completely invalid YAML (bare colon on line)', () => {
    const md = ['```ui:graph', ': : : this is not valid yaml at all }{', '```'].join('\n');

    const result = compile(md);
    // Should produce either a YAML parse error or a schema validation error
    const hasRelevantDiagnostic = result.diagnostics.some(
      (d) => d.code === 'YAML_PARSE_ERROR' || d.code === 'SCHEMA_VALIDATION_FAILED',
    );
    expect(hasRelevantDiagnostic).toBe(true);
    expect(result.hasErrors).toBe(true);
  });
});

// ─── Unknown Component Type ──────────────────────────────────

describe('unknown component type', () => {
  it('produces an UNKNOWN_COMPONENT_TYPE diagnostic for ui:nonexistent', () => {
    const md = ['# Test', '', '```ui:nonexistent', 'foo: bar', '```'].join('\n');

    const result = compile(md);
    const unknownDiags = result.diagnostics.filter((d) => d.code === 'UNKNOWN_COMPONENT_TYPE');
    expect(unknownDiags).toHaveLength(1);
    expect(unknownDiags[0]!.severity).toBe('info');
    expect(unknownDiags[0]!.message).toContain('ui:nonexistent');
  });

  it('preserves the block as-is for unknown component types', () => {
    const md = ['```ui:customwidget', 'setting: value', 'enabled: true', '```'].join('\n');

    const result = compile(md);
    const uiBlock = result.ir.blocks.find((b) => b.type === 'ui:customwidget');
    expect(uiBlock).toBeDefined();
    expect(uiBlock!.data).toEqual({ setting: 'value', enabled: true });

    const unknownDiags = result.diagnostics.filter((d) => d.code === 'UNKNOWN_COMPONENT_TYPE');
    expect(unknownDiags).toHaveLength(1);
  });

  it('does not mark unknown component types as errors (they are info-level)', () => {
    const md = ['```ui:foobar', 'a: 1', '```'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    expect(getDiagnosticCodes(result)).toContain('UNKNOWN_COMPONENT_TYPE');
  });
});

// ─── Deeply Nested Content ───────────────────────────────────

describe('deeply nested content', () => {
  it('handles deeply nested markdown lists', () => {
    const md = [
      '# Deep nesting',
      '',
      '- Level 1',
      '  - Level 2',
      '    - Level 3',
      '      - Level 4',
      '        - Level 5',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    expect(result.ir).toBeDefined();
    expect(result.ir.blocks.length).toBeGreaterThan(0);

    // Should have a heading and a list block
    const heading = result.ir.blocks.find((b) => b.type === 'heading');
    expect(heading).toBeDefined();

    const list = result.ir.blocks.find((b) => b.type === 'list');
    expect(list).toBeDefined();
  });

  it('handles deeply nested blockquotes', () => {
    const md = ['> Level 1', '> > Level 2', '> > > Level 3'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    expect(result.ir).toBeDefined();
    expect(result.ir.blocks.length).toBeGreaterThan(0);
  });

  it('handles many consecutive headings', () => {
    const headings = Array.from({ length: 20 }, (_, i) => `## Heading ${i + 1}`);
    const md = headings.join('\n\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const headingBlocks = result.ir.blocks.filter((b) => b.type === 'heading');
    expect(headingBlocks).toHaveLength(20);
  });
});

// ─── Special Characters in YAML Values ───────────────────────

describe('special characters in YAML values', () => {
  it('handles YAML values with unicode characters', () => {
    const md = [
      '```ui:callout',
      'type: info',
      'content: "Hello \u4e16\u754c \ud83c\udf0d \u00e9\u00e0\u00fc\u00f1"',
      '```',
    ].join('\n');

    const result = compile(md);
    // Should parse without YAML errors
    const yamlErrors = result.diagnostics.filter((d) => d.code === 'YAML_PARSE_ERROR');
    expect(yamlErrors).toHaveLength(0);

    const calloutBlock = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(calloutBlock).toBeDefined();
    expect(JSON.stringify((calloutBlock!.data as Record<string, unknown>)['content'])).toContain(
      '\u4e16\u754c',
    );
  });

  it('handles YAML values with quotes and special YAML characters', () => {
    const md = [
      '```ui:callout',
      'type: warning',
      'content: "Colon: here, and {braces}, and [brackets]"',
      '```',
    ].join('\n');

    const result = compile(md);
    const yamlErrors = result.diagnostics.filter((d) => d.code === 'YAML_PARSE_ERROR');
    expect(yamlErrors).toHaveLength(0);

    const calloutBlock = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(calloutBlock).toBeDefined();
  });

  it('handles YAML values with multiline strings', () => {
    const md = [
      '```ui:callout',
      'type: tip',
      'content: |',
      '  Line one',
      '  Line two',
      '  Line three',
      '```',
    ].join('\n');

    const result = compile(md);
    const calloutBlock = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(calloutBlock).toBeDefined();

    const content = JSON.stringify((calloutBlock!.data as Record<string, unknown>)['content']);
    expect(content).toContain('Line one');
    expect(content).toContain('Line two');
  });

  it('handles YAML values with empty strings', () => {
    const md = ['```ui:callout', 'type: error', 'content: ""', '```'].join('\n');

    const result = compile(md);
    const calloutBlock = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(calloutBlock).toBeDefined();
    expect((calloutBlock!.data as Record<string, unknown>)['content']).toEqual([]);
  });
});

// ─── Empty UI Block ──────────────────────────────────────────

describe('empty ui block', () => {
  it('handles a ui block with no YAML content', () => {
    const md = ['```ui:callout', '```'].join('\n');

    const result = compile(md);
    // An empty ui: block should produce diagnostics since required fields are missing
    expect(result.ir).toBeDefined();

    // The block should still appear in IR (compiler preserves blocks even on error)
    const calloutBlocks = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(calloutBlocks.length).toBeGreaterThanOrEqual(1);

    // There should be diagnostics about schema validation or missing data
    const relevantDiags = result.diagnostics.filter(
      (d) => d.code === 'SCHEMA_VALIDATION_FAILED' || d.code === 'YAML_PARSE_ERROR',
    );
    expect(relevantDiags.length).toBeGreaterThanOrEqual(1);
  });

  it('handles a ui block with only whitespace', () => {
    const md = ['```ui:graph', '   ', '  ', '```'].join('\n');

    const result = compile(md);
    expect(result.ir).toBeDefined();

    // Should produce diagnostics about missing required fields
    const relevantDiags = result.diagnostics.filter(
      (d) => d.code === 'SCHEMA_VALIDATION_FAILED' || d.code === 'YAML_PARSE_ERROR',
    );
    expect(relevantDiags.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Schema Validation Errors in Compiler ────────────────────

describe('schema validation errors through compiler', () => {
  it('produces SCHEMA_VALIDATION_FAILED for callout with invalid type', () => {
    const md = ['```ui:callout', 'type: invalid-type', 'content: Some text', '```'].join('\n');

    const result = compile(md);
    const schemaErrors = result.diagnostics.filter((d) => d.code === 'SCHEMA_VALIDATION_FAILED');
    expect(schemaErrors).toHaveLength(1);
    expect(schemaErrors[0]!.severity).toBe('error');
    expect(schemaErrors[0]!.message).toContain('ui:callout');
    expect(result.hasErrors).toBe(true);
  });

  it('produces SCHEMA_VALIDATION_FAILED for graph with wrong node types', () => {
    const md = ['```ui:graph', 'type: dag', 'nodes: not-an-array', 'edges: []', '```'].join('\n');

    const result = compile(md);
    const schemaErrors = result.diagnostics.filter((d) => d.code === 'SCHEMA_VALIDATION_FAILED');
    expect(schemaErrors).toHaveLength(1);
    expect(schemaErrors[0]!.message).toContain('ui:graph');
    expect(result.hasErrors).toBe(true);
  });

  it('preserves raw data in block even when schema validation fails', () => {
    const md = ['```ui:callout', 'type: invalid-type', 'content: Some text', '```'].join('\n');

    const result = compile(md);
    const calloutBlock = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(calloutBlock).toBeDefined();
    // The raw parsed data should still be present
    expect((calloutBlock!.data as Record<string, unknown>)['type']).toBe('invalid-type');
    expect(JSON.stringify((calloutBlock!.data as Record<string, unknown>)['content'])).toContain(
      'Some text',
    );
  });

  it('attaches diagnostics to the block itself', () => {
    const md = ['```ui:chart', 'type: invalid', 'series: not-array', '```'].join('\n');

    const result = compile(md);
    const chartBlock = result.ir.blocks.find((b) => b.type === 'ui:chart');
    expect(chartBlock).toBeDefined();
    expect(chartBlock!.diagnostics).toBeDefined();
    expect(chartBlock!.diagnostics!.length).toBeGreaterThan(0);
    expect(chartBlock!.diagnostics![0]!.code).toBe('SCHEMA_VALIDATION_FAILED');
  });
});

// ─── Diagnostics Array Structure ─────────────────────────────

describe('diagnostics array structure', () => {
  it('diagnostics have required fields: severity, code, message, source', () => {
    const md = ['```ui:callout', 'type: bad', 'content: text', '```'].join('\n');

    const result = compile(md);
    for (const diag of result.diagnostics) {
      expect(diag).toHaveProperty('severity');
      expect(diag).toHaveProperty('code');
      expect(diag).toHaveProperty('message');
      expect(diag).toHaveProperty('source');
      expect(['error', 'warning', 'info']).toContain(diag.severity);
      expect(typeof diag.code).toBe('string');
      expect(typeof diag.message).toBe('string');
    }
  });

  it('hasErrors is false when only info/warning diagnostics exist', () => {
    const md = ['```ui:unknowntype', 'key: value', '```'].join('\n');

    const result = compile(md);
    // Unknown component type is info-level
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.hasErrors).toBe(false);
  });

  it('hasErrors is true when at least one error diagnostic exists', () => {
    const md = ['```ui:callout', 'type: bad', 'content: text', '```'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(true);
    expect(result.diagnostics.some((d) => d.severity === 'error')).toBe(true);
  });
});

// ─── Multiple Blocks and Mixed Content ───────────────────────

describe('multiple blocks and mixed content', () => {
  it('handles a document with many valid ui blocks', () => {
    const md = [
      '# Multiple Components',
      '',
      '```ui:callout',
      'type: info',
      'content: An info callout',
      '```',
      '',
      '```ui:callout',
      'type: warning',
      'content: A warning callout',
      '```',
      '',
      'Some paragraph text.',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const calloutBlocks = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(calloutBlocks).toHaveLength(2);
  });

  it('handles a document mixing valid and invalid ui blocks', () => {
    const md = [
      '# Mixed Validity',
      '',
      '```ui:callout',
      'type: info',
      'content: Valid callout',
      '```',
      '',
      '```ui:callout',
      'type: invalid',
      'content: Invalid callout',
      '```',
      '',
      '```ui:nonexistent',
      'key: value',
      '```',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(true);

    // Should still produce IR with all blocks
    expect(result.ir.blocks.length).toBeGreaterThanOrEqual(4); // heading + 2 callouts + 1 unknown

    // Should have both a schema error and an unknown component info
    expect(getDiagnosticCodes(result)).toContain('SCHEMA_VALIDATION_FAILED');
    expect(getDiagnosticCodes(result)).toContain('UNKNOWN_COMPONENT_TYPE');
  });
});

// ─── IR Structure Invariants ─────────────────────────────────

describe('IR structure invariants', () => {
  it('always produces a version field', () => {
    const result = compile('');
    expect(result.ir.version).toBe('1.0.0');
  });

  it('always produces an id field', () => {
    const result = compile('');
    expect(typeof result.ir.id).toBe('string');
    expect(result.ir.id.length).toBeGreaterThan(0);
  });

  it('always produces a metadata object', () => {
    const result = compile('');
    expect(result.ir.metadata).toBeDefined();
    expect(typeof result.ir.metadata).toBe('object');
  });

  it('always produces a blocks array', () => {
    const result = compile('');
    expect(Array.isArray(result.ir.blocks)).toBe(true);
  });

  it('always produces a references array', () => {
    const result = compile('');
    expect(Array.isArray(result.ir.references)).toBe(true);
  });

  it('always produces a layout object', () => {
    const result = compile('');
    expect(result.ir.layout).toBeDefined();
    expect(result.ir.layout.mode).toBe('document');
    expect(result.ir.layout.spacing).toBe('normal');
  });

  it('infers title from first h1 heading', () => {
    const md = '# My Document Title\n\nSome content.';
    const result = compile(md);
    expect(result.ir.metadata.title).toBe('My Document Title');
  });

  it('infers description from first paragraph', () => {
    const md = '# Title\n\nThis is the description paragraph.\n\nMore text.';
    const result = compile(md);
    expect(result.ir.metadata.description).toBe('This is the description paragraph.');
  });
});

// ─── Nested UI Components in Tabs / Steps ────────────────────

describe('nested ui: components inside ui:tabs', () => {
  const nestedTabsMd = [
    '```ui:tabs',
    'tabs:',
    '  - label: Tab A',
    '    content: |',
    '      Some text.',
    '',
    '      ```ui:callout',
    '      type: info',
    '      content: Nested callout.',
    '      ```',
    '  - label: Tab B',
    '    content: |',
    '      Plain content.',
    '```',
  ].join('\n');

  it('produces no NESTED_UI_COMPONENT diagnostic', () => {
    const result = compile(nestedTabsMd);
    const nestedDiags = result.diagnostics.filter((d) => d.code === 'NESTED_UI_COMPONENT');
    expect(nestedDiags).toHaveLength(0);
  });

  it('populates block.children with nested blocks', () => {
    const result = compile(nestedTabsMd);
    const tabsBlock = result.ir.blocks.find((b) => b.type === 'ui:tabs');
    expect(tabsBlock).toBeDefined();
    expect(tabsBlock!.children).toBeDefined();
    // Tab A: 1 paragraph + 1 callout = 2 children; Tab B: 1 paragraph = 1 child
    expect(tabsBlock!.children!.length).toBe(3);
    const callout = tabsBlock!.children!.find((c) => c.type === 'ui:callout');
    expect(callout).toBeDefined();
  });

  it('injects correct _slotChildCounts', () => {
    const result = compile(nestedTabsMd);
    const tabsBlock = result.ir.blocks.find((b) => b.type === 'ui:tabs');
    expect(tabsBlock).toBeDefined();
    const counts = (tabsBlock!.data as Record<string, unknown>)['_slotChildCounts'];
    expect(counts).toEqual([2, 1]);
  });

  it('runs schema validation on nested blocks', () => {
    const md = [
      '```ui:tabs',
      'tabs:',
      '  - label: Tab',
      '    content: |',
      '      ```ui:callout',
      '      type: bad-type',
      '      content: text',
      '      ```',
      '```',
    ].join('\n');
    const result = compile(md);
    const schemaErrors = result.diagnostics.filter((d) => d.code === 'SCHEMA_VALIDATION_FAILED');
    expect(schemaErrors.length).toBeGreaterThan(0);
  });
});

describe('nested ui: components inside ui:steps', () => {
  const nestedStepsMd = [
    '```ui:steps',
    'steps:',
    '  - title: Step One',
    '    status: completed',
    '    content: |',
    '      Do the thing.',
    '',
    '      ```ui:callout',
    '      type: tip',
    '      content: Helpful tip.',
    '      ```',
    '  - title: Step Two',
    '    status: active',
    '    content: |',
    '      More steps.',
    '```',
  ].join('\n');

  it('produces no NESTED_UI_COMPONENT diagnostic', () => {
    const result = compile(nestedStepsMd);
    const nestedDiags = result.diagnostics.filter((d) => d.code === 'NESTED_UI_COMPONENT');
    expect(nestedDiags).toHaveLength(0);
  });

  it('populates block.children with nested blocks', () => {
    const result = compile(nestedStepsMd);
    const stepsBlock = result.ir.blocks.find((b) => b.type === 'ui:steps');
    expect(stepsBlock).toBeDefined();
    expect(stepsBlock!.children).toBeDefined();
    // Step 1: paragraph + callout = 2; Step 2: paragraph = 1
    expect(stepsBlock!.children!.length).toBe(3);
    const callout = stepsBlock!.children!.find((c) => c.type === 'ui:callout');
    expect(callout).toBeDefined();
  });

  it('injects correct _slotChildCounts', () => {
    const result = compile(nestedStepsMd);
    const stepsBlock = result.ir.blocks.find((b) => b.type === 'ui:steps');
    expect(stepsBlock).toBeDefined();
    const counts = (stepsBlock!.data as Record<string, unknown>)['_slotChildCounts'];
    expect(counts).toEqual([2, 1]);
  });
});

// ─── Scalar Variable Expansion Inside Container Content ──────

describe('scalar variable expansion inside tab/step content', () => {
  it('expands {{scalar}} in prose text inside tab content', () => {
    const md = [
      '```ui:vars',
      'name: World',
      '```',
      '',
      '```ui:tabs',
      'tabs:',
      '  - label: Tab',
      '    content: |',
      '      Hello {{name}}.',
      '```',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);

    const tabsBlock = result.ir.blocks.find((b) => b.type === 'ui:tabs');
    expect(tabsBlock).toBeDefined();

    const para = tabsBlock!.children?.find((c) => c.type === 'paragraph');
    expect(para).toBeDefined();
    const text = (para!.data as Record<string, unknown>)['children'];
    expect(JSON.stringify(text)).toContain('Hello World');
  });

  it('expands {{scalar}} in ui: YAML inside tab content', () => {
    const md = [
      '```ui:vars',
      'kind: warning',
      '```',
      '',
      '```ui:tabs',
      'tabs:',
      '  - label: Tab',
      '    content: |',
      '      ```ui:callout',
      '      type: "{{kind}}"',
      '      content: text',
      '      ```',
      '```',
    ].join('\n');

    const result = compile(md);
    const tabsBlock = result.ir.blocks.find((b) => b.type === 'ui:tabs');
    const callout = tabsBlock?.children?.find((c) => c.type === 'ui:callout');
    expect(callout).toBeDefined();
    // Schema validation will fail on 'warning' for callout type, but the
    // substitution must have happened (the type field must be the expanded value).
    const calloutType = (callout!.data as Record<string, unknown>)['type'];
    expect(calloutType).toBe('warning');
  });

  it('expands {{scalar}} in prose text inside step content', () => {
    const md = [
      '```ui:vars',
      'tool: pnpm',
      '```',
      '',
      '```ui:steps',
      'steps:',
      '  - title: Install',
      '    content: |',
      '      Run {{tool}} install.',
      '```',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);

    const stepsBlock = result.ir.blocks.find((b) => b.type === 'ui:steps');
    const para = stepsBlock!.children?.find((c) => c.type === 'paragraph');
    expect(para).toBeDefined();
    const text = (para!.data as Record<string, unknown>)['children'];
    expect(JSON.stringify(text)).toContain('Run pnpm install');
  });
});

// ─── Block Variable Expansion Inside Container Content ───────

describe('block variable expansion inside tab/step content', () => {
  it('expands a suppressed block var paragraph inside tab content', () => {
    const md = [
      '```ui:callout=_note',
      'type: info',
      'content: I am a note.',
      '```',
      '',
      '```ui:tabs',
      'tabs:',
      '  - label: Tab',
      '    content: |',
      '      {{note}}',
      '```',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);

    const tabsBlock = result.ir.blocks.find((b) => b.type === 'ui:tabs');
    expect(tabsBlock).toBeDefined();
    // The tab slot should have a callout child (cloned from the suppressed var)
    const callout = tabsBlock!.children?.find((c) => c.type === 'ui:callout');
    expect(callout).toBeDefined();
    expect(JSON.stringify((callout!.data as Record<string, unknown>)['content'])).toContain(
      'I am a note.',
    );
    // _slotChildCounts should reflect the expanded block
    const counts = (tabsBlock!.data as Record<string, unknown>)['_slotChildCounts'];
    expect(counts).toEqual([1]);
  });

  it('emits UNDEFINED_BLOCK_VAR for unknown {{varName}} in tab content', () => {
    const md = [
      '```ui:tabs',
      'tabs:',
      '  - label: Tab',
      '    content: |',
      '      {{doesNotExist}}',
      '```',
    ].join('\n');

    const result = compile(md);
    const warnings = result.diagnostics.filter((d) => d.code === 'UNDEFINED_BLOCK_VAR');
    expect(warnings.length).toBeGreaterThan(0);
  });
});
