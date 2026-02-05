import type { Meta, StoryObj } from '@storybook/react';
import { Annotate } from './Annotate.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { AnnotateData } from './Annotate.js';

const meta: Meta<typeof Annotate> = {
  component: Annotate,
  title: 'Components/Annotate',
};

export default meta;
type Story = StoryObj<typeof Annotate>;

export const Default: Story = {
  args: mockProps<AnnotateData>(
    {
      title: 'Code Review',
      labels: [
        { name: 'Bug', color: '#dc2626' },
        { name: 'Unclear', color: '#f59e0b' },
        { name: 'Good', color: '#16a34a' },
      ],
      text: 'function processData(input) {\n  var result = input.split(",");\n  eval(result[0]);\n  return result;\n}',
      annotations: [{ start: 62, end: 78, label: 'Bug', note: 'eval() is dangerous' }],
    },
    { block: mockBlock({ id: 'annotate-default', type: 'ui:annotate' }) },
  ),
};

export const ProseText: Story = {
  args: mockProps<AnnotateData>(
    {
      title: 'Document Review',
      labels: [
        { name: 'Important', color: '#3b82f6' },
        { name: 'Question', color: '#f59e0b' },
        { name: 'Agreed', color: '#16a34a' },
      ],
      text: 'The system shall process all incoming requests within 200ms. Authentication tokens expire after 24 hours. Rate limiting is applied at 100 requests per minute per user. All data is encrypted at rest using AES-256.',
      annotations: [{ start: 0, end: 55, label: 'Important' }],
    },
    { block: mockBlock({ id: 'annotate-prose', type: 'ui:annotate' }) },
  ),
};

export const NoAnnotations: Story = {
  args: mockProps<AnnotateData>(
    {
      title: 'Fresh Document',
      labels: [
        { name: 'Highlight', color: '#3b82f6' },
        { name: 'Note', color: '#f59e0b' },
      ],
      text: 'Select any text in this area and choose a label to create an annotation. Annotations help you mark important sections of text for review and discussion.',
    },
    { block: mockBlock({ id: 'annotate-empty', type: 'ui:annotate' }) },
  ),
};
