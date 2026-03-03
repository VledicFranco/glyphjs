import { Plugin, MarkdownRenderChild, type MarkdownPostProcessorContext } from 'obsidian';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import { allComponentDefinitions } from '@glyphjs/components';
import { createRoot, type Root } from 'react-dom/client';
import React from 'react';
import type { GlyphRuntime } from '@glyphjs/types';
import { buildObsidianTheme, debugThemeMapping } from './theme-sync.js';

// ─── Block renderer child ─────────────────────────────────────

class GlyphBlockChild extends MarkdownRenderChild {
  private root: Root | null = null;

  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly blockType: string,
    private readonly runtime: GlyphRuntime,
  ) {
    super(el);
  }

  override onload(): void {
    const markdown = `\`\`\`${this.blockType}\n${this.source}\n\`\`\`\n`;
    console.log(`[GlyphJS] compiling ${this.blockType}`);

    let ir;
    try {
      const result = compile(markdown);
      if (result.hasErrors) {
        const msgs = result.diagnostics
          .filter((d) => d.severity === 'error')
          .map((d) => d.message)
          .join('\n');
        console.error(`[GlyphJS] compile error in ${this.blockType}:\n${msgs}`);
        this.containerEl.createEl('pre', {
          text: `[GlyphJS] ${this.blockType} compile error:\n${msgs}`,
          cls: 'glyphjs-error',
        });
        return;
      }
      ir = result.ir;
    } catch (err) {
      console.error(`[GlyphJS] exception compiling ${this.blockType}:`, err);
      this.containerEl.createEl('pre', {
        text: `[GlyphJS] exception: ${String(err)}`,
        cls: 'glyphjs-error',
      });
      return;
    }

    try {
      this.root = createRoot(this.containerEl);
      this.root.render(React.createElement(this.runtime.GlyphDocument, { ir }));
      console.log(`[GlyphJS] rendered ${this.blockType}`);
    } catch (err) {
      console.error(`[GlyphJS] React render error in ${this.blockType}:`, err);
    }
  }

  override onunload(): void {
    this.root?.unmount();
    this.root = null;
  }
}

// ─── Plugin ───────────────────────────────────────────────────

export default class GlyphJSPlugin extends Plugin {
  private runtime!: GlyphRuntime;

  async onload(): Promise<void> {
    console.log('[GlyphJS] loading...');

    try {
      this.runtime = createGlyphRuntime({
        components: [...allComponentDefinitions],
        theme: buildObsidianTheme(this.isDark()),
      });
    } catch (err) {
      console.error('[GlyphJS] failed to create runtime:', err);
      return;
    }

    // Debug log on first load so you can see what Obsidian vars resolved to
    debugThemeMapping(this.isDark());

    // Keep theme in sync when the vault's CSS changes (theme switch, custom CSS)
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        const isDark = this.isDark();
        this.runtime.setTheme(buildObsidianTheme(isDark));
        debugThemeMapping(isDark);
      }),
    );

    // Use a post-processor that scans rendered HTML for ui:* code blocks.
    // This approach works regardless of whether Obsidian's parser handles
    // the colon in language identifiers correctly.
    this.registerMarkdownPostProcessor((el, ctx) => {
      this.processSection(el, ctx);
    });

    console.log('[GlyphJS] loaded — post-processor registered');
  }

  override onunload(): void {
    console.log('[GlyphJS] unloaded');
  }

  private processSection(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    // Find all fenced code blocks in this section
    const codeBlocks = el.querySelectorAll('pre > code');

    for (const code of Array.from(codeBlocks)) {
      // Obsidian adds class="language-{lang}" to code elements.
      // For "ui:callout", it may produce "language-ui:callout" or just "language-ui"
      // depending on the version. We match anything starting with "language-ui".
      const langClass = Array.from(code.classList).find((c) => c.startsWith('language-ui'));
      if (!langClass) continue;

      const pre = code.parentElement as HTMLPreElement;
      console.log(`[GlyphJS] found block with class: ${langClass}`);

      // Resolve the full block type and YAML source.
      // getSectionInfo gives us the raw Markdown source + line range.
      const info = ctx.getSectionInfo(pre);

      let blockType: string;
      let source: string;

      if (info) {
        const lines = info.text.split('\n');
        const sectionLines = lines.slice(info.lineStart, info.lineEnd + 1);

        // getSectionInfo may include blank lines or headings before the fence
        // (lineStart can point to the blank line preceding the opening fence).
        // Search for the fence line rather than assuming sectionLines[0].
        let fenceIndex = -1;
        let match: RegExpMatchArray | null = null;
        for (let i = 0; i < sectionLines.length; i++) {
          const m = sectionLines[i].match(/^`{3,}\s*(ui:\w+)/);
          if (m) {
            fenceIndex = i;
            match = m;
            break;
          }
        }
        if (fenceIndex === -1 || !match) {
          console.warn(
            `[GlyphJS] could not find ui: fence in section (lineStart=${info.lineStart})`,
          );
          continue;
        }
        blockType = match[1]; // "ui:callout"
        source = sectionLines.slice(fenceIndex + 1, -1).join('\n');
        console.log(`[GlyphJS] resolved type="${blockType}" from source`);
      } else {
        // Fallback: derive type from class name, source from element text
        blockType = langClass.replace('language-', '');
        source = code.textContent ?? '';
        console.warn(`[GlyphJS] getSectionInfo returned null for ${blockType}, using fallback`);
      }

      // Replace the <pre> with a wrapper div for the React root
      const wrapper = document.createElement('div');
      wrapper.addClass('glyphjs-root');
      pre.replaceWith(wrapper);

      const child = new GlyphBlockChild(wrapper, source, blockType, this.runtime);
      ctx.addChild(child);
    }
  }

  private isDark(): boolean {
    return document.body.classList.contains('theme-dark');
  }
}
