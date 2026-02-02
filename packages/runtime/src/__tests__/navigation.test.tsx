// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import type { Reference, Block } from '@glyphjs/types';
import { RuntimeProvider } from '../context.js';
import { PluginRegistry } from '../plugins/registry.js';
import { useNavigation } from '../navigation/useNavigation.js';
import { ReferenceIndicator } from '../navigation/ReferenceIndicator.js';

// ─── Shared helpers ────────────────────────────────────────────

function createRuntimeWrapper(
  overrides: {
    references?: Reference[];
    onNavigate?: (ref: Reference, targetBlock: Block) => void;
  } = {},
) {
  const registry = new PluginRegistry();
  const references = overrides.references ?? [];
  const onNavigate = overrides.onNavigate;

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RuntimeProvider
        registry={registry}
        references={references}
        theme="light"
        onNavigate={onNavigate}
      >
        {children}
      </RuntimeProvider>
    );
  };
}

// ─── useNavigation ──────────────────────────────────────────────

describe('useNavigation', () => {
  beforeEach(() => {
    // Clean up any lingering aria-live regions from previous tests
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns a navigateTo function', () => {
    const wrapper = createRuntimeWrapper();
    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(result.current).toHaveProperty('navigateTo');
    expect(typeof result.current.navigateTo).toBe('function');
  });

  it('does nothing when target element is not found', () => {
    const onNavigate = vi.fn();
    const wrapper = createRuntimeWrapper({ onNavigate });
    const { result } = renderHook(() => useNavigation(), { wrapper });

    // No element in DOM with this block ID
    result.current.navigateTo('nonexistent-block');

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('scrolls to target block, highlights it, and focuses it', () => {
    const onNavigate = vi.fn();
    const ref: Reference = {
      id: 'ref-1',
      type: 'navigates-to',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-b',
    };
    const wrapper = createRuntimeWrapper({ onNavigate, references: [ref] });

    // Create a target element in the DOM
    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-b');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    result.current.navigateTo('block-b', ref);

    // 1. scrollIntoView was called
    expect(targetEl.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });

    // 2. Highlight attribute was applied
    expect(targetEl.getAttribute('data-glyph-highlight')).toBe('true');

    // 3. tabindex was set and focus was called
    expect(targetEl.getAttribute('tabindex')).toBe('-1');
    expect(targetEl.focus).toHaveBeenCalledWith({ preventScroll: true });

    // 4. onNavigate callback was fired
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({ id: 'block-b', type: 'paragraph' }),
    );

    document.body.removeChild(targetEl);
  });

  it('removes the highlight attribute after timeout', () => {
    vi.useFakeTimers();

    const wrapper = createRuntimeWrapper();
    const ref: Reference = {
      id: 'ref-1',
      type: 'navigates-to',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-b',
    };

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-b');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    result.current.navigateTo('block-b', ref);

    expect(targetEl.getAttribute('data-glyph-highlight')).toBe('true');

    // Advance past the highlight duration (1500ms)
    vi.advanceTimersByTime(1500);

    expect(targetEl.hasAttribute('data-glyph-highlight')).toBe(false);

    vi.useRealTimers();
    document.body.removeChild(targetEl);
  });

  it('creates an aria-live region for screen reader announcements', () => {
    const wrapper = createRuntimeWrapper();
    const ref: Reference = {
      id: 'ref-1',
      type: 'navigates-to',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-b',
    };

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-b');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    result.current.navigateTo('block-b', ref);

    // Should have created an aria-live region
    const announcer = document.querySelector('[aria-live="polite"]');
    expect(announcer).not.toBeNull();
    expect(announcer!.textContent).toBe('Navigated to block block-b');

    document.body.removeChild(targetEl);
  });

  it('does not set tabindex if element already has one', () => {
    const wrapper = createRuntimeWrapper();
    const ref: Reference = {
      id: 'ref-1',
      type: 'navigates-to',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-b',
    };

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-b');
    targetEl.setAttribute('tabindex', '0');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    result.current.navigateTo('block-b', ref);

    // Should preserve existing tabindex
    expect(targetEl.getAttribute('tabindex')).toBe('0');

    document.body.removeChild(targetEl);
  });

  it('finds matching reference automatically when no ref argument is provided', () => {
    const onNavigate = vi.fn();
    const ref: Reference = {
      id: 'ref-1',
      type: 'navigates-to',
      sourceBlockId: 'block-a',
      targetBlockId: 'block-b',
    };
    const wrapper = createRuntimeWrapper({ references: [ref], onNavigate });

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-b');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    // Navigate without passing a ref; it should find the matching one
    result.current.navigateTo('block-b');

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({ id: 'block-b' }),
    );

    document.body.removeChild(targetEl);
  });

  it('does not fire onNavigate when no ref matches and none provided', () => {
    const onNavigate = vi.fn();
    const wrapper = createRuntimeWrapper({ references: [], onNavigate });

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-x');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    const { result } = renderHook(() => useNavigation(), { wrapper });

    result.current.navigateTo('block-x');

    expect(onNavigate).not.toHaveBeenCalled();

    document.body.removeChild(targetEl);
  });
});

// ─── ReferenceIndicator ─────────────────────────────────────────

describe('ReferenceIndicator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('returns null when there are no references for the block', () => {
    const wrapper = createRuntimeWrapper({ references: [] });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    // No navigation element should be rendered
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    // No buttons should be rendered
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders outgoing reference badges', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'navigates-to',
        sourceBlockId: 'block-a',
        targetBlockId: 'block-b',
        label: 'Go to B',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referenced block: Go to B/,
    });
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain('Go to B');
  });

  it('renders incoming reference badges', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'details',
        sourceBlockId: 'block-c',
        targetBlockId: 'block-a',
        label: 'From C',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referencing block: From C/,
    });
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain('From C');
  });

  it('uses targetBlockId as label when label is not set (outgoing)', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'navigates-to',
        sourceBlockId: 'block-a',
        targetBlockId: 'block-b',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referenced block: block-b/,
    });
    expect(badge).toBeInTheDocument();
  });

  it('uses sourceBlockId as label when label is not set (incoming)', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'details',
        sourceBlockId: 'block-c',
        targetBlockId: 'block-a',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referencing block: block-c/,
    });
    expect(badge).toBeInTheDocument();
  });

  it('renders a nav element with an aria-label', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'navigates-to',
        sourceBlockId: 'block-a',
        targetBlockId: 'block-b',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'References for block block-a');
  });

  it('calls navigateTo when an outgoing badge is clicked', () => {
    const onNavigate = vi.fn();
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'navigates-to',
        sourceBlockId: 'block-a',
        targetBlockId: 'block-b',
        label: 'Target B',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs, onNavigate });

    // Create target block element in DOM for the navigation to work
    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-glyph-block', 'block-b');
    targetEl.scrollIntoView = vi.fn();
    targetEl.focus = vi.fn();
    document.body.appendChild(targetEl);

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referenced block: Target B/,
    });
    fireEvent.click(badge);

    // scrollIntoView should have been called
    expect(targetEl.scrollIntoView).toHaveBeenCalled();

    document.body.removeChild(targetEl);
  });

  it('calls navigateTo when an incoming badge is clicked', () => {
    const onNavigate = vi.fn();
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'details',
        sourceBlockId: 'block-c',
        targetBlockId: 'block-a',
        label: 'Source C',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs, onNavigate });

    const sourceEl = document.createElement('div');
    sourceEl.setAttribute('data-glyph-block', 'block-c');
    sourceEl.scrollIntoView = vi.fn();
    sourceEl.focus = vi.fn();
    document.body.appendChild(sourceEl);

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referencing block: Source C/,
    });
    fireEvent.click(badge);

    expect(sourceEl.scrollIntoView).toHaveBeenCalled();

    document.body.removeChild(sourceEl);
  });

  it('renders both outgoing and incoming badges together', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'navigates-to',
        sourceBlockId: 'block-a',
        targetBlockId: 'block-b',
        label: 'Out',
      },
      {
        id: 'ref-2',
        type: 'details',
        sourceBlockId: 'block-c',
        targetBlockId: 'block-a',
        label: 'In',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    expect(
      screen.getByRole('button', { name: /Navigate to referenced block: Out/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Navigate to referencing block: In/ }),
    ).toBeInTheDocument();
  });

  it('shows the reference type in the title attribute (outgoing)', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'navigates-to',
        sourceBlockId: 'block-a',
        targetBlockId: 'block-b',
        label: 'Target',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referenced block: Target/,
    });
    expect(badge).toHaveAttribute('title', 'Go to: Target (navigates-to)');
  });

  it('shows the reference type in the title attribute (incoming)', () => {
    const refs: Reference[] = [
      {
        id: 'ref-1',
        type: 'details',
        sourceBlockId: 'block-c',
        targetBlockId: 'block-a',
        label: 'Source',
      },
    ];
    const wrapper = createRuntimeWrapper({ references: refs });

    render(<ReferenceIndicator blockId="block-a" />, { wrapper });

    const badge = screen.getByRole('button', {
      name: /Navigate to referencing block: Source/,
    });
    expect(badge).toHaveAttribute('title', 'Referenced by: Source (details)');
  });
});
