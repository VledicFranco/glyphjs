import type { CSSProperties, ReactElement } from 'react';
import type { InlineNode } from '@glyphjs/types';
import { InlineRenderer } from '@glyphjs/runtime';

export interface ForeignObjectTextProps {
  /** X coordinate for foreignObject */
  x: number;
  /** Y coordinate for foreignObject */
  y: number;
  /** Width of the foreignObject */
  width: number;
  /** Height of the foreignObject */
  height: number;
  /** Text content - string or InlineNode[] */
  content: string | InlineNode[];
  /** Text alignment: 'left' | 'center' | 'right' */
  textAlign?: 'left' | 'center' | 'right';
  /** Vertical alignment: 'top' | 'middle' | 'bottom' */
  verticalAlign?: 'top' | 'middle' | 'bottom';
  /** Font size (CSS value) */
  fontSize?: string;
  /** Font family (CSS value) */
  fontFamily?: string;
  /** Font weight (CSS value) */
  fontWeight?: string | number;
  /** Text color */
  fill?: string;
  /** Additional CSS styles for the text container */
  style?: CSSProperties;
  /** Class name for the container div */
  className?: string;
}

/**
 * ForeignObjectText - Renders text (plain or markdown) inside SVG using foreignObject.
 *
 * This component enables rich text formatting inside SVG elements by embedding
 * an HTML div with full CSS styling capabilities. It's used for rendering
 * markdown-formatted labels in diagram components (Graph, Relation, etc.).
 *
 * Browser support: All modern browsers (98%+ global support)
 *
 * @example
 * ```tsx
 * <svg>
 *   <ForeignObjectText
 *     x={10}
 *     y={20}
 *     width={100}
 *     height={40}
 *     content="Simple text"
 *     textAlign="center"
 *     fill="currentColor"
 *   />
 * </svg>
 * ```
 *
 * @example With markdown
 * ```tsx
 * <svg>
 *   <ForeignObjectText
 *     x={10}
 *     y={20}
 *     width={150}
 *     height={50}
 *     content={[
 *       { type: 'text', value: 'Label with ' },
 *       { type: 'strong', children: [{ type: 'text', value: 'bold' }] }
 *     ]}
 *     textAlign="center"
 *     verticalAlign="middle"
 *   />
 * </svg>
 * ```
 */
export function ForeignObjectText({
  x,
  y,
  width,
  height,
  content,
  textAlign = 'center',
  verticalAlign = 'middle',
  fontSize = '13px',
  fontFamily = 'Inter, system-ui, sans-serif',
  fontWeight = 'normal',
  fill = 'currentColor',
  style,
  className,
}: ForeignObjectTextProps): ReactElement {
  // Calculate flex alignment based on props
  const justifyContent =
    textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

  const alignItems =
    verticalAlign === 'top' ? 'flex-start' : verticalAlign === 'bottom' ? 'flex-end' : 'center';

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent,
    alignItems,
    width: '100%',
    height: '100%',
    fontSize,
    fontFamily,
    fontWeight,
    color: fill,
    padding: '4px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.4,
    ...style,
  };

  const textStyle: CSSProperties = {
    textAlign,
    width: '100%',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={containerStyle} className={className}>
        <div style={textStyle}>
          {Array.isArray(content) ? <InlineRenderer nodes={content} /> : content}
        </div>
      </div>
    </foreignObject>
  );
}
