import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadThemeFile, resolveThemeVars } from '../theme-loader.js';

// ── Mock fs and yaml ────────────────────────────────────────

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('yaml', () => ({
  parse: vi.fn(),
}));

import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';

const mockReadFile = readFile as ReturnType<typeof vi.fn>;
const mockParseYaml = parseYaml as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ── loadThemeFile ───────────────────────────────────────────

describe('loadThemeFile', () => {
  it('loads and parses a valid theme file with base and variables', async () => {
    mockReadFile.mockResolvedValue('raw yaml content');
    mockParseYaml.mockReturnValue({
      base: 'dark',
      variables: { '--glyph-bg': '#000', '--glyph-text': '#fff' },
    });

    const result = await loadThemeFile('/path/to/theme.yaml');

    expect(mockReadFile).toHaveBeenCalledWith('/path/to/theme.yaml', 'utf-8');
    expect(mockParseYaml).toHaveBeenCalledWith('raw yaml content');
    expect(result).toEqual({
      base: 'dark',
      overrides: { '--glyph-bg': '#000', '--glyph-text': '#fff' },
    });
  });

  it('defaults base to "light" when not specified', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue({
      variables: { '--glyph-accent': '#F56400' },
    });

    const result = await loadThemeFile('/theme.yaml');

    expect(result.base).toBe('light');
    expect(result.overrides).toEqual({ '--glyph-accent': '#F56400' });
  });

  it('returns empty overrides when variables is not specified', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue({ base: 'light' });

    const result = await loadThemeFile('/theme.yaml');

    expect(result.overrides).toEqual({});
  });

  it('throws for invalid base value', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue({ base: 'neon' });

    await expect(loadThemeFile('/theme.yaml')).rejects.toThrow('Invalid theme base: "neon"');
  });

  it('throws for non-object YAML content', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue('just a string');

    await expect(loadThemeFile('/theme.yaml')).rejects.toThrow('expected a YAML object');
  });

  it('throws for null YAML content', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue(null);

    await expect(loadThemeFile('/theme.yaml')).rejects.toThrow('expected a YAML object');
  });

  it('throws when variables is not an object', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue({ variables: 'not-an-object' });

    await expect(loadThemeFile('/theme.yaml')).rejects.toThrow('"variables" must be an object');
  });

  it('throws when variables is an array', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue({ variables: ['--glyph-bg'] });

    await expect(loadThemeFile('/theme.yaml')).rejects.toThrow('"variables" must be an object');
  });

  it('throws when a variable value is not a string', async () => {
    mockReadFile.mockResolvedValue('');
    mockParseYaml.mockReturnValue({
      variables: { '--glyph-bg': 123 },
    });

    await expect(loadThemeFile('/theme.yaml')).rejects.toThrow(
      'Invalid theme variable "--glyph-bg"',
    );
  });
});

// ── resolveThemeVars ────────────────────────────────────────

describe('resolveThemeVars', () => {
  it('returns light base vars with overrides merged', () => {
    const result = resolveThemeVars('light', { '--glyph-bg': '#ffffff' });

    // Should have the override
    expect(result['--glyph-bg']).toBe('#ffffff');
    // Should still have other light theme vars
    expect(result['--glyph-text']).toBeDefined();
  });

  it('returns dark base vars with overrides merged', () => {
    const result = resolveThemeVars('dark', { '--glyph-accent': '#F56400' });

    expect(result['--glyph-accent']).toBe('#F56400');
    // Should still have dark theme text color
    expect(result['--glyph-text']).toBeDefined();
  });

  it('overrides take precedence over base vars', () => {
    const result = resolveThemeVars('light', {
      '--glyph-text': '#custom',
      '--glyph-bg': '#custom-bg',
    });

    expect(result['--glyph-text']).toBe('#custom');
    expect(result['--glyph-bg']).toBe('#custom-bg');
  });

  it('returns base vars unchanged when overrides is empty', () => {
    const result = resolveThemeVars('light', {});

    // Should be identical to LIGHT_THEME_VARS
    expect(result['--glyph-bg']).toBeDefined();
    expect(result['--glyph-text']).toBeDefined();
  });

  it('allows adding new variables not in the base theme', () => {
    const result = resolveThemeVars('light', { '--glyph-custom': '#abc' });

    expect(result['--glyph-custom']).toBe('#abc');
  });
});
