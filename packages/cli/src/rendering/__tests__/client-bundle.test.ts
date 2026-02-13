import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClientBundle, _resetClientBundleCache } from '../client-bundle.js';

vi.mock('node:fs', () => {
  const mod = { readFileSync: vi.fn(() => '/* hydrate bundle content */') };
  return { ...mod, default: mod };
});

import { readFileSync } from 'node:fs';

beforeEach(() => {
  vi.clearAllMocks();
  _resetClientBundleCache();
});

describe('getClientBundle', () => {
  it('reads the hydrate.js file', () => {
    const result = getClientBundle();

    expect(readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('hydrate.global.js'),
      'utf-8',
    );
    expect(result).toBe('/* hydrate bundle content */');
  });

  it('caches the result on subsequent calls', () => {
    getClientBundle();
    getClientBundle();
    getClientBundle();

    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it('returns the same content from cache', () => {
    const first = getClientBundle();
    const second = getClientBundle();

    expect(first).toBe(second);
  });

  it('reads fresh content after cache reset', () => {
    getClientBundle();
    _resetClientBundleCache();
    getClientBundle();

    expect(readFileSync).toHaveBeenCalledTimes(2);
  });
});
