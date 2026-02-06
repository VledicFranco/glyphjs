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
      favicon: '/favicon.svg',
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
        { label: 'Guides', items: [
          { label: 'Custom Components', slug: 'guides/custom-components' },
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
          { label: 'KPI', slug: 'components/kpi' },
          { label: 'Accordion', slug: 'components/accordion' },
          { label: 'Comparison', slug: 'components/comparison' },
          { label: 'CodeDiff', slug: 'components/codediff' },
          { label: 'Flowchart', slug: 'components/flowchart' },
          { label: 'FileTree', slug: 'components/filetree' },
          { label: 'Sequence', slug: 'components/sequence' },
          { label: 'MindMap', slug: 'components/mindmap' },
          { label: 'Equation', slug: 'components/equation' },
          { label: 'Quiz', slug: 'components/quiz' },
          { label: 'Card', slug: 'components/card' },
          { label: 'Infographic', slug: 'components/infographic' },
          { label: 'Poll', slug: 'components/poll' },
          { label: 'Rating', slug: 'components/rating' },
          { label: 'Ranker', slug: 'components/ranker' },
          { label: 'Slider', slug: 'components/slider' },
          { label: 'Matrix', slug: 'components/matrix' },
          { label: 'Form', slug: 'components/form' },
          { label: 'Kanban', slug: 'components/kanban' },
          { label: 'Annotate', slug: 'components/annotate' },
        ]},
        { label: 'Reference', items: [
          { label: 'IR Spec', slug: 'reference/ir-spec' },
          { label: 'Compiler API', slug: 'reference/compiler-api' },
          { label: 'Runtime API', slug: 'reference/runtime-api' },
          { label: 'Plugin API', slug: 'reference/plugin-api' },
          { label: 'Theming', slug: 'reference/theming' },
          { label: 'Theme Variables', slug: 'reference/theme-variables' },
        ]},
        { label: 'Internals', items: [
          { label: 'Architecture', slug: 'architecture' },
        ]},
        { label: 'Gallery', slug: 'gallery' },
        { label: 'Troubleshooting', slug: 'troubleshooting' },
        { label: 'Changelog', slug: 'changelog' },
        { label: 'Playground', slug: 'playground' },
        { label: 'Storybook', link: '/glyphjs/storybook/', attrs: { target: '_blank' } },
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
