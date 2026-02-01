import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tabs } from '../Tabs.js';
import type { TabsData } from '../Tabs.js';
import { createMockProps } from '../../__tests__/helpers.js';

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
});
