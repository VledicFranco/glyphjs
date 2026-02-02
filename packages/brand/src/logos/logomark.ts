import type { FC } from 'react';
import { createElement } from 'react';

/**
 * Stylized angular "G" logomark — geometric, constructed from straight
 * lines and precise angles. Cyan accent on the horizontal crossbar.
 */
export const logomarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M42 8L14 8L14 56L42 56L42 36L30 36" stroke="currentColor" stroke-width="2" stroke-linejoin="miter"/>
  <line x1="42" y1="36" x2="50" y2="36" stroke="#3a9bc8" stroke-width="2"/>
</svg>`;

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const Logomark: FC<LogoProps> = ({ width = 64, height = 64, className }) =>
  createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 64 64',
      fill: 'none',
      width,
      height,
      className,
      role: 'img',
      'aria-label': 'Glyph JS logomark',
    },
    createElement('path', {
      d: 'M42 8L14 8L14 56L42 56L42 36L30 36',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinejoin: 'miter',
    }),
    createElement('line', {
      x1: 42,
      y1: 36,
      x2: 50,
      y2: 36,
      stroke: '#3a9bc8',
      strokeWidth: 2,
    }),
  );
