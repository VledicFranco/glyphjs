import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CodeDiff } from '../CodeDiff.js';
import type { CodeDiffData } from '../CodeDiff.js';
import { computeDiff } from '../diff.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('computeDiff', () => {
  it('returns equal lines for identical content', () => {
    const lines = computeDiff('a\nb\nc', 'a\nb\nc');
    expect(lines).toHaveLength(3);
    expect(lines.every((l) => l.kind === 'eq')).toBe(true);
  });

  it('detects additions', () => {
    const lines = computeDiff('a\nc', 'a\nb\nc');
    const added = lines.filter((l) => l.kind === 'add');
    expect(added).toHaveLength(1);
    expect(added[0].text).toBe('b');
  });

  it('detects deletions', () => {
    const lines = computeDiff('a\nb\nc', 'a\nc');
    const removed = lines.filter((l) => l.kind === 'del');
    expect(removed).toHaveLength(1);
    expect(removed[0].text).toBe('b');
  });

  it('handles mixed changes', () => {
    const lines = computeDiff('a\nb\nc', 'a\nx\nc');
    const dels = lines.filter((l) => l.kind === 'del');
    const adds = lines.filter((l) => l.kind === 'add');
    expect(dels.length).toBeGreaterThan(0);
    expect(adds.length).toBeGreaterThan(0);
  });

  it('handles empty before', () => {
    const lines = computeDiff('', 'a\nb');
    const added = lines.filter((l) => l.kind === 'add');
    expect(added.length).toBeGreaterThanOrEqual(1);
  });

  it('handles empty after', () => {
    const lines = computeDiff('a\nb', '');
    const removed = lines.filter((l) => l.kind === 'del');
    expect(removed.length).toBeGreaterThanOrEqual(1);
  });
});

describe('CodeDiff', () => {
  it('renders without markers for identical code', () => {
    const props = createMockProps<CodeDiffData>(
      { before: 'const x = 1;', after: 'const x = 1;' },
      'ui:codediff',
    );
    render(<CodeDiff {...props} />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    // No + or - markers, just spaces
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveAttribute('aria-label', 'unchanged');
  });

  it('marks added lines', () => {
    const props = createMockProps<CodeDiffData>({ before: 'a', after: 'a\nb' }, 'ui:codediff');
    render(<CodeDiff {...props} />);
    const addedRow = screen
      .getAllByRole('row')
      .find((r) => r.getAttribute('aria-label') === 'added');
    expect(addedRow).toBeDefined();
  });

  it('marks removed lines', () => {
    const props = createMockProps<CodeDiffData>({ before: 'a\nb', after: 'a' }, 'ui:codediff');
    render(<CodeDiff {...props} />);
    const removedRow = screen
      .getAllByRole('row')
      .find((r) => r.getAttribute('aria-label') === 'removed');
    expect(removedRow).toBeDefined();
  });

  it('renders labels when provided', () => {
    const props = createMockProps<CodeDiffData>(
      { before: 'old', after: 'new', beforeLabel: 'Before', afterLabel: 'After' },
      'ui:codediff',
    );
    render(<CodeDiff {...props} />);
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('has summary in aria-label', () => {
    const props = createMockProps<CodeDiffData>({ before: 'a', after: 'b' }, 'ui:codediff');
    render(<CodeDiff {...props} />);
    const region = screen.getByRole('region');
    expect(region.getAttribute('aria-label')).toMatch(/Code diff:/);
  });
});
