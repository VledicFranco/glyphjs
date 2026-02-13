import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

let cached: string | undefined;

/**
 * Read the pre-built client hydration bundle (`dist/hydrate.global.js`).
 *
 * The bundle is built by tsup alongside the main CLI entry point and is
 * loaded at export time so it can be inlined into HTML pages. The result
 * is cached in-process so repeated calls during a single CLI invocation
 * are essentially free.
 */
export function getClientBundle(): string {
  if (cached !== undefined) return cached;

  const here = dirname(fileURLToPath(import.meta.url));
  // tsup bundles into dist/index.js so import.meta.url → dist/
  // IIFE format produces hydrate.global.js alongside it
  const bundlePath = resolve(here, 'hydrate.global.js');

  cached = readFileSync(bundlePath, 'utf-8');
  return cached;
}

/** Reset the cache — only needed for testing. */
export function _resetClientBundleCache(): void {
  cached = undefined;
}
