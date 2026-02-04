import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileTree } from '../FileTree.js';
import type { FileTreeData } from '../FileTree.js';
import { createMockProps } from '../../__tests__/helpers.js';

const treeData: FileTreeData = {
  root: 'my-project',
  tree: [
    {
      name: 'src',
      children: [
        { name: 'index.ts', annotation: 'entry point' },
        {
          name: 'utils',
          children: [{ name: 'helpers.ts' }],
        },
      ],
    },
    { name: 'package.json' },
    { name: 'README.md' },
  ],
  defaultExpanded: true,
};

describe('FileTree', () => {
  it('renders with role="tree"', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders flat file names', () => {
    const flatData: FileTreeData = {
      tree: [{ name: 'file1.ts' }, { name: 'file2.ts' }],
      defaultExpanded: true,
    };
    const props = createMockProps<FileTreeData>(flatData, 'ui:filetree');
    render(<FileTree {...props} />);
    expect(screen.getByText('file1.ts')).toBeInTheDocument();
    expect(screen.getByText('file2.ts')).toBeInTheDocument();
  });

  it('renders nested directories', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('helpers.ts')).toBeInTheDocument();
  });

  it('renders annotations', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    expect(screen.getByText('entry point')).toBeInTheDocument();
  });

  it('renders root label', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    expect(screen.getByText('my-project')).toBeInTheDocument();
  });

  it('has treeitem roles', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    const items = screen.getAllByRole('treeitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('directories have aria-expanded', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    const items = screen.getAllByRole('treeitem');
    const dirItems = items.filter((item) => item.getAttribute('aria-expanded') !== null);
    expect(dirItems.length).toBeGreaterThanOrEqual(1);
  });

  it('toggles directory on click', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    // Initially expanded
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    // Click on "src" directory item
    const srcItem = screen.getByText('src').closest('li');
    if (srcItem) {
      fireEvent.click(srcItem);
    }
    // After clicking, it should collapse — children should not be visible
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });

  it('starts collapsed when defaultExpanded is false', () => {
    const collapsedData: FileTreeData = {
      tree: [
        {
          name: 'src',
          children: [{ name: 'main.ts' }],
        },
      ],
      defaultExpanded: false,
    };
    const props = createMockProps<FileTreeData>(collapsedData, 'ui:filetree');
    render(<FileTree {...props} />);
    // The child should not be visible
    expect(screen.queryByText('main.ts')).not.toBeInTheDocument();
  });

  it('includes annotation in aria-label', () => {
    const props = createMockProps<FileTreeData>(treeData, 'ui:filetree');
    render(<FileTree {...props} />);
    const items = screen.getAllByRole('treeitem');
    const annotated = items.find(
      (item) => item.getAttribute('aria-label') === 'index.ts, entry point',
    );
    expect(annotated).toBeTruthy();
  });
});
