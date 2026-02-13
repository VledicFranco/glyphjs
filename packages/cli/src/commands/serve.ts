import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve } from 'node:path';
import { exec } from 'node:child_process';
import { platform } from 'node:os';
import { compile } from '@glyphjs/compiler';
import { logDiagnostics } from '../utils/logger.js';
import { exportHTML } from '../export/html.js';
import { loadThemeFile, resolveThemeVars } from '../rendering/theme-loader.js';
import type { ThemeName } from '../rendering/ssr.js';

export interface ServeCommandOptions {
  port?: number;
  theme?: ThemeName;
  themeFile?: string;
  open?: boolean;
  verbose?: boolean;
}

const LIVE_RELOAD_SCRIPT = [
  '<script>',
  '(function(){',
  'var es=new EventSource("/__glyph/events");',
  'es.addEventListener("reload",function(){window.location.reload()});',
  'es.onerror=function(){setTimeout(function(){window.location.reload()},1000)};',
  '})();',
  '</script>',
].join('');

/**
 * Inject a live-reload SSE client script into HTML before the closing </body> tag.
 */
export function injectLiveReload(html: string): string {
  return html.replace('</body>', LIVE_RELOAD_SCRIPT + '</body>');
}

/**
 * Open a URL in the default system browser.
 */
export function openBrowser(url: string): void {
  const p = platform();
  if (p === 'win32') {
    exec(`start "" "${url}"`);
  } else if (p === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

/**
 * Start a development server with live reload.
 *
 * - Serves compiled HTML at `/`
 * - Provides an SSE endpoint at `/__glyph/events` for live reload
 * - Watches the input file and re-compiles on changes
 */
export async function serveCommand(input: string, options: ServeCommandOptions): Promise<void> {
  const port = options.port ?? 3000;
  const theme = options.theme ?? 'light';
  const filePath = resolve(process.cwd(), input);

  // Load custom theme file if provided
  let themeVars: Record<string, string> | undefined;
  if (options.themeFile) {
    try {
      const themeData = await loadThemeFile(resolve(process.cwd(), options.themeFile));
      themeVars = resolveThemeVars(themeData.base, themeData.overrides);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`error — Failed to load theme file: ${message}\n`);
      process.exitCode = 2;
      return;
    }
  }

  // Initial compile
  let currentHTML: string;
  try {
    const markdown = await readFile(filePath, 'utf-8');
    const result = compile(markdown, { filePath });
    if (options.verbose) {
      logDiagnostics(result.diagnostics, filePath);
    }
    currentHTML = injectLiveReload(exportHTML(result.ir, { theme, themeVars }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error — Could not read input: ${message}\n`);
    process.exitCode = 2;
    return;
  }

  // Track connected SSE clients
  const clients = new Set<ServerResponse>();

  // HTTP server
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/__glyph/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.write(':\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(currentHTML);
  });

  // File watcher with 100ms debounce
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = watch(filePath, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const markdown = await readFile(filePath, 'utf-8');
        const result = compile(markdown, { filePath });
        if (options.verbose) {
          logDiagnostics(result.diagnostics, filePath);
        }
        currentHTML = injectLiveReload(exportHTML(result.ir, { theme, themeVars }));
        for (const client of clients) {
          client.write('event: reload\ndata: {}\n\n');
        }
        if (options.verbose) {
          process.stderr.write('info  — File changed, reloaded\n');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`error — Rebuild failed: ${message}\n`);
      }
    }, 100);
  });

  // Graceful shutdown
  const shutdown = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    watcher.close();
    for (const client of clients) {
      client.end();
    }
    clients.clear();
    server.close();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start listening
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    process.stderr.write(`info  — Serving on ${url}\n`);
    process.stderr.write(`info  — Watching ${filePath}\n`);
    if (options.open) {
      openBrowser(url);
    }
  });
}
