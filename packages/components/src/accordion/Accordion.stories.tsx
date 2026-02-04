import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { AccordionData } from './Accordion.js';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: 'Components/Accordion',
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<AccordionData>(
    {
      title: 'Frequently Asked Questions',
      sections: [
        {
          title: 'What is GlyphJS?',
          content:
            'GlyphJS is a Markdown-to-interactive-UI rendering engine. It compiles enhanced Markdown into React components.',
        },
        {
          title: 'How does theming work?',
          content:
            'All components use CSS custom properties. Set variables on a wrapper element to change the theme.',
        },
        {
          title: 'Can I create custom components?',
          content:
            'Yes. Create a Zod schema, a React component, and register it with the runtime via registerComponent().',
        },
      ],
      defaultOpen: [0],
    },
    { block: mockBlock({ id: 'accordion-default', type: 'ui:accordion' }) },
  ),
};

// ─── Single Section ───────────────────────────────────────────

export const SingleSection: Story = {
  args: mockProps<AccordionData>(
    {
      sections: [
        {
          title: 'Click to expand',
          content: 'This is the only section in the accordion.',
        },
      ],
      defaultOpen: [0],
    },
    { block: mockBlock({ id: 'accordion-single', type: 'ui:accordion' }) },
  ),
};

// ─── Exclusive Mode ───────────────────────────────────────────

export const ExclusiveMode: Story = {
  args: mockProps<AccordionData>(
    {
      title: 'Exclusive Accordion',
      sections: [
        { title: 'Panel One', content: 'Only one panel can be open at a time.' },
        { title: 'Panel Two', content: 'Opening this panel closes Panel One.' },
        { title: 'Panel Three', content: 'Opening this panel closes all others.' },
      ],
      multiple: false,
      defaultOpen: [0],
    },
    { block: mockBlock({ id: 'accordion-exclusive', type: 'ui:accordion' }) },
  ),
};

// ─── All Open ─────────────────────────────────────────────────

export const AllOpen: Story = {
  args: mockProps<AccordionData>(
    {
      title: 'All Sections Open',
      sections: [
        { title: 'First', content: 'All sections start expanded.' },
        { title: 'Second', content: 'Users can collapse any section.' },
        { title: 'Third', content: 'Multiple sections can remain open simultaneously.' },
      ],
      defaultOpen: [0, 1, 2],
    },
    { block: mockBlock({ id: 'accordion-all-open', type: 'ui:accordion' }) },
  ),
};

// ─── Long Content ─────────────────────────────────────────────

export const LongContent: Story = {
  args: mockProps<AccordionData>(
    {
      title: 'Detailed Documentation',
      sections: [
        {
          title: 'Installation Guide',
          content:
            'To install GlyphJS, run pnpm install @glyphjs/runtime @glyphjs/compiler @glyphjs/components in your project directory. Make sure you have Node.js 18 or later installed. The packages use ESM modules exclusively, so ensure your project is configured for ESM (set "type": "module" in package.json). After installation, import the runtime and register components before rendering.',
        },
        {
          title: 'Configuration Options',
          content:
            'GlyphJS can be configured through the createGlyphRuntime() function. You can specify a theme (light, dark, or a custom GlyphTheme object), register component definitions, and configure layout hints. The runtime exposes a GlyphDocument component that accepts compiled IR and renders the full document. Theme variables can be overridden at any level using CSS custom properties.',
        },
        {
          title: 'Troubleshooting',
          content:
            'If components are not rendering, check that: (1) the component definition is registered with the runtime, (2) the schema name matches the ui: prefix in your markdown, (3) the YAML data validates against the Zod schema, and (4) the runtime is created before rendering GlyphDocument. Check the browser console for diagnostics — the compiler emits warnings for unknown component types and validation errors.',
        },
      ],
      defaultOpen: [0],
    },
    { block: mockBlock({ id: 'accordion-long', type: 'ui:accordion' }) },
  ),
};
