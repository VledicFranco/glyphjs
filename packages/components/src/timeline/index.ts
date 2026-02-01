import { timelineSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Timeline } from './Timeline.js';
import type { TimelineData } from './Timeline.js';

export const timelineDefinition: GlyphComponentDefinition<TimelineData> = {
  type: 'ui:timeline',
  schema: timelineSchema,
  render: Timeline,
};

export { Timeline };
export type { TimelineData };
