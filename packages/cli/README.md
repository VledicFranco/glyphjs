# @glyphjs/cli

Command-line tool for compiling, rendering, exporting, and serving [GlyphJS](https://github.com/VledicFranco/glyphjs) documents.

Turn Markdown with embedded `ui:` components into HTML pages, PDFs, DOCX files, or PNG screenshots — all from the terminal.

## Installation

```bash
npm install -g @glyphjs/cli
```

## Commands

### `glyphjs compile`

Compile a Markdown file to GlyphJS IR (JSON).

```bash
glyphjs compile document.md -o output.json
glyphjs compile document.md --compact       # minified JSON
cat document.md | glyphjs compile -          # read from stdin
```

| Flag                  | Description                          |
| --------------------- | ------------------------------------ |
| `-o, --output <path>` | Write JSON to file instead of stdout |
| `--compact`           | Output minified JSON                 |
| `-v, --verbose`       | Show diagnostics on stderr           |

### `glyphjs render`

Render `ui:` blocks from a Markdown file to PNG screenshots.

```bash
glyphjs render document.md -d ./screenshots/
glyphjs render document.md -b block-1 -o hero.png
glyphjs render document.md --theme dark --theme-file ./my-theme.yaml
```

| Flag                        | Description                             | Default                |
| --------------------------- | --------------------------------------- | ---------------------- |
| `-o, --output <path>`       | Output file or directory                | `<stem>-<blockId>.png` |
| `-d, --output-dir <dir>`    | Output directory for screenshots        |                        |
| `-t, --theme <theme>`       | Base theme: `light` or `dark`           | `light`                |
| `--theme-file <path>`       | YAML file with custom theme variables   |                        |
| `-b, --block-id <id>`       | Render only this block                  |                        |
| `-w, --width <px>`          | Viewport width in pixels                | `1280`                 |
| `--device-scale-factor <n>` | Device scale factor for HiDPI           | `2`                    |
| `-v, --verbose`             | Show diagnostics and progress on stderr |                        |

**Requires:** [Playwright](https://playwright.dev/) (`npm install playwright`)

### `glyphjs export`

Export a Markdown file to HTML, PDF, Markdown, or DOCX.

```bash
glyphjs export document.md --format html -o output.html
glyphjs export document.md --format pdf -o output.pdf --page-size A4
glyphjs export document.md --format md -o output.md --images-dir ./img/
glyphjs export document.md --format docx -o output.docx
```

| Flag                  | Description                                | Default        |
| --------------------- | ------------------------------------------ | -------------- |
| `--format <fmt>`      | Output format: `html`, `pdf`, `md`, `docx` | **(required)** |
| `-o, --output <path>` | Write to file instead of stdout            |                |
| `-t, --theme <theme>` | Base theme: `light` or `dark`              | `light`        |
| `--theme-file <path>` | YAML file with custom theme variables      |                |
| `-w, --width <px>`    | Document width in pixels                   | `800`          |
| `--title <title>`     | Override document title                    |                |
| `--page-size <size>`  | PDF page size (e.g. `Letter`, `A4`)        | `Letter`       |
| `--margin <margin>`   | PDF margin in CSS shorthand                | `1in`          |
| `--landscape`         | Use landscape orientation for PDF          |                |
| `--images-dir <dir>`  | Directory for rendered block images (md)   | `./images/`    |
| `-v, --verbose`       | Show diagnostics on stderr                 |                |

**Requires:** Playwright for `pdf` and `md` formats. [Pandoc](https://pandoc.org/) for `docx` format.

### `glyphjs serve`

Start a development server with live reload.

```bash
glyphjs serve document.md
glyphjs serve document.md --port 8080 --open
glyphjs serve document.md --theme-file ./my-theme.yaml
```

| Flag                  | Description                           | Default |
| --------------------- | ------------------------------------- | ------- |
| `-p, --port <port>`   | Port to listen on                     | `3000`  |
| `-t, --theme <theme>` | Base theme: `light` or `dark`         | `light` |
| `--theme-file <path>` | YAML file with custom theme variables |         |
| `--open`              | Open browser on start                 |         |
| `-v, --verbose`       | Show diagnostics on stderr            |         |

## Custom Themes

Create a YAML file to customize the appearance of rendered components:

```yaml
base: light # or "dark" — which built-in theme to extend

variables:
  --glyph-accent: '#F56400'
  --glyph-surface: '#F5EDE4'
  --glyph-border: '#E0D6CC'
  # ... any --glyph-* CSS custom property
```

Pass it to any command with `--theme-file`:

```bash
glyphjs export document.md --format html --theme-file my-theme.yaml -o styled.html
```

## Bundled Themes

The CLI ships with example themes in the `themes/` directory:

- **warmcraft** — Warm tones with earthy oranges, soft creams, and natural accents

Use a bundled theme by pointing `--theme-file` at it:

```bash
glyphjs export document.md --format html --theme-file node_modules/@glyphjs/cli/themes/warmcraft.yaml -o output.html
```

## Prerequisites

| Feature                | Dependency                                                       |
| ---------------------- | ---------------------------------------------------------------- |
| `render` command       | [Playwright](https://playwright.dev/) — `npm install playwright` |
| `export --format pdf`  | Playwright                                                       |
| `export --format md`   | Playwright (for block screenshots)                               |
| `export --format docx` | [Pandoc](https://pandoc.org/)                                    |

## License

MIT
