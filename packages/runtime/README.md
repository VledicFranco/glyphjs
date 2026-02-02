# @glyphjs/runtime

React rendering engine for Glyph JS IR documents.

## Install

```bash
pnpm add @glyphjs/runtime react react-dom
```

## Usage

```tsx
import { createGlyphRuntime } from '@glyphjs/runtime';
import { compile } from '@glyphjs/compiler';

const runtime = createGlyphRuntime();
const { ir } = compile(markdown);

function App() {
  return <runtime.Document ir={ir} />;
}
```

### Theming

```tsx
import { ThemeProvider, darkTheme } from '@glyphjs/runtime';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <runtime.Document ir={ir} />
    </ThemeProvider>
  );
}
```

## Key exports

- `createGlyphRuntime()` -- create a runtime instance with a `Document` component
- `GlyphDocument` -- standalone document renderer
- `BlockRenderer` -- renders individual IR blocks
- `ThemeProvider` / `useGlyphTheme` -- theme system with light and dark presets
- `LayoutProvider` / `DocumentLayout` / `DashboardLayout` / `PresentationLayout` -- layout engines
- `ComponentRegistry` / `PluginRegistry` -- component registration and plugin system
- `ErrorBoundary` / `FallbackRenderer` -- graceful error handling
- `RuntimeProvider` / `useRuntime` / `useReferences` -- React context and hooks

## Docs

https://github.com/VledicFranco/glyphjs
