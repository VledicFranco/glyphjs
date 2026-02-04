import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../Card.js';
import type { CardData } from '../Card.js';
import { createMockProps } from '../../__tests__/helpers.js';

describe('Card', () => {
  const baseData: CardData = {
    title: 'Featured Cards',
    cards: [
      {
        title: 'Card One',
        subtitle: 'First subtitle',
        body: 'Body text for card one.',
        actions: [{ label: 'Learn More', url: 'https://example.com/one' }],
      },
      {
        title: 'Card Two',
        subtitle: 'Second subtitle',
        body: 'Body text for card two.',
        actions: [{ label: 'View Docs', url: 'https://example.com/two' }],
      },
    ],
  };

  it('renders card titles', () => {
    const props = createMockProps<CardData>(baseData, 'ui:card');
    render(<Card {...props} />);
    expect(screen.getByText('Card One')).toBeInTheDocument();
    expect(screen.getByText('Card Two')).toBeInTheDocument();
  });

  it('images have loading="lazy"', () => {
    const data: CardData = {
      cards: [
        {
          title: 'Image Card',
          image: 'https://example.com/photo.jpg',
        },
      ],
    };
    const props = createMockProps<CardData>(data, 'ui:card');
    const { container } = render(<Card {...props} />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('action links have correct href and rel="noopener noreferrer"', () => {
    const props = createMockProps<CardData>(baseData, 'ui:card');
    render(<Card {...props} />);
    const learnMoreLinks = screen.getAllByText('Learn More');
    const link = learnMoreLinks[0]?.closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com/one');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('all 3 variants render distinct styles', () => {
    const data: CardData = {
      cards: [{ title: 'Variant Card' }],
    };

    // Default variant
    const defaultProps = createMockProps<CardData>({ ...data, variant: 'default' }, 'ui:card');
    const { container: c1 } = render(<Card {...defaultProps} />);
    const defaultArticle = c1.querySelector('article');
    const defaultBorder = defaultArticle?.style.border;

    // Outlined variant
    const outlinedProps = createMockProps<CardData>({ ...data, variant: 'outlined' }, 'ui:card');
    const { container: c2 } = render(<Card {...outlinedProps} />);
    const outlinedArticle = c2.querySelector('article');
    const outlinedBorder = outlinedArticle?.style.border;

    // Elevated variant
    const elevatedProps = createMockProps<CardData>({ ...data, variant: 'elevated' }, 'ui:card');
    const { container: c3 } = render(<Card {...elevatedProps} />);
    const elevatedArticle = c3.querySelector('article');
    const elevatedBoxShadow = elevatedArticle?.style.boxShadow;

    // Default and outlined should have different borders
    expect(defaultBorder).not.toEqual(outlinedBorder);
    // Elevated should have a box-shadow
    expect(elevatedBoxShadow).toBeTruthy();
  });

  it('handles missing optional fields gracefully', () => {
    const data: CardData = {
      cards: [
        {
          title: 'Minimal Card',
        },
      ],
    };
    const props = createMockProps<CardData>(data, 'ui:card');
    const { container } = render(<Card {...props} />);
    expect(screen.getByText('Minimal Card')).toBeInTheDocument();
    // No image, no actions, no subtitle, no body
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });

  it('has ARIA roles present', () => {
    const props = createMockProps<CardData>(baseData, 'ui:card');
    const { container } = render(<Card {...props} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Featured Cards');
    expect(screen.getByRole('list')).toBeInTheDocument();
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBe(2);
    for (const article of articles) {
      expect(article).toHaveAttribute('role', 'listitem');
    }
  });

  it('uses default aria-label when title is absent', () => {
    const data: CardData = {
      cards: [{ title: 'Solo Card' }],
    };
    const props = createMockProps<CardData>(data, 'ui:card');
    render(<Card {...props} />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Cards');
  });

  it('renders icon when provided', () => {
    const data: CardData = {
      cards: [
        {
          title: 'Icon Card',
          icon: '🚀',
        },
      ],
    };
    const props = createMockProps<CardData>(data, 'ui:card');
    render(<Card {...props} />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });
});
