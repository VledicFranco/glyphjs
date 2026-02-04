import type { Meta, StoryObj } from '@storybook/react';
import { CodeDiff } from './CodeDiff.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { CodeDiffData } from './CodeDiff.js';

const meta: Meta<typeof CodeDiff> = {
  component: CodeDiff,
  title: 'Components/CodeDiff',
};

export default meta;
type Story = StoryObj<typeof CodeDiff>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<CodeDiffData>(
    {
      language: 'typescript',
      beforeLabel: 'Before',
      afterLabel: 'After',
      before: `function greet(name) {
  console.log("Hello " + name);
}`,
      after: `function greet(name: string): void {
  console.log(\`Hello \${name}\`);
}`,
    },
    { block: mockBlock({ id: 'codediff-default', type: 'ui:codediff' }) },
  ),
};

// ─── Additions Only ──────────────────────────────────────────

export const AdditionsOnly: Story = {
  args: mockProps<CodeDiffData>(
    {
      language: 'typescript',
      before: `const config = {
  port: 3000,
};`,
      after: `const config = {
  port: 3000,
  host: 'localhost',
  debug: true,
};`,
    },
    { block: mockBlock({ id: 'codediff-additions', type: 'ui:codediff' }) },
  ),
};

// ─── Deletions Only ──────────────────────────────────────────

export const DeletionsOnly: Story = {
  args: mockProps<CodeDiffData>(
    {
      language: 'typescript',
      before: `import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from './Button';`,
      after: `import React from 'react';
import { Button } from './Button';`,
    },
    { block: mockBlock({ id: 'codediff-deletions', type: 'ui:codediff' }) },
  ),
};

// ─── Mixed Changes ───────────────────────────────────────────

export const MixedChanges: Story = {
  args: mockProps<CodeDiffData>(
    {
      language: 'python',
      beforeLabel: 'v1.0',
      afterLabel: 'v2.0',
      before: `def calculate(a, b):
    result = a + b
    print(result)
    return result`,
      after: `def calculate(a: int, b: int) -> int:
    """Add two numbers and return the result."""
    result = a + b
    return result`,
    },
    { block: mockBlock({ id: 'codediff-mixed', type: 'ui:codediff' }) },
  ),
};

// ─── Large File ──────────────────────────────────────────────

export const LargeFile: Story = {
  args: mockProps<CodeDiffData>(
    {
      language: 'json',
      before: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build"
  }
}`,
      after: `{
  "name": "my-app",
  "version": "2.0.0",
  "type": "module",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.7.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`,
    },
    { block: mockBlock({ id: 'codediff-large', type: 'ui:codediff' }) },
  ),
};

// ─── With Language ───────────────────────────────────────────

export const WithLanguage: Story = {
  args: mockProps<CodeDiffData>(
    {
      language: 'bash',
      beforeLabel: 'Old install',
      afterLabel: 'New install',
      before: `npm install react react-dom
npm install --save-dev webpack babel`,
      after: `pnpm install react react-dom
pnpm install --save-dev vite`,
    },
    { block: mockBlock({ id: 'codediff-language', type: 'ui:codediff' }) },
  ),
};
