/// <reference types="@vitest/browser/providers/playwright" />

import * as path from 'path';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import commonConfig from './vite.config.common';
import { EngineInstanceReporter } from './src/spec/__util__/reporters/engine-instance';
import { MemoryReporter } from './src/spec/__util__/reporters/memory';

export default defineConfig(
  mergeConfig(commonConfig, {
    // our image urls have always been from root in tests. would be nice to
    // have a better, more clear place of where served files go for tests
    publicDir: __dirname,
    resolve: {
      alias: {
        '@excalibur': path.resolve(__dirname, './src/engine/')
      }
    },
    test: {
      reporters: [['default', { summary: false }], new EngineInstanceReporter(), new MemoryReporter()],
      // enable with --coverage param
      coverage: {
        include: ['src/engine/**/*.ts'],
        provider: 'istanbul',
        reporter: [['html'], ['lcov', { projectRoot: __dirname }], ['text-summary']],
        reportsDirectory: path.join(__dirname, 'coverage')
      },
      projects: ['./src/spec/vitest.config.unit.ts', './src/spec/vitest.config.visual.ts']
    }
  } satisfies ViteUserConfig)
);

declare module 'vitest' {
  export interface ProvidedContext {
    browser: 'chromium' | 'firefox' | 'webkit';
    platform: NodeJS.Platform;
  }
}
