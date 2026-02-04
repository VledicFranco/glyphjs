import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import {
  calloutDefinition,
  chartDefinition,
  graphDefinition,
  relationDefinition,
  stepsDefinition,
  tableDefinition,
  tabsDefinition,
  timelineDefinition,
  kpiDefinition,
  accordionDefinition,
  comparisonDefinition,
  codeDiffDefinition,
  flowchartDefinition,
  fileTreeDefinition,
  sequenceDefinition,
} from '@glyphjs/components';
import type { CompilationResult } from '@glyphjs/compiler';
import { presets } from './presets/index.js';

// ─── Styles ──────────────────────────────────────────────────

const styles = {
  app: (dark: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: dark ? '#0a0e1a' : '#f4f6fa',
    color: dark ? '#d4dae3' : '#1a2035',
  }),
  toolbar: (dark: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    borderBottom: `1px solid ${dark ? '#1a2035' : '#d0d8e4'}`,
    background: dark ? '#0f1526' : '#f4f6fa',
    flexShrink: 0,
  }),
  title: {
    fontWeight: 700,
    fontSize: '16px',
    marginRight: 'auto',
  } as React.CSSProperties,
  select: (dark: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: `1px solid ${dark ? '#2a3550' : '#d0d8e4'}`,
    background: dark ? '#0a0e1a' : '#f4f6fa',
    color: dark ? '#d4dae3' : '#1a2035',
    fontSize: '13px',
  }),
  button: (dark: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: `1px solid ${dark ? '#2a3550' : '#d0d8e4'}`,
    background: dark ? '#0a0e1a' : '#f4f6fa',
    color: dark ? '#d4dae3' : '#1a2035',
    cursor: 'pointer',
    fontSize: '13px',
  }),
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  } as React.CSSProperties,
  editorPane: (dark: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${dark ? '#1a2035' : '#d0d8e4'}`,
  }),
  textarea: (dark: boolean): React.CSSProperties => ({
    flex: 1,
    resize: 'none',
    border: 'none',
    outline: 'none',
    padding: '16px',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    background: dark ? '#162038' : '#f4f6fa',
    color: dark ? '#d4dae3' : '#1a2035',
    tabSize: 2,
  }),
  previewPane: (dark: boolean): React.CSSProperties => ({
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    background: dark ? '#0a0e1a' : '#f4f6fa',
  }),
  diagnostics: (dark: boolean): React.CSSProperties => ({
    flexShrink: 0,
    maxHeight: '160px',
    overflow: 'auto',
    padding: '8px 16px',
    borderTop: `1px solid ${dark ? '#1a2035' : '#d0d8e4'}`,
    background: dark ? '#0f1526' : '#e8ecf3',
    fontSize: '12px',
    fontFamily: 'monospace',
  }),
  diagItem: (severity: string): React.CSSProperties => ({
    padding: '2px 0',
    color: severity === 'error' ? '#f87171' : severity === 'warning' ? '#fb923c' : '#38bdf8',
  }),
  paneLabel: (dark: boolean): React.CSSProperties => ({
    padding: '4px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: dark ? '#6b7a94' : '#6b7a94',
    borderBottom: `1px solid ${dark ? '#1a2035' : '#d0d8e4'}`,
    background: dark ? '#0f1526' : '#e8ecf3',
    flexShrink: 0,
  }),
};

// ─── App Component ───────────────────────────────────────────

export function App() {
  const [markdown, setMarkdown] = useState(presets.simple);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [dark, setDark] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('simple');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create runtime once with all component definitions
  const runtime = useMemo(() => {
    const rt = createGlyphRuntime({
      theme: dark ? 'dark' : 'light',
      components: [
        calloutDefinition,
        chartDefinition,
        graphDefinition,
        relationDefinition,
        stepsDefinition,
        tableDefinition,
        tabsDefinition,
        timelineDefinition,
        kpiDefinition,
        accordionDefinition,
        comparisonDefinition,
        codeDiffDefinition,
        flowchartDefinition,
        fileTreeDefinition,
        sequenceDefinition,
      ],
    });
    return rt;
  }, [dark]);

  const GlyphDocument = runtime.GlyphDocument;

  // Debounced compilation
  const compileMarkdown = useCallback((src: string) => {
    try {
      const compiled = compile(src);
      setResult(compiled);
    } catch {
      setResult(null);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      compileMarkdown(markdown);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [markdown, compileMarkdown]);

  // Compile immediately on mount
  useEffect(() => {
    compileMarkdown(markdown);
  }, []);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedPreset(key);
    const preset = presets[key];
    if (preset) {
      setMarkdown(preset);
    }
  };

  const handleThemeToggle = () => {
    setDark((prev) => !prev);
  };

  const diagnostics = result?.diagnostics ?? [];
  const diagCount = diagnostics.length;
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warnCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <div style={styles.app(dark)}>
      {/* Toolbar */}
      <div style={styles.toolbar(dark)}>
        <span style={styles.title}>Glyph JS Demo</span>
        <label htmlFor="preset-select" style={{ fontSize: '13px' }}>
          Preset:
        </label>
        <select
          id="preset-select"
          style={styles.select(dark)}
          value={selectedPreset}
          onChange={handlePresetChange}
        >
          {Object.keys(presets).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <button style={styles.button(dark)} onClick={handleThemeToggle} type="button">
          {dark ? 'Light' : 'Dark'} Theme
        </button>
        {diagCount > 0 && (
          <span style={{ fontSize: '12px' }}>
            {errorCount > 0 && (
              <span style={{ color: '#f87171', marginRight: '8px' }}>
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            {warnCount > 0 && (
              <span style={{ color: '#fb923c' }}>
                {warnCount} warning{warnCount !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Main split layout */}
      <div style={styles.main}>
        {/* Editor pane */}
        <div style={styles.editorPane(dark)}>
          <div style={styles.paneLabel(dark)}>Markdown Input</div>
          <textarea
            style={styles.textarea(dark)}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Preview pane */}
        <div style={styles.previewPane(dark)}>
          <div style={{ ...styles.paneLabel(dark), margin: '-16px -16px 16px -16px' }}>
            Rendered Output
          </div>
          {result?.ir && result.ir.blocks.length > 0 ? (
            <GlyphDocument ir={result.ir} />
          ) : (
            <p style={{ color: '#6b7a94', fontStyle: 'italic' }}>
              Type some markdown to see the preview...
            </p>
          )}
        </div>
      </div>

      {/* Diagnostics panel */}
      {diagCount > 0 && (
        <div style={styles.diagnostics(dark)}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Diagnostics ({diagCount})</div>
          {diagnostics.map((d, i) => (
            <div key={i} style={styles.diagItem(d.severity)}>
              [{d.severity.toUpperCase()}] {d.code}: {d.message}
              {d.position
                ? ` (line ${String(d.position.start.line)}:${String(d.position.start.column)})`
                : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
