import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Steps } from '../Steps.js';
import type { StepsData } from '../Steps.js';
import { createMockProps } from '../../__tests__/helpers.js';

const stepsData: StepsData = {
  steps: [
    { title: 'Setup', status: 'completed', content: 'Install dependencies' },
    { title: 'Configure', status: 'active', content: 'Edit config files' },
    { title: 'Deploy', status: 'pending', content: 'Push to production' },
  ],
};

describe('Steps', () => {
  it('renders step titles', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('renders step content', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByText('Install dependencies')).toBeInTheDocument();
    expect(screen.getByText('Edit config files')).toBeInTheDocument();
    expect(screen.getByText('Push to production')).toBeInTheDocument();
  });

  it('renders status indicators for completed steps', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    const { container } = render(<Steps {...props} />);

    // Completed step has a checkmark character
    const indicators = container.querySelectorAll('[aria-hidden="true"]');
    const checkmarks = Array.from(indicators).filter(
      (el) => el.textContent === '\u2713',
    );
    expect(checkmarks.length).toBeGreaterThanOrEqual(1);
  });

  it('sets aria-current="step" on the active step', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    const activeStep = screen.getByLabelText(/Configure — Active/);
    expect(activeStep).toHaveAttribute('aria-current', 'step');
  });

  it('does not set aria-current on pending or completed steps', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    const completedStep = screen.getByLabelText(/Setup — Completed/);
    expect(completedStep).not.toHaveAttribute('aria-current');

    const pendingStep = screen.getByLabelText(/Deploy — Pending/);
    expect(pendingStep).not.toHaveAttribute('aria-current');
  });

  it('renders an ordered list with role="list"', () => {
    const props = createMockProps<StepsData>(stepsData, 'ui:steps');
    render(<Steps {...props} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('defaults to pending status when not specified', () => {
    const data: StepsData = {
      steps: [{ title: 'No Status', content: 'Should be pending' }],
    };
    const props = createMockProps<StepsData>(data, 'ui:steps');
    render(<Steps {...props} />);

    const step = screen.getByLabelText(/No Status — Pending/);
    expect(step).toBeInTheDocument();
  });
});
