import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(() => Promise.resolve('# Hello')),
}));

let watchCallback: (() => void) | null = null;
const mockWatcher = { close: vi.fn() };

vi.mock('node:fs', () => ({
  watch: vi.fn((_path: string, cb: () => void) => {
    watchCallback = cb;
    return mockWatcher;
  }),
}));

let requestHandler: ((req: unknown, res: unknown) => void) | null = null;
const mockServer = {
  listen: vi.fn((_port: number, cb: () => void) => {
    if (cb) cb();
  }),
  on: vi.fn(),
  close: vi.fn(),
};

vi.mock('node:http', () => ({
  createServer: vi.fn((handler: (req: unknown, res: unknown) => void) => {
    requestHandler = handler;
    return mockServer;
  }),
}));

vi.mock('@glyphjs/compiler', () => ({
  compile: vi.fn(() => ({
    ir: {
      version: '1.0.0',
      id: 'test-doc',
      metadata: {},
      blocks: [],
      references: [],
      layout: { mode: 'document', spacing: 'normal' },
    },
    diagnostics: [],
    hasErrors: false,
  })),
}));

vi.mock('../../export/html.js', () => ({
  exportHTML: vi.fn(() => '<!DOCTYPE html><html><body>content</body></html>'),
}));

vi.mock('../../utils/logger.js', () => ({
  logDiagnostics: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('node:os', () => ({
  platform: vi.fn(() => 'linux'),
}));

import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { createServer } from 'node:http';
import { compile } from '@glyphjs/compiler';
import { exportHTML } from '../../export/html.js';
import { logDiagnostics } from '../../utils/logger.js';
import { exec } from 'node:child_process';
import { platform } from 'node:os';
import { serveCommand, injectLiveReload, openBrowser } from '../serve.js';

// ── Setup / Teardown ─────────────────────────────────────────

let stderrSpy: ReturnType<typeof vi.spyOn>;
let savedExitCode: number | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  watchCallback = null;
  requestHandler = null;
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  savedExitCode = process.exitCode;
  process.exitCode = undefined;
});

afterEach(() => {
  vi.useRealTimers();
  stderrSpy.mockRestore();
  process.exitCode = savedExitCode;
});

// ── injectLiveReload ─────────────────────────────────────────

describe('injectLiveReload', () => {
  it('injects EventSource script before </body>', () => {
    const html = '<html><body>hello</body></html>';
    const result = injectLiveReload(html);

    expect(result).toContain('EventSource');
    expect(result).toContain('__glyph/events');
    expect(result).toContain('</script></body>');
  });

  it('preserves original content', () => {
    const html = '<html><body>hello</body></html>';
    const result = injectLiveReload(html);

    expect(result).toContain('hello');
    expect(result).toContain('<html>');
  });

  it('returns unchanged HTML when no </body> tag exists', () => {
    const html = '<html><div>no body tag</div></html>';
    const result = injectLiveReload(html);

    expect(result).toBe(html);
  });
});

// ── openBrowser ──────────────────────────────────────────────

describe('openBrowser', () => {
  it('uses xdg-open on Linux', () => {
    vi.mocked(platform).mockReturnValue('linux');
    openBrowser('http://localhost:3000');
    expect(exec).toHaveBeenCalledWith('xdg-open "http://localhost:3000"');
  });

  it('uses open on macOS', () => {
    vi.mocked(platform).mockReturnValue('darwin');
    openBrowser('http://localhost:3000');
    expect(exec).toHaveBeenCalledWith('open "http://localhost:3000"');
  });

  it('uses start on Windows', () => {
    vi.mocked(platform).mockReturnValue('win32');
    openBrowser('http://localhost:3000');
    expect(exec).toHaveBeenCalledWith('start "" "http://localhost:3000"');
  });
});

// ── serveCommand ─────────────────────────────────────────────

describe('serveCommand', () => {
  it('reads the file and compiles on start', async () => {
    await serveCommand('doc.md', {});

    expect(readFile).toHaveBeenCalledWith(expect.stringContaining('doc.md'), 'utf-8');
    expect(compile).toHaveBeenCalledWith('# Hello', {
      filePath: expect.stringContaining('doc.md'),
    });
  });

  it('creates an HTTP server with a request handler', async () => {
    await serveCommand('doc.md', {});

    expect(createServer).toHaveBeenCalledWith(expect.any(Function));
    expect(requestHandler).not.toBeNull();
  });

  it('watches the input file', async () => {
    await serveCommand('doc.md', {});

    expect(watch).toHaveBeenCalledWith(expect.stringContaining('doc.md'), expect.any(Function));
  });

  it('listens on default port 3000', async () => {
    await serveCommand('doc.md', {});

    expect(mockServer.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  it('listens on custom port', async () => {
    await serveCommand('doc.md', { port: 8080 });

    expect(mockServer.listen).toHaveBeenCalledWith(8080, expect.any(Function));
  });

  it('logs serving URL and watch path to stderr', async () => {
    await serveCommand('doc.md', {});

    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Serving on http://localhost:3000');
    expect(allStderr).toContain('Watching');
    expect(allStderr).toContain('doc.md');
  });

  it('serves HTML with live-reload script on GET /', async () => {
    await serveCommand('doc.md', {});

    const mockRes = { writeHead: vi.fn(), end: vi.fn() };
    const mockReq = { url: '/' };
    requestHandler!(mockReq, mockRes);

    expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
    const html = mockRes.end.mock.calls[0]![0] as string;
    expect(html).toContain('EventSource');
    expect(html).toContain('content');
  });

  it('sets up SSE endpoint on GET /__glyph/events', async () => {
    await serveCommand('doc.md', {});

    const mockRes = { writeHead: vi.fn(), write: vi.fn(), end: vi.fn() };
    const mockReq = { url: '/__glyph/events', on: vi.fn() };
    requestHandler!(mockReq, mockRes);

    expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    expect(mockRes.write).toHaveBeenCalledWith(':\n\n');
  });

  it('re-compiles and sends reload event on file change', async () => {
    await serveCommand('doc.md', {});

    // Connect an SSE client
    const sseRes = { writeHead: vi.fn(), write: vi.fn(), end: vi.fn() };
    const sseReq = { url: '/__glyph/events', on: vi.fn() };
    requestHandler!(sseReq, sseRes);

    // Clear initial SSE keepalive write
    sseRes.write.mockClear();

    // Trigger file change
    watchCallback!();
    await vi.advanceTimersByTimeAsync(100);

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(compile).toHaveBeenCalledTimes(2);
    expect(sseRes.write).toHaveBeenCalledWith('event: reload\ndata: {}\n\n');
  });

  it('debounces rapid file changes', async () => {
    await serveCommand('doc.md', {});

    // Trigger multiple rapid changes
    watchCallback!();
    await vi.advanceTimersByTimeAsync(50);
    watchCallback!();
    await vi.advanceTimersByTimeAsync(50);
    watchCallback!();
    await vi.advanceTimersByTimeAsync(100);

    // Should only recompile once (debounced): 1 initial + 1 debounced
    expect(readFile).toHaveBeenCalledTimes(2);
  });

  it('sets exitCode=2 when file not found', async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error('ENOENT'));

    await serveCommand('missing.md', {});

    expect(process.exitCode).toBe(2);
    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Could not read input');
    expect(allStderr).toContain('ENOENT');
  });

  it('does not start server when initial read fails', async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error('ENOENT'));

    await serveCommand('missing.md', {});

    expect(createServer).not.toHaveBeenCalled();
    expect(watch).not.toHaveBeenCalled();
  });

  it('handles rebuild errors gracefully', async () => {
    await serveCommand('doc.md', {});

    // Make the next readFile fail
    vi.mocked(readFile).mockRejectedValueOnce(new Error('file deleted'));
    watchCallback!();
    await vi.advanceTimersByTimeAsync(100);

    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('Rebuild failed');
    expect(allStderr).toContain('file deleted');
    // Server should still be running (no exitCode set)
    expect(process.exitCode).toBeUndefined();
  });

  it('opens browser when --open is set', async () => {
    await serveCommand('doc.md', { open: true });

    expect(exec).toHaveBeenCalled();
  });

  it('does not open browser by default', async () => {
    await serveCommand('doc.md', {});

    expect(exec).not.toHaveBeenCalled();
  });

  it('passes theme to exportHTML', async () => {
    await serveCommand('doc.md', { theme: 'dark' });

    expect(exportHTML).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ theme: 'dark' }),
    );
  });

  it('logs diagnostics when --verbose is set', async () => {
    await serveCommand('doc.md', { verbose: true });

    expect(logDiagnostics).toHaveBeenCalled();
  });

  it('logs file change info when --verbose is set', async () => {
    await serveCommand('doc.md', { verbose: true });

    watchCallback!();
    await vi.advanceTimersByTimeAsync(100);

    const allStderr = stderrSpy.mock.calls.map((c) => c[0]).join('');
    expect(allStderr).toContain('File changed, reloaded');
  });

  it('removes SSE client on disconnect', async () => {
    await serveCommand('doc.md', {});

    // Connect an SSE client, capturing the close handler
    let closeHandler: (() => void) | null = null;
    const sseRes = { writeHead: vi.fn(), write: vi.fn(), end: vi.fn() };
    const sseReq = {
      url: '/__glyph/events',
      on: vi.fn((event: string, handler: () => void) => {
        if (event === 'close') closeHandler = handler;
      }),
    };
    requestHandler!(sseReq, sseRes);

    // Simulate client disconnect
    closeHandler!();

    // Clear mocks
    sseRes.write.mockClear();

    // Trigger file change
    watchCallback!();
    await vi.advanceTimersByTimeAsync(100);

    // Disconnected client should NOT receive the reload event
    expect(sseRes.write).not.toHaveBeenCalled();
  });

  it('registers SIGINT and SIGTERM shutdown handlers', async () => {
    const onSpy = vi.spyOn(process, 'on');

    await serveCommand('doc.md', {});

    expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    onSpy.mockRestore();
  });

  it('shutdown handler closes watcher, clients, and server', async () => {
    const onSpy = vi.spyOn(process, 'on');

    await serveCommand('doc.md', {});

    // Connect an SSE client
    const sseRes = { writeHead: vi.fn(), write: vi.fn(), end: vi.fn() };
    const sseReq = { url: '/__glyph/events', on: vi.fn() };
    requestHandler!(sseReq, sseRes);

    // Extract the shutdown handler registered with SIGINT
    const sigintCall = onSpy.mock.calls.find(([event]) => event === 'SIGINT');
    const shutdown = sigintCall![1] as () => void;

    // Invoke the shutdown handler
    shutdown();

    expect(mockWatcher.close).toHaveBeenCalled();
    expect(sseRes.end).toHaveBeenCalled();
    expect(mockServer.close).toHaveBeenCalled();

    onSpy.mockRestore();
  });
});
