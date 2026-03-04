import { describe, it, expect } from 'vitest';
import {
  createVarContext,
  expandScalarsInText,
  collectVarsBlock,
  isParagraphBlockVarCandidate,
  isBlockVarExpansionParagraph,
  expandBlockVars,
  expandTemplateInvocations,
} from '../variables.js';
import { compile } from '../compile.js';
import type { Block } from '@glyphjs/types';

// ─── Helpers ─────────────────────────────────────────────────

function makeVarCtx(vars?: Record<string, string>) {
  const m = new Map(Object.entries(vars ?? {}));
  return createVarContext(m);
}

function getDiagCodes(diagnostics: ReturnType<typeof compile>['diagnostics']): string[] {
  return diagnostics.map((d) => d.code);
}

// ─── Phase 1: expandScalarsInText ────────────────────────────

describe('expandScalarsInText', () => {
  it('T1.1: no {{}} → unchanged', () => {
    const ctx = makeVarCtx();
    const result = expandScalarsInText('Hello world', ctx, undefined, []);
    expect(result).toBe('Hello world');
  });

  it('T1.2: {{key}} known → substituted', () => {
    const ctx = makeVarCtx({ company: 'Acme Corp' });
    const result = expandScalarsInText('Welcome to {{company}}!', ctx, undefined, []);
    expect(result).toBe('Welcome to Acme Corp!');
  });

  it('T1.3: {{key}} unknown → literal + UNDEFINED_VARIABLE warning', () => {
    const ctx = makeVarCtx();
    const diagnostics: ReturnType<typeof compile>['diagnostics'] = [];
    const result = expandScalarsInText('Value: {{missing}}', ctx, undefined, diagnostics);
    expect(result).toBe('Value: {{missing}}');
    expect(getDiagCodes(diagnostics)).toContain('UNDEFINED_VARIABLE');
    expect(diagnostics[0]!.severity).toBe('warning');
  });

  it('T1.4: multiple vars in one string', () => {
    const ctx = makeVarCtx({ first: 'John', last: 'Doe' });
    const result = expandScalarsInText('{{first}} {{last}}', ctx, undefined, []);
    expect(result).toBe('John Doe');
  });

  it('T1.5: transitive a="{{b}}", b="hello" → "hello"', () => {
    const ctx = makeVarCtx({ a: '{{b}}', b: 'hello' });
    const result = expandScalarsInText('{{a}}', ctx, undefined, []);
    expect(result).toBe('hello');
  });

  it('T1.6: circular a="{{b}}", b="{{a}}" → CIRCULAR_VARIABLE_REF error', () => {
    const ctx = makeVarCtx({ a: '{{b}}', b: '{{a}}' });
    const diagnostics: ReturnType<typeof compile>['diagnostics'] = [];
    expandScalarsInText('{{a}}', ctx, undefined, diagnostics);
    const codes = getDiagCodes(diagnostics);
    expect(codes).toContain('CIRCULAR_VARIABLE_REF');
    const circularDiag = diagnostics.find((d) => d.code === 'CIRCULAR_VARIABLE_REF');
    expect(circularDiag!.severity).toBe('error');
  });
});

// ─── Phase 1: collectVarsBlock ────────────────────────────────

describe('collectVarsBlock', () => {
  it('T1.7: string values stored; non-string → VARS_BLOCK_INVALID_VALUE warning', () => {
    const ctx = makeVarCtx();
    const diagnostics: ReturnType<typeof compile>['diagnostics'] = [];
    collectVarsBlock({ name: 'Alice', count: 42, flag: true }, ctx, undefined, diagnostics);
    expect(ctx.scalarVars.get('name')).toBe('Alice');
    expect(ctx.scalarVars.has('count')).toBe(false);
    expect(ctx.scalarVars.has('flag')).toBe(false);
    const codes = getDiagCodes(diagnostics);
    expect(codes.filter((c) => c === 'VARS_BLOCK_INVALID_VALUE')).toHaveLength(2);
  });

  it('T1.8: value references earlier var in same block → expanded', () => {
    const ctx = makeVarCtx();
    const diagnostics: ReturnType<typeof compile>['diagnostics'] = [];
    collectVarsBlock(
      { greeting: 'Hello', full: '{{greeting}}, World' },
      ctx,
      undefined,
      diagnostics,
    );
    expect(ctx.scalarVars.get('full')).toBe('Hello, World');
    expect(diagnostics).toHaveLength(0);
  });
});

// ─── Phase 1: compile() integration ─────────────────────────

describe('compile() — scalar variables', () => {
  it('T1.9: frontmatter vars → substituted in prose', () => {
    const md = [
      '---',
      'vars:',
      '  company: Acme Corp',
      '  version: 2.4.1',
      '---',
      '',
      '# {{company}} v{{version}} Release Notes',
      '',
      'Welcome to {{company}}.',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const heading = result.ir.blocks.find((b) => b.type === 'heading');
    expect(heading).toBeDefined();
    const headingData = heading!.data as { children: { type: string; value?: string }[] };
    const text = headingData.children.map((c) => c.value ?? '').join('');
    expect(text).toContain('Acme Corp');
    expect(text).toContain('2.4.1');
  });

  it('T1.10: ui:vars block → NOT in ir.blocks', () => {
    const md = ['# Test', '', '```ui:vars', 'greeting: Hello', '```', '', 'Paragraph.'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const varsBlocks = result.ir.blocks.filter((b) => b.type === 'ui:vars');
    expect(varsBlocks).toHaveLength(0);
  });

  it('T1.11: ui:vars → used in subsequent ui: block YAML field', () => {
    const md = [
      '```ui:vars',
      'alertLevel: warning',
      'msg: Pay attention to this',
      '```',
      '',
      '```ui:callout',
      'type: {{alertLevel}}',
      'content: {{msg}}',
      '```',
    ].join('\n');

    const result = compile(md);
    const callout = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(callout).toBeDefined();
    expect((callout!.data as Record<string, unknown>)['type']).toBe('warning');
    expect((callout!.data as Record<string, unknown>)['content']).toBe('Pay attention to this');
  });

  it('T1.12: multiple ui:vars in sequence, later can use earlier', () => {
    const md = [
      '```ui:vars',
      'base: Acme',
      '```',
      '',
      '```ui:vars',
      'full: "{{base}} Corp"',
      '```',
      '',
      'Company: {{full}}.',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const para = result.ir.blocks.find((b) => b.type === 'paragraph');
    expect(para).toBeDefined();
    const data = para!.data as { children: { type: string; value?: string }[] };
    const text = data.children.map((c) => c.value ?? '').join('');
    expect(text).toContain('Acme Corp');
  });

  it('T1.13: undefined var → warning in diagnostics', () => {
    const md = 'Value: {{missing}}.';
    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    expect(getDiagCodes(result.diagnostics)).toContain('UNDEFINED_VARIABLE');
  });

  it('T1.14: circular vars → error, hasErrors=true', () => {
    const md = ['---', 'vars:', '  a: "{{b}}"', '  b: "{{a}}"', '---', '', '{{a}}'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(true);
    expect(getDiagCodes(result.diagnostics)).toContain('CIRCULAR_VARIABLE_REF');
  });
});

// ─── Phase 2: parser helpers ──────────────────────────────────

describe('isParagraphBlockVarCandidate', () => {
  it('returns varName for {{identifier}} sole text child', () => {
    const node = {
      type: 'paragraph',
      children: [{ type: 'text', value: '{{myBlock}}' }],
    };
    expect(isParagraphBlockVarCandidate(node as never)).toBe('myBlock');
  });

  it('returns null for paragraph with extra children', () => {
    const node = {
      type: 'paragraph',
      children: [
        { type: 'text', value: '{{foo}} and ' },
        { type: 'text', value: 'more text' },
      ],
    };
    expect(isParagraphBlockVarCandidate(node as never)).toBeNull();
  });

  it('returns null for non-paragraph', () => {
    const node = { type: 'heading', children: [{ type: 'text', value: '{{x}}' }] };
    expect(isParagraphBlockVarCandidate(node as never)).toBeNull();
  });
});

describe('isBlockVarExpansionParagraph', () => {
  function makeParaBlock(text: string): Block {
    return {
      id: 'b-test',
      type: 'paragraph',
      data: { children: [{ type: 'text', value: text }] },
      position: { start: { line: 1, column: 0 }, end: { line: 1, column: text.length } },
    };
  }

  it('returns varName for sole {{identifier}} text', () => {
    expect(isBlockVarExpansionParagraph(makeParaBlock('{{disclaimer}}'))).toBe('disclaimer');
  });

  it('returns null for non-paragraph block', () => {
    const block: Block = {
      id: 'b-test',
      type: 'heading',
      data: { children: [{ type: 'text', value: '{{x}}' }] },
      position: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
    };
    expect(isBlockVarExpansionParagraph(block)).toBeNull();
  });

  it('returns null for paragraph with multiple children', () => {
    const block: Block = {
      id: 'b-test',
      type: 'paragraph',
      data: {
        children: [
          { type: 'text', value: '{{x}} text' },
          { type: 'text', value: 'more' },
        ],
      },
      position: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
    };
    expect(isBlockVarExpansionParagraph(block)).toBeNull();
  });
});

// ─── Phase 2: compile() block variables ──────────────────────

describe('compile() — block variables', () => {
  // T2.1 / T2.2 / T2.3 — parser varName parsing
  it('T2.1: ui:callout=myBlock → componentType=callout, varName=myBlock', () => {
    // We verify indirectly via compile: block should be in ir and stored as block var
    const md = [
      '```ui:callout=disclaimer',
      'type: warning',
      'content: Figures are preliminary.',
      '```',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const callout = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(callout).toBeDefined();
  });

  it('T2.2: ui:callout=_note → suppressRender=true, varName=note', () => {
    const md = ['```ui:callout=_note', 'type: info', 'content: Internal use only.', '```'].join(
      '\n',
    );

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    // Suppressed block must NOT appear in ir.blocks
    const calloutBlocks = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(calloutBlocks).toHaveLength(0);
  });

  it('T2.3: ui:callout (no =) → varName=undefined, backwards compat', () => {
    const md = ['```ui:callout', 'type: info', 'content: Normal callout.', '```'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    expect(result.ir.blocks.filter((b) => b.type === 'ui:callout')).toHaveLength(1);
  });

  it('T2.4: ui:callout=disclaimer → in ir.blocks; block var available for expansion', () => {
    const md = [
      '```ui:callout=disclaimer',
      'type: warning',
      'content: Preliminary figures.',
      '```',
      '',
      '{{disclaimer}}',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const callouts = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    // original + one clone
    expect(callouts).toHaveLength(2);
  });

  it('T2.5: ui:callout=_note → NOT in ir.blocks', () => {
    const md = ['```ui:callout=_note', 'type: info', 'content: Hidden.', '```'].join('\n');

    const result = compile(md);
    expect(result.ir.blocks.filter((b) => b.type === 'ui:callout')).toHaveLength(0);
  });

  it('T2.6: {{disclaimer}} standalone → replaced with callout clone', () => {
    const md = [
      '```ui:callout=disclaimer',
      'type: warning',
      'content: Preliminary.',
      '```',
      '',
      '{{disclaimer}}',
    ].join('\n');

    const result = compile(md);
    const callouts = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(callouts).toHaveLength(2);
  });

  it('T2.7: clone id differs from original', () => {
    const md = [
      '```ui:callout=disclaimer',
      'type: warning',
      'content: Preliminary.',
      '```',
      '',
      '{{disclaimer}}',
    ].join('\n');

    const result = compile(md);
    const callouts = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(callouts).toHaveLength(2);
    expect(callouts[0]!.id).not.toBe(callouts[1]!.id);
  });

  it('T2.8: two {{disclaimer}} references → two clones, three total blocks', () => {
    const md = [
      '```ui:callout=disclaimer',
      'type: warning',
      'content: Preliminary.',
      '```',
      '',
      '{{disclaimer}}',
      '',
      '{{disclaimer}}',
    ].join('\n');

    const result = compile(md);
    const callouts = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(callouts).toHaveLength(3);
    // All IDs should be unique
    const ids = callouts.map((b) => b.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('T2.9: {{note}} after _note def → clone in ir.blocks', () => {
    const md = [
      '```ui:callout=_note',
      'type: info',
      'content: Internal.',
      '```',
      '',
      '{{note}}',
    ].join('\n');

    const result = compile(md);
    const callouts = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(callouts).toHaveLength(1); // only the clone (suppressed block not emitted)
  });

  it('T2.10: {{unknown}} standalone → UNDEFINED_BLOCK_VAR warning, paragraph kept', () => {
    const md = ['# Title', '', '{{unknownBlock}}'].join('\n');

    const result = compile(md);
    // Paragraph should still be in IR
    const para = result.ir.blocks.find((b) => b.type === 'paragraph');
    expect(para).toBeDefined();
    // Warning should mention undefined block var
    const codes = getDiagCodes(result.diagnostics);
    expect(codes).toContain('UNDEFINED_BLOCK_VAR');
  });

  it('T2.11: {{scalarVar}} standalone (scalar only) → text substitution, stays paragraph', () => {
    const md = ['---', 'vars:', '  greeting: Hello World', '---', '', '{{greeting}}'].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const para = result.ir.blocks.find((b) => b.type === 'paragraph');
    expect(para).toBeDefined();
    expect(para!.type).toBe('paragraph'); // stays a paragraph
    const data = para!.data as { children: { type: string; value?: string }[] };
    const text = data.children.map((c) => c.value ?? '').join('');
    expect(text).toBe('Hello World');
  });

  it('T2.12: {{disclaimer}} inline in sentence → text substitution (not block expansion)', () => {
    // When {{varName}} is inline (not sole content of paragraph), it should be scalar-expanded
    const md = [
      '---',
      'vars:',
      '  note: important',
      '---',
      '',
      'This is {{note}} information.',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const para = result.ir.blocks.find((b) => b.type === 'paragraph');
    expect(para).toBeDefined();
    const data = para!.data as { children: { type: string; value?: string }[] };
    const text = data.children.map((c) => c.value ?? '').join('');
    expect(text).toContain('important');
    expect(para!.type).toBe('paragraph');
  });

  it('T2.13: reference before definition → UNDEFINED_BLOCK_VAR (no forward-ref)', () => {
    const md = [
      '{{disclaimer}}',
      '',
      '```ui:callout=disclaimer',
      'type: warning',
      'content: Preliminary.',
      '```',
    ].join('\n');

    const result = compile(md);
    // The {{disclaimer}} paragraph appears before the definition, so it's unresolved
    const codes = getDiagCodes(result.diagnostics);
    expect(codes).toContain('UNDEFINED_BLOCK_VAR');
  });
});

// ─── Phase 3: parser template params ─────────────────────────

describe('compile() — parameterized templates', () => {
  it('T3.1: ui:callout=_note(title,body) → varName=note, templateParams=[title,body]', () => {
    // Verify via compile: template defined and invocable
    const md = [
      '```ui:callout=_note(title,body)',
      'type: info',
      'title: "{{title}}"',
      'content: "{{body}}"',
      '```',
    ].join('\n');

    const result = compile(md);
    // Suppressed template: no callout blocks in IR
    expect(result.ir.blocks.filter((b) => b.type === 'ui:callout')).toHaveLength(0);
  });

  it('T3.2: {{note("Hello","World")}} → callout with substituted title/body in IR', () => {
    const md = [
      '```ui:callout=_note(title,body)',
      'type: info',
      'title: "{{title}}"',
      'content: "{{body}}"',
      '```',
      '',
      '{{note("Q1 Guidance","Revenue targets are indicative.")}}',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const callout = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(callout).toBeDefined();
    expect((callout!.data as Record<string, unknown>)['title']).toBe('Q1 Guidance');
    expect((callout!.data as Record<string, unknown>)['content']).toBe(
      'Revenue targets are indicative.',
    );
  });

  it('T3.3: wrong arg count → TEMPLATE_ARITY_MISMATCH error', () => {
    const md = [
      '```ui:callout=_note(title,body)',
      'type: info',
      'title: "{{title}}"',
      'content: "{{body}}"',
      '```',
      '',
      '{{note("Only one arg")}}',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(true);
    expect(getDiagCodes(result.diagnostics)).toContain('TEMPLATE_ARITY_MISMATCH');
  });

  it('T3.4: arg value uses scalar var → arg expanded before template substitution', () => {
    const md = [
      '---',
      'vars:',
      '  projectName: Acme',
      '---',
      '',
      '```ui:callout=_note(title,body)',
      'type: info',
      'title: "{{title}}"',
      'content: "{{body}}"',
      '```',
      '',
      '{{note("{{projectName}} Update","Details here.")}}',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const callout = result.ir.blocks.find((b) => b.type === 'ui:callout');
    expect(callout).toBeDefined();
    // The arg "{{projectName}} Update" should be expanded to "Acme Update"
    expect((callout!.data as Record<string, unknown>)['title']).toBe('Acme Update');
  });

  it('T3.5: two invocations → two distinct clones', () => {
    const md = [
      '```ui:callout=_note(title,body)',
      'type: info',
      'title: "{{title}}"',
      'content: "{{body}}"',
      '```',
      '',
      '{{note("First","Content 1")}}',
      '',
      '{{note("Second","Content 2")}}',
    ].join('\n');

    const result = compile(md);
    expect(result.hasErrors).toBe(false);
    const callouts = result.ir.blocks.filter((b) => b.type === 'ui:callout');
    expect(callouts).toHaveLength(2);
    expect(callouts[0]!.id).not.toBe(callouts[1]!.id);
    expect((callouts[0]!.data as Record<string, unknown>)['title']).toBe('First');
    expect((callouts[1]!.data as Record<string, unknown>)['title']).toBe('Second');
  });
});
