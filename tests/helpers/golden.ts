import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect } from 'vitest';

export function readFixture(path: string): string {
  return readFileSync(path, 'utf-8');
}

export function readExpected(path: string): unknown {
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

export function assertMatchesGolden(actual: unknown, expectedPath: string): void {
  if (process.env['UPDATE_GOLDEN'] === 'true') {
    mkdirSync(dirname(expectedPath), { recursive: true });
    writeFileSync(expectedPath, JSON.stringify(actual, null, 2) + '\n', 'utf-8');
    return;
  }
  const expected = readExpected(expectedPath);
  expect(actual).toEqual(expected);
}
