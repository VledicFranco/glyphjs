import type { FC } from 'react';
import { createElement } from 'react';

/**
 * "glyphjs" wordmark — clean geometric sans-serif, all-lowercase,
 * letterspaced. Rendered as an SVG text element for scalability.
 */
export const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" fill="none">
  <text x="0" y="28" font-family="Inter, Helvetica Neue, system-ui, sans-serif" font-size="24" font-weight="300" letter-spacing="0.08em" fill="currentColor">glyphjs</text>
</svg>`;

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const Wordmark: FC<LogoProps> = ({ width = 200, height = 40, className }) =>
  createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 200 40',
      fill: 'none',
      width,
      height,
      className,
      role: 'img',
      'aria-label': 'Glyph JS',
    },
    createElement(
      'text',
      {
        x: 0,
        y: 28,
        fontFamily: 'Inter, Helvetica Neue, system-ui, sans-serif',
        fontSize: 24,
        fontWeight: 300,
        letterSpacing: '0.08em',
        fill: 'currentColor',
      },
      'glyphjs',
    ),
  );
