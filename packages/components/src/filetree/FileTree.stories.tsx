import type { Meta, StoryObj } from '@storybook/react';
import { FileTree } from './FileTree.js';
import type { FileTreeData } from './FileTree.js';
import { mockProps } from '../__storybook__/data.js';

const meta: Meta<typeof FileTree> = {
  title: 'Components/FileTree',
  component: FileTree,
};
export default meta;

type Story = StoryObj<typeof FileTree>;

export const Default: Story = {
  args: mockProps<FileTreeData>({
    root: 'my-project',
    defaultExpanded: true,
    tree: [
      {
        name: 'src',
        children: [
          { name: 'index.ts', annotation: 'entry point' },
          {
            name: 'components',
            children: [{ name: 'App.tsx' }, { name: 'Header.tsx', annotation: 'new' }],
          },
          { name: 'styles.css' },
        ],
      },
      { name: 'package.json' },
      { name: 'tsconfig.json' },
      { name: 'README.md' },
    ],
  }),
};

export const FlatFiles: Story = {
  args: mockProps<FileTreeData>({
    defaultExpanded: true,
    tree: [
      { name: 'index.html' },
      { name: 'style.css' },
      { name: 'script.js' },
      { name: 'README.md' },
    ],
  }),
};

export const DeepNesting: Story = {
  args: mockProps<FileTreeData>({
    root: 'deep-project',
    defaultExpanded: true,
    tree: [
      {
        name: 'src',
        children: [
          {
            name: 'features',
            children: [
              {
                name: 'auth',
                children: [
                  {
                    name: 'providers',
                    children: [{ name: 'oauth.ts' }, { name: 'jwt.ts' }],
                  },
                  { name: 'middleware.ts' },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
};

export const WithAnnotations: Story = {
  args: mockProps<FileTreeData>({
    root: 'app',
    defaultExpanded: true,
    tree: [
      {
        name: 'src',
        children: [
          { name: 'api.ts', annotation: 'modified' },
          { name: 'auth.ts', annotation: 'new' },
          { name: 'db.ts' },
          { name: 'config.ts', annotation: 'deprecated' },
        ],
      },
      { name: 'package.json', annotation: 'updated' },
    ],
  }),
};

export const CollapsedByDefault: Story = {
  args: mockProps<FileTreeData>({
    root: 'project',
    defaultExpanded: false,
    tree: [
      {
        name: 'src',
        children: [{ name: 'index.ts' }, { name: 'utils.ts' }],
      },
      {
        name: 'tests',
        children: [{ name: 'index.test.ts' }],
      },
      { name: 'package.json' },
    ],
  }),
};
