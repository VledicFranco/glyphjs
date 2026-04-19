import type { Meta, StoryObj } from '@storybook/react';
import { DecisionTree } from './DecisionTree.js';
import type { DecisionTreeData } from './DecisionTree.js';
import { mockProps } from '../__storybook__/data.js';

const meta: Meta<typeof DecisionTree> = {
  title: 'Components/DecisionTree',
  component: DecisionTree,
};
export default meta;

type Story = StoryObj<typeof DecisionTree>;

// ─── Default: action routing logic ─────────────────────────

export const Default: Story = {
  args: mockProps<DecisionTreeData>({
    title: 'Action routing',
    nodes: [
      { id: 'root', type: 'question', label: 'User tier?' },
      { id: 'free', type: 'question', label: 'Over free limit?' },
      { id: 'paid', type: 'outcome', label: 'Allow unlimited', sentiment: 'positive' },
      { id: 'upgrade', type: 'outcome', label: 'Show upgrade prompt', sentiment: 'neutral' },
      { id: 'allow', type: 'outcome', label: 'Allow request', sentiment: 'positive' },
    ],
    edges: [
      { from: 'root', to: 'free', condition: 'free' },
      { from: 'root', to: 'paid', condition: 'paid' },
      { from: 'free', to: 'upgrade', condition: 'yes' },
      { from: 'free', to: 'allow', condition: 'no' },
    ],
    orientation: 'left-right',
  }),
};

// ─── Reasoning trace with confidence badges ────────────────

export const ReasoningTrace: Story = {
  args: mockProps<DecisionTreeData>({
    title: 'LLM routing reasoning',
    nodes: [
      { id: 'intent', type: 'question', label: 'Detect intent', confidence: 0.92 },
      { id: 'lookup', type: 'question', label: 'Known entity?', confidence: 0.84 },
      {
        id: 'search',
        type: 'outcome',
        label: 'Run vector search',
        sentiment: 'positive',
        confidence: 0.78,
      },
      {
        id: 'clarify',
        type: 'outcome',
        label: 'Ask for clarification',
        sentiment: 'neutral',
        confidence: 0.65,
      },
      {
        id: 'reject',
        type: 'outcome',
        label: 'Refuse (out of scope)',
        sentiment: 'negative',
        confidence: 0.55,
      },
    ],
    edges: [
      { from: 'intent', to: 'lookup', condition: 'query' },
      { from: 'intent', to: 'reject', condition: 'unsupported' },
      { from: 'lookup', to: 'search', condition: 'yes' },
      { from: 'lookup', to: 'clarify', condition: 'no' },
    ],
    orientation: 'left-right',
  }),
};

// ─── Top-down orientation ──────────────────────────────────

export const TopDown: Story = {
  args: mockProps<DecisionTreeData>({
    title: 'Deploy gate',
    nodes: [
      { id: 'start', type: 'question', label: 'PR merged?' },
      { id: 'tests', type: 'question', label: 'Tests green?' },
      { id: 'size', type: 'question', label: 'Bundle under budget?' },
      { id: 'deploy', type: 'outcome', label: 'Auto-deploy', sentiment: 'positive' },
      { id: 'review', type: 'outcome', label: 'Request review', sentiment: 'neutral' },
      { id: 'block', type: 'outcome', label: 'Block deploy', sentiment: 'negative' },
    ],
    edges: [
      { from: 'start', to: 'tests', condition: 'yes' },
      { from: 'start', to: 'review', condition: 'no' },
      { from: 'tests', to: 'size', condition: 'pass' },
      { from: 'tests', to: 'block', condition: 'fail' },
      { from: 'size', to: 'deploy', condition: 'ok' },
      { from: 'size', to: 'review', condition: 'over' },
    ],
    orientation: 'top-down',
  }),
};

// ─── Deep policy documentation (4+ levels) ─────────────────

export const PolicyDocumentation: Story = {
  args: mockProps<DecisionTreeData>({
    title: 'Refund policy',
    nodes: [
      { id: 'q1', type: 'question', label: 'Purchase within 30 days?' },
      { id: 'q2', type: 'question', label: 'Item opened?' },
      { id: 'q3', type: 'question', label: 'Defective?' },
      { id: 'q4', type: 'question', label: 'Proof attached?' },
      { id: 'full', type: 'outcome', label: 'Full refund', sentiment: 'positive' },
      { id: 'partial', type: 'outcome', label: 'Partial refund (15%)', sentiment: 'neutral' },
      { id: 'replace', type: 'outcome', label: 'Replacement only', sentiment: 'neutral' },
      { id: 'followup', type: 'outcome', label: 'Open manual review', sentiment: 'neutral' },
      { id: 'deny', type: 'outcome', label: 'Deny request', sentiment: 'negative' },
      { id: 'too-late', type: 'outcome', label: 'Out of window', sentiment: 'negative' },
    ],
    edges: [
      { from: 'q1', to: 'q2', condition: 'yes' },
      { from: 'q1', to: 'too-late', condition: 'no' },
      { from: 'q2', to: 'full', condition: 'no' },
      { from: 'q2', to: 'q3', condition: 'yes' },
      { from: 'q3', to: 'q4', condition: 'yes' },
      { from: 'q3', to: 'partial', condition: 'no' },
      { from: 'q4', to: 'replace', condition: 'yes' },
      { from: 'q4', to: 'followup', condition: 'partial' },
      { from: 'q4', to: 'deny', condition: 'no' },
    ],
    orientation: 'left-right',
  }),
};

// ─── Trivial tree ──────────────────────────────────────────

export const SingleOutcome: Story = {
  args: mockProps<DecisionTreeData>({
    nodes: [
      { id: 'root', type: 'question', label: 'Ready to ship?' },
      { id: 'yes', type: 'outcome', label: 'Ship it', sentiment: 'positive' },
    ],
    edges: [{ from: 'root', to: 'yes', condition: 'yes' }],
  }),
};
