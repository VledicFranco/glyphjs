import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://vledicfranco.github.io',
  base: '/glyphjs',
  integrations: [
    starlight({
      title: 'Glyph JS',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: { github: 'https://github.com/VledicFranco/glyphjs' },
      customCss: ['./src/styles/oblivion.css'],
      sidebar: [
        { label: 'Getting Started', items: [
          { label: 'Introduction', slug: 'getting-started' },
        ]},
        { label: 'Authoring Guide', items: [
          { label: 'Markdown Syntax', slug: 'authoring-guide' },
        ]},
        { label: 'Components', items: [
          { label: 'Overview', slug: 'components' },
          { label: 'Callout', slug: 'components/callout' },
          { label: 'Tabs', slug: 'components/tabs' },
          { label: 'Steps', slug: 'components/steps' },
          { label: 'Table', slug: 'components/table' },
          { label: 'Graph', slug: 'components/graph' },
          { label: 'Relation', slug: 'components/relation' },
          { label: 'Chart', slug: 'components/chart' },
          { label: 'Timeline', slug: 'components/timeline' },
          { label: 'Architecture', slug: 'components/architecture' },
        ]},
        { label: 'Reference', items: [
          { label: 'IR Spec', slug: 'reference/ir-spec' },
          { label: 'Plugin API', slug: 'reference/plugin-api' },
          { label: 'Theming', slug: 'reference/theming' },
        ]},
        { label: 'Internals', items: [
          { label: 'Architecture', slug: 'architecture' },
        ]},
        { label: 'Gallery', slug: 'gallery' },
        { label: 'Troubleshooting', slug: 'troubleshooting' },
        { label: 'Playground', slug: 'playground' },
      ],
    }),
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        'node:crypto': path.resolve(__dirname, '../../shared/crypto-shim.ts'),
        crypto: path.resolve(__dirname, '../../shared/crypto-shim.ts'),
      },
    },
  },
});
