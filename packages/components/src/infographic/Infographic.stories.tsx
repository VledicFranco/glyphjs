import type { Meta, StoryObj } from '@storybook/react';
import { Infographic } from './Infographic.js';
import { mockProps, mockBlock } from '../__storybook__/data.js';
import type { InfographicData } from './Infographic.js';

const meta: Meta<typeof Infographic> = {
  component: Infographic,
  title: 'Components/Infographic',
};

export default meta;
type Story = StoryObj<typeof Infographic>;

// ─── Default ──────────────────────────────────────────────────

export const Default: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Company Overview',
      sections: [
        {
          heading: 'Key Metrics',
          items: [
            { type: 'stat', label: 'Revenue', value: '$12.5M' },
            { type: 'stat', label: 'Customers', value: '2,340' },
            { type: 'stat', label: 'Growth', value: '+28%' },
          ],
        },
        {
          heading: 'Goals Progress',
          items: [
            { type: 'progress', label: 'Q4 Target', value: 78 },
            { type: 'progress', label: 'Customer Satisfaction', value: 92 },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-default', type: 'ui:infographic' }) },
  ),
};

// ─── StatsOnly ────────────────────────────────────────────────

export const StatsOnly: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Performance Snapshot',
      sections: [
        {
          items: [
            { type: 'stat', label: 'Uptime', value: '99.97%', description: 'Last 30 days' },
            { type: 'stat', label: 'Response Time', value: '45ms', description: 'p95 latency' },
            { type: 'stat', label: 'Throughput', value: '1.2M', description: 'Requests/day' },
            { type: 'stat', label: 'Error Rate', value: '0.02%', description: 'Last 24 hours' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-stats', type: 'ui:infographic' }) },
  ),
};

// ─── ProgressBars ─────────────────────────────────────────────

export const ProgressBars: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Sprint Progress',
      sections: [
        {
          items: [
            { type: 'progress', label: 'Development', value: 85 },
            { type: 'progress', label: 'Testing', value: 62 },
            { type: 'progress', label: 'Documentation', value: 40 },
            { type: 'progress', label: 'Deployment', value: 15 },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-progress', type: 'ui:infographic' }) },
  ),
};

// ─── MixedItems ───────────────────────────────────────────────

export const MixedItems: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Project Report',
      sections: [
        {
          items: [
            {
              type: 'text',
              content: 'The Q4 results exceeded expectations across all key metrics.',
            },
            { type: 'stat', label: 'Revenue', value: '$8.2M' },
            { type: 'stat', label: 'Profit', value: '$2.1M' },
            { type: 'progress', label: 'Annual Target', value: 91 },
            { type: 'fact', text: 'Largest quarter in company history' },
            { type: 'fact', text: 'Customer base grew 34% year-over-year' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-mixed', type: 'ui:infographic' }) },
  ),
};

// ─── MultipleSections ─────────────────────────────────────────

export const MultipleSections: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Quarterly Review',
      sections: [
        {
          heading: 'Financial',
          items: [
            { type: 'stat', label: 'Revenue', value: '$5.4M' },
            { type: 'stat', label: 'Expenses', value: '$3.1M' },
            { type: 'stat', label: 'Net Profit', value: '$2.3M' },
          ],
        },
        {
          heading: 'Engineering',
          items: [
            { type: 'progress', label: 'Sprint Velocity', value: 88 },
            { type: 'progress', label: 'Code Coverage', value: 76 },
            { type: 'fact', text: 'Deployed 142 features this quarter' },
          ],
        },
        {
          heading: 'Customer Success',
          items: [
            { type: 'stat', label: 'NPS Score', value: '72' },
            { type: 'stat', label: 'Churn Rate', value: '1.8%' },
            {
              type: 'text',
              content:
                'Customer satisfaction improved significantly after launching the new onboarding flow.',
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-multi', type: 'ui:infographic' }) },
  ),
};

// ─── WithIcons ────────────────────────────────────────────────

// ─── PieChart ────────────────────────────────────────────────

export const PieChart: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Budget & Languages',
      sections: [
        {
          heading: 'Budget Allocation',
          items: [
            {
              type: 'pie',
              label: 'Q4 Budget',
              slices: [
                { label: 'Engineering', value: 45 },
                { label: 'Marketing', value: 25 },
                { label: 'Sales', value: 20 },
                { label: 'Operations', value: 10 },
              ],
            },
            {
              type: 'pie',
              label: 'Language Breakdown',
              donut: false,
              slices: [
                { label: 'TypeScript', value: 60 },
                { label: 'Python', value: 25 },
                { label: 'Go', value: 15 },
              ],
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-pie', type: 'ui:infographic' }) },
  ),
};

// ─── Dividers ────────────────────────────────────────────────

export const Dividers: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Metrics with Dividers',
      sections: [
        {
          items: [
            { type: 'stat', label: 'Revenue', value: '$4.2M' },
            { type: 'stat', label: 'Profit', value: '$1.8M' },
            { type: 'divider' },
            { type: 'progress', label: 'Q4 Target', value: 82 },
            { type: 'divider', style: 'dashed' },
            { type: 'fact', icon: '\u2713', text: 'On track to exceed annual goal' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-dividers', type: 'ui:infographic' }) },
  ),
};

// ─── Ratings ─────────────────────────────────────────────────

export const Ratings: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Customer Satisfaction',
      sections: [
        {
          heading: 'Ratings',
          items: [
            {
              type: 'rating',
              label: 'Overall Experience',
              value: 4.5,
              description: 'Based on 1,240 reviews',
            },
            {
              type: 'rating',
              label: 'Customer Service',
              value: 4,
              description: '98% resolution rate',
            },
            {
              type: 'rating',
              label: 'Value for Money',
              value: 3.5,
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-ratings', type: 'ui:infographic' }) },
  ),
};

// ─── PieCustomColors ─────────────────────────────────────────

export const PieCustomColors: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Revenue by Region',
      sections: [
        {
          items: [
            {
              type: 'pie',
              label: 'Global Revenue',
              size: 200,
              slices: [
                { label: 'North America', value: 42, color: '#6366f1' },
                { label: 'Europe', value: 28, color: '#06b6d4' },
                { label: 'Asia Pacific', value: 18, color: '#f43f5e' },
                { label: 'Latin America', value: 8, color: '#84cc16' },
                { label: 'Middle East & Africa', value: 4, color: '#f97316' },
              ],
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-pie-colors', type: 'ui:infographic' }) },
  ),
};

// ─── PieSolid ────────────────────────────────────────────────

export const PieSolid: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Donut vs. Solid Pie',
      sections: [
        {
          heading: 'Donut (default)',
          items: [
            {
              type: 'pie',
              label: 'Market Share',
              slices: [
                { label: 'Us', value: 35 },
                { label: 'Competitor A', value: 30 },
                { label: 'Competitor B', value: 20 },
                { label: 'Others', value: 15 },
              ],
            },
          ],
        },
        {
          heading: 'Solid pie (donut: false)',
          items: [
            {
              type: 'pie',
              label: 'Market Share',
              donut: false,
              slices: [
                { label: 'Us', value: 35 },
                { label: 'Competitor A', value: 30 },
                { label: 'Competitor B', value: 20 },
                { label: 'Others', value: 15 },
              ],
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-pie-solid', type: 'ui:infographic' }) },
  ),
};

// ─── DividerStyles ───────────────────────────────────────────

export const DividerStyles: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Divider Style Showcase',
      sections: [
        {
          items: [
            { type: 'text', content: 'Content above a solid divider (default).' },
            { type: 'divider' },
            { type: 'text', content: 'Content between solid and dashed dividers.' },
            { type: 'divider', style: 'dashed' },
            { type: 'text', content: 'Content between dashed and dotted dividers.' },
            { type: 'divider', style: 'dotted' },
            { type: 'text', content: 'Content below a dotted divider.' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-divider-styles', type: 'ui:infographic' }) },
  ),
};

// ─── RatingsDetailed ─────────────────────────────────────────

export const RatingsDetailed: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Restaurant Reviews',
      sections: [
        {
          heading: 'Reviewer Scores',
          items: [
            {
              type: 'rating',
              label: 'Food Quality',
              value: 5,
              description: 'Exceptional seasonal menu',
            },
            { type: 'rating', label: 'Ambiance', value: 4.5, description: 'Cozy and well-lit' },
            { type: 'rating', label: 'Service', value: 4, description: 'Attentive staff' },
            { type: 'rating', label: 'Wait Time', value: 2.5, description: 'Busy weekends' },
            { type: 'rating', label: 'Value', value: 3, description: 'Mid-range pricing' },
          ],
        },
        {
          heading: 'Quick Score (3-star scale)',
          items: [
            { type: 'rating', label: 'Would Visit Again', value: 3, max: 3 },
            { type: 'rating', label: 'Recommend to Friend', value: 2.5, max: 3 },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-ratings-detail', type: 'ui:infographic' }) },
  ),
};

// ─── FullDashboard ───────────────────────────────────────────

export const FullDashboard: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'SaaS Product Dashboard — Q4 2025',
      sections: [
        {
          heading: 'Key Metrics',
          items: [
            { type: 'stat', label: 'MRR', value: '$842K', description: '+12% MoM' },
            {
              type: 'stat',
              label: 'Active Users',
              value: '24,800',
              description: '+3,200 this month',
            },
            { type: 'stat', label: 'Churn', value: '1.4%', description: 'Down from 2.1%' },
          ],
        },
        {
          heading: 'Customer Satisfaction',
          items: [
            { type: 'rating', label: 'NPS Score', value: 4.5, description: 'Promoters: 72%' },
            {
              type: 'rating',
              label: 'Support Rating',
              value: 4,
              description: 'Avg. resolution: 2.4 hrs',
            },
            { type: 'divider' },
            { type: 'fact', icon: '\u2713', text: 'CSAT improved 8 points since Q3' },
            { type: 'fact', icon: '\u2713', text: 'First response time under 15 minutes' },
          ],
        },
        {
          heading: 'Revenue Breakdown',
          items: [
            {
              type: 'pie',
              label: 'By Plan',
              slices: [
                { label: 'Enterprise', value: 55 },
                { label: 'Business', value: 30 },
                { label: 'Starter', value: 12 },
                { label: 'Free Trial', value: 3 },
              ],
            },
            {
              type: 'pie',
              label: 'By Region',
              slices: [
                { label: 'Americas', value: 48 },
                { label: 'EMEA', value: 32 },
                { label: 'APAC', value: 20 },
              ],
            },
          ],
        },
        {
          heading: 'OKR Progress',
          items: [
            { type: 'progress', label: 'Reach $1M MRR', value: 84 },
            { type: 'progress', label: 'Ship V2 Platform', value: 92 },
            { type: 'progress', label: 'Expand to 3 New Markets', value: 67 },
            { type: 'progress', label: 'Reduce P95 Latency <100ms', value: 45 },
            { type: 'divider', style: 'dashed' },
            {
              type: 'text',
              content:
                'Overall OKR attainment is on track. The latency goal requires additional infrastructure investment planned for January.',
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-dashboard', type: 'ui:infographic' }) },
  ),
};

// ─── PieWithStats ────────────────────────────────────────────

export const PieWithStats: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Cloud Spend Analysis',
      sections: [
        {
          items: [
            { type: 'stat', label: 'Total Monthly Spend', value: '$18,420' },
            { type: 'stat', label: 'Cost per User', value: '$0.74' },
            { type: 'stat', label: 'YoY Change', value: '-8%' },
            { type: 'divider' },
            {
              type: 'pie',
              label: 'Cost by Service',
              size: 180,
              slices: [
                { label: 'Compute', value: 45, color: '#6366f1' },
                { label: 'Storage', value: 22, color: '#06b6d4' },
                { label: 'Database', value: 18, color: '#f59e0b' },
                { label: 'Networking', value: 10, color: '#22c55e' },
                { label: 'Other', value: 5, color: '#a855f7' },
              ],
            },
            { type: 'divider', style: 'dotted' },
            {
              type: 'fact',
              icon: '\u2193',
              text: 'Compute costs down 14% after right-sizing instances',
            },
            {
              type: 'fact',
              icon: '\u2191',
              text: 'Storage costs up 6% due to data lake expansion',
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-pie-stats', type: 'ui:infographic' }) },
  ),
};

// ─── TypographyShowcase ──────────────────────────────────────

export const TypographyShowcase: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Visual Hierarchy Showcase',
      sections: [
        {
          heading: 'Key Metrics',
          items: [
            { type: 'stat', label: 'Revenue', value: '$12.5M', description: '+18% year over year' },
            { type: 'stat', label: 'Users', value: '84,200', description: 'Monthly active' },
            { type: 'stat', label: 'Retention', value: '94%', description: 'Up from 89%' },
          ],
        },
        {
          heading: 'Project Status',
          items: [
            { type: 'progress', label: 'Development', value: 88 },
            { type: 'progress', label: 'Testing', value: 62 },
            { type: 'progress', label: 'Documentation', value: 35 },
          ],
        },
        {
          heading: 'Highlights',
          items: [
            { type: 'fact', icon: '\u2713', text: 'Shipped v3.0 ahead of schedule' },
            { type: 'fact', icon: '\u2713', text: 'Zero critical incidents this quarter' },
            { type: 'fact', icon: '\u26A0', text: 'Infrastructure migration pending' },
            { type: 'divider', style: 'dashed' },
            {
              type: 'text',
              content:
                'The team delivered exceptional results this quarter, driven by improved CI/CD pipeline and reduced review cycles.',
            },
          ],
        },
        {
          heading: 'Customer Feedback',
          items: [
            {
              type: 'rating',
              label: 'Overall Satisfaction',
              value: 4.5,
              description: 'Based on 1,240 responses',
            },
            {
              type: 'rating',
              label: 'Ease of Use',
              value: 4,
              description: 'Improved after onboarding redesign',
            },
            { type: 'divider' },
            {
              type: 'pie',
              label: 'Response Distribution',
              slices: [
                { label: 'Promoters', value: 62 },
                { label: 'Passives', value: 26 },
                { label: 'Detractors', value: 12 },
              ],
            },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-typography', type: 'ui:infographic' }) },
  ),
};

// ─── WithIcons ────────────────────────────────────────────────

export const WithIcons: Story = {
  args: mockProps<InfographicData>(
    {
      title: 'Key Highlights',
      sections: [
        {
          heading: 'Achievements',
          items: [
            { type: 'fact', icon: '\u2713', text: 'Launched mobile app v2.0' },
            { type: 'fact', icon: '\u2713', text: 'Reached 1M monthly active users' },
            { type: 'fact', icon: '\u2713', text: 'Achieved SOC2 compliance' },
            { type: 'fact', icon: '\u26A0', text: 'Data migration still in progress' },
          ],
        },
      ],
    },
    { block: mockBlock({ id: 'infographic-icons', type: 'ui:infographic' }) },
  ),
};
