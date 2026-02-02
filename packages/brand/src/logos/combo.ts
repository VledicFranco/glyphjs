import type { FC } from 'react';
import { createElement } from 'react';

/**
 * Combined lockup — logomark left, wordmark right, with fixed
 * 12px clear-space gap between them.
 */
export const comboSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" fill="none">
  <g>
    <path d="M42 8L14 8L14 56L42 56L42 36L30 36" stroke="currentColor" stroke-width="2" stroke-linejoin="miter"/>
    <line x1="42" y1="36" x2="50" y2="36" stroke="#3a9bc8" stroke-width="2"/>
  </g>
  <text x="76" y="40" font-family="Inter, Helvetica Neue, system-ui, sans-serif" font-size="24" font-weight="300" letter-spacing="0.08em" fill="currentColor">glyphjs</text>
</svg>`;

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const ComboLogo: FC<LogoProps> = ({ width = 280, height = 64, className }) =>
  createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 280 64',
      fill: 'none',
      width,
      height,
      className,
      role: 'img',
      'aria-label': 'Glyph JS',
    },
    createElement(
      'g',
      null,
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
    ),
    createElement(
      'text',
      {
        x: 76,
        y: 40,
        fontFamily: 'Inter, Helvetica Neue, system-ui, sans-serif',
        fontSize: 24,
        fontWeight: 300,
        letterSpacing: '0.08em',
        fill: 'currentColor',
      },
      'glyphjs',
    ),
  );
