/**
 * Golden file tests for @glyphjs/parser.
 *
 * For each `.md` fixture in `fixtures/`, the parser is run and the resulting AST
 * is compared against the corresponding `.ast.json` golden file.
 *
 * Position information is stripped from the AST before comparison to reduce
 * brittleness — any formatting change in remark-parse could shift offsets,
 * but the structural AST should remain stable.
 *
 * To regenerate golden files after an intentional change:
 *   UPDATE_GOLDEN=true pnpm test --filter @glyphjs/parser
 */
import { describe, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readFixture, assertMatchesGolden } from '../../../../tests/helpers/golden.js';
import { parseGlyphMarkdown } from '../parse.js';

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
 * Discover all `.md` fixture files and generate test cases dynamically.
 */
const fixtureFiles = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();

describe('parser golden file tests', () => {
  it.each(fixtureFiles)('%s matches golden AST', (mdFile) => {
    const mdPath = join(FIXTURES_DIR, mdFile);
    const goldenPath = join(FIXTURES_DIR, mdFile.replace(/\.md$/, '.ast.json'));

    const markdown = readFixture(mdPath);
    const ast = parseGlyphMarkdown(markdown);
    const stripped = stripPositions(ast);

    assertMatchesGolden(stripped, goldenPath);
  });
});
