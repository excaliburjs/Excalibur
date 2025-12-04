/// <reference types="@vitest/browser/providers/playwright" />

import * as path from 'path';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import commonConfig from './vite.config.common';
import { EngineInstanceReporter } from './src/spec/__util__/reporters/engine-instance';
import { MemoryReporter } from './src/spec/__util__/reporters/memory';
import { inlineCssByDefault } from './vite.plugins';

export default defineConfig(
  mergeConfig(commonConfig, {
    // our image urls have always been relative from root in tests. would be nice to
    // have a better place of where served files go for tests and then we just use /images/xyz.png
    publicDir: __dirname,
    resolve: {
      alias: {
        '@excalibur': path.resolve(__dirname, './src/engine/')
      }
    },
    test: {
      api: { host: '0.0.0.0' },
      silent: 'passed-only',
      reporters: [['default', { summary: false }], new EngineInstanceReporter(), new MemoryReporter()],
      // enable with --coverage param
      coverage: {
        include: ['src/engine/**/*.ts'],
        provider: 'istanbul',
        reporter: [['html'], ['lcov', { projectRoot: __dirname }], ['text-summary']],
        reportsDirectory: path.join(__dirname, 'coverage')
      },
      projects: ['./src/spec/vitest.config.unit.ts', './src/spec/vitest.config.visual.ts']
    },
    plugins: [inlineCssByDefault()]
  } satisfies ViteUserConfig)
);

declare module 'vitest' {
  export interface ProvidedContext {
    browser: 'chromium' | 'firefox' | 'webkit';
    platform: NodeJS.Platform;
  }
}
