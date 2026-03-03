import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => {
  const mod = { writeFile: vi.fn() };
  return { ...mod, default: mod };
});

// vi.mock is hoisted — use vi.hoisted so FAKE_SCHEMAS is available in the factory
const { FAKE_SCHEMAS } = vi.hoisted(() => {
  const FAKE_SCHEMAS = new Map<string, object>([
    ['chart', { type: 'object', properties: { title: { type: 'string' } } }],
    ['graph', { type: 'object', properties: { nodes: { type: 'array' } } }],
    ['table', { type: 'object', properties: { rows: { type: 'array' } } }],
  ]);
  return { FAKE_SCHEMAS };
});

vi.mock('@glyphjs/schemas', () => ({
  componentSchemas: FAKE_SCHEMAS,
  getJsonSchema: vi.fn((type: string) => FAKE_SCHEMAS.get(type)),
}));

import { writeFile } from 'node:fs/promises';
import { schemasCommand } from '../schemas.js';

// ── Setup / Teardown ──────────────────────────────────────────

let stdoutSpy: ReturnType<typeof vi.spyOn>;
let stderrSpy: ReturnType<typeof vi.spyOn>;
let savedExitCode: number | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  savedExitCode = process.exitCode;
  process.exitCode = undefined;
});

afterEach(() => {
  stdoutSpy.mockRestore();
  stderrSpy.mockRestore();
  process.exitCode = savedExitCode;
});

function allStdout(): string {
  return stdoutSpy.mock.calls.map((c) => c[0]).join('');
}

function allStderr(): string {
  return stderrSpy.mock.calls.map((c) => c[0]).join('');
}

// ── --list ────────────────────────────────────────────────────

describe('schemasCommand — --list', () => {
  it('prints sorted type names to stdout, one per line', async () => {
    await schemasCommand(undefined, { list: true });

    const lines = allStdout().trim().split('\n');
    expect(lines).toEqual(['chart', 'graph', 'table']);
    expect(process.exitCode).toBeUndefined();
  });

  it('does not write to stderr', async () => {
    await schemasCommand(undefined, { list: true });

    expect(stderrSpy).not.toHaveBeenCalled();
  });
});

// ── [type] ────────────────────────────────────────────────────

describe('schemasCommand — [type]', () => {
  it('outputs valid JSON to stdout for a known type', async () => {
    await schemasCommand('chart', {});

    const parsed = JSON.parse(allStdout());
    expect(parsed).toMatchObject({ type: 'object' });
    expect(process.exitCode).toBeUndefined();
  });

  it('strips "ui:" prefix from type argument', async () => {
    await schemasCommand('ui:chart', {});

    const parsed = JSON.parse(allStdout());
    expect(parsed).toMatchObject({ type: 'object' });
    expect(process.exitCode).toBeUndefined();
  });

  it('writes error to stderr and sets exitCode=2 for unknown type', async () => {
    await schemasCommand('nonexistent', {});

    expect(process.exitCode).toBe(2);
    expect(allStderr()).toContain('nonexistent');
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('prints available types on unknown type error', async () => {
    await schemasCommand('nonexistent', {});

    expect(allStderr()).toContain('chart');
    expect(allStderr()).toContain('graph');
  });
});

// ── --all ─────────────────────────────────────────────────────

describe('schemasCommand — --all', () => {
  it('outputs a JSON object with all types as keys', async () => {
    await schemasCommand(undefined, { all: true });

    const parsed = JSON.parse(allStdout());
    expect(Object.keys(parsed)).toContain('ui:chart');
    expect(Object.keys(parsed)).toContain('ui:graph');
    expect(Object.keys(parsed)).toContain('ui:table');
    expect(process.exitCode).toBeUndefined();
  });

  it('includes all schemas', async () => {
    await schemasCommand(undefined, { all: true });

    const parsed = JSON.parse(allStdout());
    expect(Object.keys(parsed)).toHaveLength(FAKE_SCHEMAS.size);
  });

  it('all keys are prefixed with "ui:"', async () => {
    await schemasCommand(undefined, { all: true });

    const parsed = JSON.parse(allStdout());
    for (const key of Object.keys(parsed)) {
      expect(key).toMatch(/^ui:/);
    }
  });
});

// ── -o / --output ─────────────────────────────────────────────

describe('schemasCommand — -o / --output', () => {
  it('writes output to file when -o is provided', async () => {
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await schemasCommand('chart', { output: 'chart.json' });

    expect(writeFile).toHaveBeenCalledTimes(1);
    const [path, content] = vi.mocked(writeFile).mock.calls[0]!;
    expect(String(path)).toContain('chart.json');
    expect(JSON.parse(content as string)).toMatchObject({ type: 'object' });
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('writes --all output to file', async () => {
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await schemasCommand(undefined, { all: true, output: 'all.json' });

    expect(writeFile).toHaveBeenCalledTimes(1);
    const [, content] = vi.mocked(writeFile).mock.calls[0]!;
    const parsed = JSON.parse(content as string);
    expect(Object.keys(parsed)).toContain('ui:chart');
  });

  it('sets exitCode=2 and reports error on write failure', async () => {
    vi.mocked(writeFile).mockRejectedValue(new Error('EACCES: permission denied'));

    await schemasCommand('chart', { output: 'out.json' });

    expect(process.exitCode).toBe(2);
    expect(allStderr()).toContain('Could not write output');
    expect(allStderr()).toContain('EACCES');
  });
});

// ── No args ───────────────────────────────────────────────────

describe('schemasCommand — no args', () => {
  it('prints usage error to stderr and sets exitCode=2', async () => {
    await schemasCommand(undefined, {});

    expect(process.exitCode).toBe(2);
    expect(allStderr()).toContain('error');
    expect(stdoutSpy).not.toHaveBeenCalled();
  });
});
