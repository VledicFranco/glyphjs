import type { GlyphComponentDefinition } from '@glyphjs/types';
import { architectureSchema } from '@glyphjs/schemas';
import { Architecture } from './Architecture.js';
import type { ArchitectureData } from './Architecture.js';

export const architectureDefinition: GlyphComponentDefinition<ArchitectureData> = {
  type: 'ui:architecture',
  schema: architectureSchema,
  render: Architecture,
};

export { Architecture };
export type { ArchitectureData };
export { computeArchitectureLayout } from './layout.js';
export type {
  ArchitectureLayout,
  PositionedArchNode,
  PositionedZone,
  PositionedArchEdge,
} from './layout.js';
