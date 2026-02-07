import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ForeignObjectText } from '../ForeignObjectText.js';
import type { InlineNode } from '@glyphjs/types';

describe('ForeignObjectText', () => {
  it('renders plain text content', () => {
    const { container } = render(
      <svg>
        <ForeignObjectText x={0} y={0} width={100} height={50} content="Hello World" />
      </svg>,
    );

    const foreignObject = container.querySelector('foreignObject');
    expect(foreignObject).toBeInTheDocument();
    expect(foreignObject).toHaveAttribute('x', '0');
    expect(foreignObject).toHaveAttribute('y', '0');
    expect(foreignObject).toHaveAttribute('width', '100');
    expect(foreignObject).toHaveAttribute('height', '50');

    expect(container.textContent).toContain('Hello World');
  });

  it('renders InlineNode[] content', () => {
    const content: InlineNode[] = [
      { type: 'text', value: 'Text with ' },
      {
        type: 'strong',
        children: [{ type: 'text', value: 'bold' }],
      },
    ];

    const { container } = render(
      <svg>
        <ForeignObjectText x={10} y={20} width={150} height={60} content={content} />
      </svg>,
    );

    expect(container.textContent).toContain('Text with bold');
    const strong = container.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe('bold');
  });

  it('applies text alignment', () => {
    const { container } = render(
      <svg>
        <ForeignObjectText
          x={0}
          y={0}
          width={100}
          height={50}
          content="Left aligned"
          textAlign="left"
        />
      </svg>,
    );

    const div = container.querySelector('div[xmlns]');
    expect(div).toHaveStyle({ justifyContent: 'flex-start' });
  });

  it('applies vertical alignment', () => {
    const { container } = render(
      <svg>
        <ForeignObjectText
          x={0}
          y={0}
          width={100}
          height={50}
          content="Top aligned"
          verticalAlign="top"
        />
      </svg>,
    );

    const div = container.querySelector('div[xmlns]');
    expect(div).toHaveStyle({ alignItems: 'flex-start' });
  });

  it('applies custom font styles', () => {
    const { container } = render(
      <svg>
        <ForeignObjectText
          x={0}
          y={0}
          width={100}
          height={50}
          content="Styled text"
          fontSize="16px"
          fontFamily="Arial"
          fontWeight="bold"
          fill="#ff0000"
        />
      </svg>,
    );

    const div = container.querySelector('div[xmlns]');
    expect(div).toHaveStyle({
      fontSize: '16px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#ff0000',
    });
  });

  it('renders links in markdown content', () => {
    const content: InlineNode[] = [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'Click me' }],
      },
    ];

    const { container } = render(
      <svg>
        <ForeignObjectText x={0} y={0} width={100} height={50} content={content} />
      </svg>,
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link?.textContent).toBe('Click me');
  });

  it('renders inline code', () => {
    const content: InlineNode[] = [
      { type: 'text', value: 'Run ' },
      { type: 'inlineCode', value: 'npm install' },
    ];

    const { container } = render(
      <svg>
        <ForeignObjectText x={0} y={0} width={150} height={50} content={content} />
      </svg>,
    );

    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe('npm install');
  });

  it('applies custom style prop', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };

    const { container } = render(
      <svg>
        <ForeignObjectText
          x={0}
          y={0}
          width={100}
          height={50}
          content="Styled"
          style={customStyle}
        />
      </svg>,
    );

    const div = container.querySelector('div[xmlns]');
    expect(div).toHaveStyle({ backgroundColor: '#f0f0f0' });
  });

  it('applies className', () => {
    const { container } = render(
      <svg>
        <ForeignObjectText
          x={0}
          y={0}
          width={100}
          height={50}
          content="Text"
          className="custom-class"
        />
      </svg>,
    );

    const div = container.querySelector('div[xmlns]');
    expect(div).toHaveClass('custom-class');
  });
});
