import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFile } from 'node:child_process';
import { checkPandocAvailable, runPandoc } from '../pandoc.js';

vi.mock('node:child_process', () => {
  const mod = { execFile: vi.fn() };
  return { ...mod, default: mod };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkPandocAvailable', () => {
  it('returns version string when pandoc is found', async () => {
    vi.mocked(execFile).mockImplementation((_cmd: string, _args: unknown, cb: unknown) => {
      (cb as (err: null, stdout: string) => void)(null, 'pandoc 3.1.9\nCompiled with pandoc-types');
      return undefined as never;
    });

    const result = await checkPandocAvailable();

    expect(result).toBe('pandoc 3.1.9');
  });

  it('returns null when pandoc is not found (ENOENT)', async () => {
    vi.mocked(execFile).mockImplementation((_cmd: string, _args: unknown, cb: unknown) => {
      const err = new Error('spawn pandoc ENOENT') as NodeJS.ErrnoException;
      err.code = 'ENOENT';
      (cb as (err: Error) => void)(err);
      return undefined as never;
    });

    const result = await checkPandocAvailable();

    expect(result).toBeNull();
  });

  it('returns null on any other error', async () => {
    vi.mocked(execFile).mockImplementation((_cmd: string, _args: unknown, cb: unknown) => {
      (cb as (err: Error) => void)(new Error('unexpected'));
      return undefined as never;
    });

    const result = await checkPandocAvailable();

    expect(result).toBeNull();
  });
});

describe('runPandoc', () => {
  it('calls execFile with correct args and cwd', async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: string, _args: unknown, _opts: unknown, cb: unknown) => {
        (cb as (err: null, stdout: string, stderr: string) => void)(null, '', '');
        return undefined as never;
      },
    );

    await runPandoc('document.md', 'output.docx', '/tmp/work');

    expect(execFile).toHaveBeenCalledWith(
      'pandoc',
      ['document.md', '--from=markdown', '--to=docx', '--output=output.docx'],
      { cwd: '/tmp/work' },
      expect.any(Function),
    );
  });

  it('resolves on success', async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: string, _args: unknown, _opts: unknown, cb: unknown) => {
        (cb as (err: null, stdout: string, stderr: string) => void)(null, '', '');
        return undefined as never;
      },
    );

    await expect(runPandoc('in.md', 'out.docx', '/tmp')).resolves.toBeUndefined();
  });

  it('throws on non-zero exit with stderr message', async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: string, _args: unknown, _opts: unknown, cb: unknown) => {
        const err = new Error('Command failed');
        (cb as (err: Error, stdout: string, stderr: string) => void)(
          err,
          '',
          'Could not parse input',
        );
        return undefined as never;
      },
    );

    await expect(runPandoc('in.md', 'out.docx', '/tmp')).rejects.toThrow(
      'Pandoc failed: Could not parse input',
    );
  });

  it('uses error.message when stderr is empty', async () => {
    vi.mocked(execFile).mockImplementation(
      (_cmd: string, _args: unknown, _opts: unknown, cb: unknown) => {
        (cb as (err: Error, stdout: string, stderr: string) => void)(
          new Error('Command failed'),
          '',
          '',
        );
        return undefined as never;
      },
    );

    await expect(runPandoc('in.md', 'out.docx', '/tmp')).rejects.toThrow(
      'Pandoc failed: Command failed',
    );
  });
});
