import { sliderSchema } from '@glyphjs/schemas';
import type { GlyphComponentDefinition } from '@glyphjs/types';
import { Slider } from './Slider.js';
import type { SliderData, SliderParameter } from './Slider.js';

export const sliderDefinition: GlyphComponentDefinition<SliderData> = {
  type: 'ui:slider',
  schema: sliderSchema,
  render: Slider,
};

export { Slider };
export type { SliderData, SliderParameter };
