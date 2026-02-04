import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card.js';
import React from 'react';
import { mockProps, mockBlock, mockContainer } from '../__storybook__/data.js';
import type { CardData } from './Card.js';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Components/Card',
};

export default meta;
type Story = StoryObj<typeof Card>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<CardData>(
    {
      title: 'Getting Started',
      cards: [
        {
          title: 'Installation',
          icon: '📦',
          body: 'Install GlyphJS packages via pnpm and configure your project for ESM modules.',
          actions: [{ label: 'View Guide', url: 'https://example.com/install' }],
        },
        {
          title: 'Configuration',
          icon: '⚙️',
          body: 'Set up the runtime, register components, and configure your theme.',
          actions: [{ label: 'Read Docs', url: 'https://example.com/config' }],
        },
        {
          title: 'Deployment',
          icon: '🚀',
          body: 'Build your app and deploy the static output to any hosting provider.',
          actions: [{ label: 'Deploy Now', url: 'https://example.com/deploy' }],
        },
      ],
    },
    { block: mockBlock({ id: 'card-default', type: 'ui:card' }) },
  ),
};

// ─── Outlined ─────────────────────────────────────────────────

export const Outlined: Story = {
  args: mockProps<CardData>(
    {
      title: 'Features',
      variant: 'outlined',
      cards: [
        {
          title: 'Markdown Parsing',
          icon: '📝',
          body: 'Write content in standard Markdown with embedded UI components.',
        },
        {
          title: 'React Rendering',
          icon: '⚛️',
          body: 'Components are rendered as interactive React elements in the browser.',
        },
        {
          title: 'Theme Support',
          icon: '🎨',
          body: 'Built-in light and dark themes with full CSS custom property support.',
        },
      ],
    },
    { block: mockBlock({ id: 'card-outlined', type: 'ui:card' }) },
  ),
};

// ─── Elevated ─────────────────────────────────────────────────

export const Elevated: Story = {
  args: mockProps<CardData>(
    {
      title: 'Popular Packages',
      variant: 'elevated',
      cards: [
        {
          title: '@glyphjs/compiler',
          subtitle: 'Core compiler',
          body: 'Transforms Markdown into the intermediate representation.',
          actions: [{ label: 'npm', url: 'https://npmjs.com/package/@glyphjs/compiler' }],
        },
        {
          title: '@glyphjs/runtime',
          subtitle: 'React runtime',
          body: 'Renders IR documents as interactive React component trees.',
          actions: [{ label: 'npm', url: 'https://npmjs.com/package/@glyphjs/runtime' }],
        },
      ],
    },
    { block: mockBlock({ id: 'card-elevated', type: 'ui:card' }) },
  ),
};

// ─── SingleCard ───────────────────────────────────────────────

export const SingleCard: Story = {
  args: mockProps<CardData>(
    {
      cards: [
        {
          title: 'Welcome to GlyphJS',
          subtitle: 'A Markdown-to-UI rendering engine',
          body: 'GlyphJS compiles enhanced Markdown with embedded YAML data blocks into interactive React components.',
          actions: [
            { label: 'Get Started', url: 'https://example.com/start' },
            { label: 'GitHub', url: 'https://github.com/example/glyphjs' },
          ],
        },
      ],
      columns: 1,
    },
    { block: mockBlock({ id: 'card-single', type: 'ui:card' }) },
  ),
};

// ─── WithImages ───────────────────────────────────────────────

export const WithImages: Story = {
  args: mockProps<CardData>(
    {
      title: 'Gallery',
      columns: 2,
      cards: [
        {
          title: 'Mountain Vista',
          image: 'https://picsum.photos/seed/mountain/600/338',
          body: 'A stunning mountain landscape captured at golden hour.',
        },
        {
          title: 'Ocean Sunset',
          image: 'https://picsum.photos/seed/ocean/600/338',
          body: 'Waves crashing against the shore under a vibrant sunset sky.',
        },
      ],
    },
    { block: mockBlock({ id: 'card-images', type: 'ui:card' }) },
  ),
};

// ─── NoActions ────────────────────────────────────────────────

export const NoActions: Story = {
  args: mockProps<CardData>(
    {
      title: 'Quick Facts',
      columns: 4,
      cards: [
        { title: 'TypeScript', icon: '🔷', body: 'Strict mode with no any types.' },
        { title: 'ESM Only', icon: '📦', body: 'All imports use .js extensions.' },
        { title: 'Theming', icon: '🎨', body: 'CSS custom properties for styling.' },
        { title: 'Testing', icon: '🧪', body: 'Vitest + Playwright test suite.' },
      ],
    },
    { block: mockBlock({ id: 'card-no-actions', type: 'ui:card' }) },
  ),
};

// ─── Compact ────────────────────────────────────────────────

export const Compact: Story = {
  args: mockProps<CardData>(
    {
      title: 'Getting Started',
      cards: [
        {
          title: 'Installation',
          icon: '📦',
          body: 'Install GlyphJS packages via pnpm and configure your project for ESM modules.',
          actions: [{ label: 'View Guide', url: 'https://example.com/install' }],
        },
        {
          title: 'Configuration',
          icon: '⚙️',
          body: 'Set up the runtime, register components, and configure your theme.',
          actions: [{ label: 'Read Docs', url: 'https://example.com/config' }],
        },
        {
          title: 'Deployment',
          icon: '🚀',
          body: 'Build your app and deploy the static output to any hosting provider.',
          actions: [{ label: 'Deploy Now', url: 'https://example.com/deploy' }],
        },
      ],
    },
    {
      block: mockBlock({ id: 'card-compact', type: 'ui:card' }),
      container: mockContainer({ tier: 'compact', width: 400 }),
    },
  ),
  decorators: [
    (Story) =>
      React.createElement('div', { style: { maxWidth: '400px' } }, React.createElement(Story)),
  ],
};
