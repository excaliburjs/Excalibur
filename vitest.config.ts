import * as path from 'path';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';

// @ts-ignore
import commonConfig from './vite.config.common';

import { EngineInstanceReporter } from './src/spec/__util__/reporters/engine-instance';
import { MemoryReporter } from './src/spec/__util__/reporters/memory';
import { ImageDiffReporter } from './src/spec/__util__/reporters/image-diff-reporter';

export default defineConfig(
  mergeConfig(commonConfig, {
    // our image urls have always been relative from root in tests. would be nice to
    // have a better place of where served files go for tests and then we just use /images/xyz.png
    publicDir: import.meta.dirname,
    resolve: {
      alias: {
        '@excalibur': path.resolve(import.meta.dirname, './src/engine/')
      }
    },
    plugins: [],
    test: {
      api: { host: '127.0.0.1' },
      silent: 'passed-only',
      clearMocks: true,
      reporters: [['default', { summary: false }], new EngineInstanceReporter(), new MemoryReporter(), new ImageDiffReporter()],
      // enable with --coverage param
      coverage: {
        include: ['src/engine/**/*.ts'],
        provider: 'istanbul',
        reporter: [['html'], ['lcov', { projectRoot: import.meta.dirname }], ['text-summary']],
        reportsDirectory: path.join(import.meta.dirname, 'coverage')
      },
      projects: [
        path.resolve(import.meta.dirname, './src/spec/vitest.config.unit.ts'),
        path.resolve(import.meta.dirname, './src/spec/vitest.config.visual.ts')
      ]
    }
  } satisfies ViteUserConfig)
);

declare module 'vitest' {
  export interface ProvidedContext {
    browser: 'chromium' | 'firefox' | 'webkit';
    platform: NodeJS.Platform;
  }
}
