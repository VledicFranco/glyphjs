import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tabs } from '../Tabs.js';
import type { TabsData } from '../Tabs.js';
import { createMockProps } from '../../__tests__/helpers.js';
import type { InlineNode } from '@glyphjs/types';

const tabsData: TabsData = {
  tabs: [
    { label: 'First', content: 'First tab content' },
    { label: 'Second', content: 'Second tab content' },
    { label: 'Third', content: 'Third tab content' },
  ],
};

describe('Tabs', () => {
  it('renders tab labels', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('shows first tab content by default', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    expect(screen.getByText('First tab content')).toBeVisible();
  });

  it('switches content when clicking a tab', async () => {
    const user = userEvent.setup();
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    // Initially first tab content is visible
    expect(screen.getByText('First tab content')).toBeVisible();

    // Click second tab
    await user.click(screen.getByText('Second'));

    // Second tab content should be visible now
    expect(screen.getByText('Second tab content')).toBeVisible();
  });

  it('has role="tablist" container', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('has role="tab" on each tab button', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
  });

  it('has role="tabpanel" on panels', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels.length).toBeGreaterThan(0);
  });

  it('sets aria-selected on the active tab', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('has aria-controls linking tabs to panels', () => {
    const props = createMockProps<TabsData>(tabsData, 'ui:tabs');
    render(<Tabs {...props} />);

    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      const controlsId = tab.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      expect(document.getElementById(controlsId!)).toBeInTheDocument();
    }
  });

  describe('Markdown support', () => {
    it('renders InlineNode[] in tab labels', () => {
      const data: TabsData = {
        tabs: [
          {
            label: [
              { type: 'text', value: 'Tab with ' },
              {
                type: 'strong',
                children: [{ type: 'text', value: 'bold' }],
              },
            ] as InlineNode[],
            content: 'Content',
          },
        ],
        markdown: true,
      };
      const props = createMockProps<TabsData>(data, 'ui:tabs');
      render(<Tabs {...props} />);

      const strong = screen.getByText('bold');
      expect(strong.tagName).toBe('STRONG');
    });

    it('renders InlineNode[] in tab content', () => {
      const data: TabsData = {
        tabs: [
          {
            label: 'Tab',
            content: [
              { type: 'text', value: 'Content with ' },
              {
                type: 'emphasis',
                children: [{ type: 'text', value: 'italic' }],
              },
              { type: 'text', value: ' and ' },
              { type: 'inlineCode', value: 'code' },
            ] as InlineNode[],
          },
        ],
        markdown: true,
      };
      const props = createMockProps<TabsData>(data, 'ui:tabs');
      render(<Tabs {...props} />);

      const em = screen.getByText('italic');
      expect(em.tagName).toBe('EM');

      const code = screen.getByText('code');
      expect(code.tagName).toBe('CODE');
    });

    it('renders links in tab content', () => {
      const data: TabsData = {
        tabs: [
          {
            label: 'Tab',
            content: [
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', value: 'Click here' }],
              },
            ] as InlineNode[],
          },
        ],
        markdown: true,
      };
      const props = createMockProps<TabsData>(data, 'ui:tabs');
      render(<Tabs {...props} />);

      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });
});
