import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sequence } from '../Sequence.js';
import type { SequenceData } from '../Sequence.js';
import { createMockProps } from '../../__tests__/helpers.js';

const sequenceData: SequenceData = {
  title: 'Auth Flow',
  actors: [
    { id: 'client', label: 'Client' },
    { id: 'api', label: 'Auth API' },
    { id: 'db', label: 'Database' },
  ],
  messages: [
    { from: 'client', to: 'api', label: 'POST /login', type: 'message' },
    { from: 'api', to: 'db', label: 'Query user', type: 'message' },
    { from: 'db', to: 'api', label: 'User record', type: 'reply' },
    { from: 'api', to: 'api', label: 'Verify password', type: 'self' },
    { from: 'api', to: 'client', label: 'JWT token', type: 'reply' },
  ],
};

describe('Sequence', () => {
  it('renders an SVG element', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    const { container } = render(<Sequence {...props} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has role="img" on the SVG', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('includes title in aria-label', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      'Auth Flow: sequence diagram with 3 actors and 5 messages',
    );
  });

  it('renders actor labels', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    // Actors appear twice (top + bottom boxes)
    expect(screen.getAllByText('Client').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Auth API').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Database').length).toBeGreaterThanOrEqual(2);
  });

  it('renders message labels', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    // Labels appear in both SVG and accessible table
    expect(screen.getAllByText('POST /login').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Query user').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('User record').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Verify password').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('JWT token').length).toBeGreaterThanOrEqual(1);
  });

  it('renders hidden accessible table', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    const table = screen.getByRole('table', { name: 'Sequence data' });
    expect(table).toBeInTheDocument();
  });

  it('lists messages in accessible table', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    // Each message type appears in the table
    const cells = screen.getAllByText('message');
    expect(cells.length).toBeGreaterThanOrEqual(2);
    const replyCells = screen.getAllByText('reply');
    expect(replyCells.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('self').length).toBeGreaterThanOrEqual(1);
  });

  it('renders title text when provided', () => {
    const props = createMockProps<SequenceData>(sequenceData, 'ui:sequence');
    render(<Sequence {...props} />);
    expect(screen.getByText('Auth Flow')).toBeInTheDocument();
  });
});
