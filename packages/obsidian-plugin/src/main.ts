import type { App } from 'obsidian';
import { Plugin, PluginSettingTab, Setting, MarkdownRenderChild } from 'obsidian';
import { compile } from '@glyphjs/compiler';
import { createGlyphRuntime } from '@glyphjs/runtime';
import { allComponentDefinitions } from '@glyphjs/components';
import { createRoot, type Root } from 'react-dom/client';
import React from 'react';
import type { GlyphRuntime } from '@glyphjs/types';
import { buildObsidianTheme, debugThemeMapping } from './theme-sync.js';

// ─── Settings ─────────────────────────────────────────────────

interface GlyphSettings {
  debugLogging: boolean;
}

const DEFAULT_SETTINGS: GlyphSettings = {
  debugLogging: false,
};

// ─── Settings Tab ─────────────────────────────────────────────

class GlyphSettingsTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: GlyphJSPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Debug logging')
      .setDesc(
        'Log resolved theme variable mappings to the developer console on startup and theme change.',
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.debugLogging).onChange(async (value) => {
          this.plugin.settings.debugLogging = value;
          await this.plugin.saveSettings();
        }),
      );
  }
}

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

    let ir;
    try {
      const result = compile(markdown);
      if (result.hasErrors) {
        const msgs = result.diagnostics
          .filter((d) => d.severity === 'error')
          .map((d) => d.message)
          .join('\n');
        console.error(`[GlyphJS] compile error in ${this.blockType}:\n${msgs}`);
        this.renderError(msgs);
        return;
      }
      ir = result.ir;
    } catch (err) {
      console.error(`[GlyphJS] exception compiling ${this.blockType}:`, err);
      this.renderError(String(err));
      return;
    }

    try {
      this.root = createRoot(this.containerEl);
      this.root.render(React.createElement(this.runtime.GlyphDocument, { ir }));
    } catch (err) {
      console.error(`[GlyphJS] React render error in ${this.blockType}:`, err);
      this.renderError(String(err));
    }
  }

  override onunload(): void {
    this.root?.unmount();
    this.root = null;
  }

  private renderError(message: string): void {
    this.containerEl.empty();
    const errDiv = this.containerEl.createEl('div', { cls: 'glyphjs-error' });
    errDiv.createEl('span', { cls: 'glyphjs-error-title', text: this.blockType });
    errDiv.createEl('pre', { cls: 'glyphjs-error-body', text: message });
  }
}

// ─── Plugin ───────────────────────────────────────────────────

export default class GlyphJSPlugin extends Plugin {
  private runtime!: GlyphRuntime;
  settings!: GlyphSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.runtime = createGlyphRuntime({
      components: [...allComponentDefinitions],
      theme: buildObsidianTheme(this.isDark()),
    });

    if (this.settings.debugLogging) {
      debugThemeMapping(this.isDark());
    }

    // Re-sync theme when the vault's CSS changes (theme switch, custom CSS reload).
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        const isDark = this.isDark();
        this.runtime.setTheme(buildObsidianTheme(isDark));
        if (this.settings.debugLogging) {
          debugThemeMapping(isDark);
        }
      }),
    );

    // Live Preview (CodeMirror 6): register a code block processor per type.
    // CM6 widgets don't use CSS selectors, so the colon in 'ui:callout' is safe here.
    for (const def of allComponentDefinitions) {
      const type = def.type; // e.g. 'ui:callout'
      this.registerMarkdownCodeBlockProcessor(type, (source, el, ctx) => {
        ctx.addChild(new GlyphBlockChild(el, source, type, this.runtime));
      });
    }

    // Reading View: Obsidian's internal enhance.js post-processor calls
    // querySelectorAll('code.language-ui:callout'), which is an invalid CSS selector
    // (the colon makes ':callout' look like a pseudo-class) and throws a SyntaxError,
    // crashing the rendering pipeline before any of the code block processors above
    // get a chance to run.
    //
    // Fix: register a post-processor with sort order -10000 (runs before enhance.js)
    // that finds ui:* code blocks via safe DOM iteration and replaces them with React
    // roots before enhance.js ever tries to form an invalid CSS selector for them.
    const allTypes = new Set(allComponentDefinitions.map((d) => d.type));

    this.registerMarkdownPostProcessor((element, ctx) => {
      for (const pre of Array.from(element.querySelectorAll('pre'))) {
        const code = pre.querySelector('code');
        if (!code) continue;
        const langClass = Array.from(code.classList).find((c) => c.startsWith('language-ui:'));
        if (!langClass) continue;
        const blockType = langClass.slice('language-'.length); // e.g. 'ui:callout'
        if (!allTypes.has(blockType)) continue;
        const source = code.textContent?.trim() ?? '';
        const container = document.createElement('div');
        pre.replaceWith(container);
        ctx.addChild(new GlyphBlockChild(container, source, blockType, this.runtime));
      }
    }, -10000);

    this.addSettingTab(new GlyphSettingsTab(this.app, this));
  }

  override onunload(): void {
    // Obsidian handles cleanup of registered processors and event listeners.
    // React roots are unmounted via GlyphBlockChild.onunload().
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private isDark(): boolean {
    return document.body.classList.contains('theme-dark');
  }
}
