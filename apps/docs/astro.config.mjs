import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Glyph JS',
      social: { github: 'https://github.com/VledicFranco/glyphjs' },
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
        ]},
        { label: 'Reference', items: [
          { label: 'IR Spec', slug: 'reference/ir-spec' },
          { label: 'Plugin API', slug: 'reference/plugin-api' },
          { label: 'Theming', slug: 'reference/theming' },
        ]},
        { label: 'Gallery', slug: 'gallery' },
        { label: 'Playground', slug: 'playground' },
      ],
    }),
    react(),
  ],
});
