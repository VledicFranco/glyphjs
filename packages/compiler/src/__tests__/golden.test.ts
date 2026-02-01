/**
 * Golden file tests for @glyphjs/compiler.
 *
 * For each `.md` fixture in `fixtures/`, the compiler is run and the resulting
 * CompilationResult is compared against the corresponding `.ir.json` golden file.
 *
 * Position information is stripped from the IR before comparison to reduce
 * brittleness -- any formatting change in remark-parse could shift offsets,
 * but the structural IR should remain stable.
 *
 * To regenerate golden files after an intentional change:
 *   UPDATE_GOLDEN=true pnpm test --filter @glyphjs/compiler
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readFixture, assertMatchesGolden } from '../../../../tests/helpers/golden.js';
import { compile } from '../compile.js';

const FIXTURES_DIR = join(__dirname, 'fixtures');

/**
 * Recursively strip all `position` properties from an object tree.
 * This makes golden files resilient to changes in remark-parse position tracking.
 */
function stripPositions(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripPositions);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === 'position') continue;
      result[key] = stripPositions(value);
    }
    return result;
  }
  return obj;
}

/**
 * Wrapper around assertMatchesGolden that auto-generates missing golden files.
 * When a golden file does not exist, it is created on the first run so subsequent
 * runs can assert against it. Set UPDATE_GOLDEN=true to regenerate all golden files.
 */
function assertOrUpdateGolden(actual: unknown, goldenPath: string): void {
  if (!existsSync(goldenPath)) {
    // Force generation when golden file is missing (first run)
    const originalEnv = process.env['UPDATE_GOLDEN'];
    process.env['UPDATE_GOLDEN'] = 'true';
    try {
      assertMatchesGolden(actual, goldenPath);
    } finally {
      if (originalEnv === undefined) {
        delete process.env['UPDATE_GOLDEN'];
      } else {
        process.env['UPDATE_GOLDEN'] = originalEnv;
      }
    }
    // Now verify by reading back
    assertMatchesGolden(actual, goldenPath);
    return;
  }
  assertMatchesGolden(actual, goldenPath);
}

/**
 * Discover all `.md` fixture files and generate test cases dynamically.
 */
const fixtureFiles = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();

describe('compiler golden file tests', () => {
  it.each(fixtureFiles)('%s matches golden IR', (mdFile) => {
    const mdPath = join(FIXTURES_DIR, mdFile);
    const goldenPath = join(FIXTURES_DIR, mdFile.replace(/\.md$/, '.ir.json'));

    const markdown = readFixture(mdPath);
    const result = compile(markdown);
    const stripped = stripPositions(result);

    assertOrUpdateGolden(stripped, goldenPath);
  });
});

describe('compiler determinism', () => {
  it('produces identical output for 100 compilations of the same input', () => {
    const mdPath = join(FIXTURES_DIR, 'complex-document.md');
    const markdown = readFixture(mdPath);

    const baseline = JSON.stringify(stripPositions(compile(markdown)));

    for (let i = 0; i < 100; i++) {
      const current = JSON.stringify(stripPositions(compile(markdown)));
      expect(current).toBe(baseline);
    }
  });
});
