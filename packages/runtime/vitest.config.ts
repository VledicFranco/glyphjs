import { defineConfig, mergeConfig } from 'vitest/config';
import { sharedJsdomConfig } from '../../vitest.shared.js';

export default mergeConfig(
  sharedJsdomConfig,
  defineConfig({
    test: {
      setupFiles: ['./vitest.setup.ts'],
    },
  }),
);
