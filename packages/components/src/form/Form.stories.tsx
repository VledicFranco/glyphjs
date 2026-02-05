import type { Meta, StoryObj } from '@storybook/react';
import { Form } from './Form.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { FormData } from './Form.js';

const meta: Meta<typeof Form> = {
  component: Form,
  title: 'Components/Form',
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  args: mockProps<FormData>(
    {
      title: 'Project Setup',
      description: 'Tell us about your project',
      submitLabel: 'Create Project',
      fields: [
        { type: 'text', id: 'name', label: 'Project Name', required: true },
        {
          type: 'select',
          id: 'framework',
          label: 'Framework',
          options: ['React', 'Vue', 'Angular'],
        },
        { type: 'range', id: 'budget', label: 'Budget', min: 0, max: 50000, step: 1000, unit: '$' },
        { type: 'checkbox', id: 'typescript', label: 'Use TypeScript', default: true },
        { type: 'textarea', id: 'description', label: 'Description', rows: 4 },
      ],
    },
    { block: mockBlock({ id: 'form-default', type: 'ui:form' }) },
  ),
};

export const ContactForm: Story = {
  args: mockProps<FormData>(
    {
      title: 'Contact Us',
      fields: [
        {
          type: 'text',
          id: 'email',
          label: 'Email',
          required: true,
          placeholder: 'you@example.com',
        },
        { type: 'text', id: 'subject', label: 'Subject', required: true },
        { type: 'textarea', id: 'message', label: 'Message', required: true, rows: 6 },
      ],
    },
    { block: mockBlock({ id: 'form-contact', type: 'ui:form' }) },
  ),
};

export const Minimal: Story = {
  args: mockProps<FormData>(
    {
      fields: [{ type: 'text', id: 'search', label: 'Search query' }],
      submitLabel: 'Search',
    },
    { block: mockBlock({ id: 'form-minimal', type: 'ui:form' }) },
  ),
};
