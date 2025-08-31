/// <reference types="@vitest/browser/providers/playwright" />

import * as os from 'os';
import * as path from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { EngineInstanceReporter } from './src/spec/vitest/__reporters__/engine-instance';
import { MemoryReporter } from './src/spec/vitest/__reporters__/memory';
import commonConfig from './vite.config.common';

const isArmMacOS = process.platform === 'darwin' && process.arch === 'arm64';
const HEADLESS = process.env.HEADLESS === 'true' || process.env.CI === 'true';

export default defineConfig(
  mergeConfig(commonConfig, {
    resolve: {
      alias: {
        '@excalibur': path.resolve(__dirname, './src/engine/')
      }
    },
    test: {
      globals: true,
      setupFiles: ['./src/spec/vitest/__setup__/setup.ts'],
      include: ['src/spec/vitest/**/*Spec.ts'],
      reporters: [['default', { summary: false }], new EngineInstanceReporter(), new MemoryReporter()],
      // enable with --coverage param
      coverage: {
        include: ['src/engine/**/*.ts'],
        provider: 'istanbul',
        reporter: [['html'], ['lcov', { projectRoot: __dirname }], ['text-summary']],
        reportsDirectory: path.join(__dirname, 'coverage')
      },
      pool: 'threads',
      browser: {
        enabled: true,
        provider: 'playwright',
        // this will give each test their own environment. disabling this
        // actually ended up breaking WebGL contexts in some cases
        isolate: true,

        // this slows down the run but helps keep tests stable with how often
        // we are opening and closing WebGL contexts
        fileParallelism: false,

        headless: HEADLESS,

        // https://vitest.dev/guide/browser/playwright
        // run `vitest --browser <name>` to run tests in a specific browser
        instances: [
          {
            browser: 'chromium',
            provide: {
              browser: 'chromium',
              platform: os.platform()
            },
            launch: {
              channel: 'chromium',
              ignoreDefaultArgs: ['--disable-render-backgrounding', '--disable-remote-fonts', '--font-render-hinting'],
              args: [
                '--no-default-browser-check',
                '--no-first-run',
                '--disable-default-apps',
                '--disable-popup-blocking',
                '--disable-translate',
                '--disable-background-timer-throttling',
                !isArmMacOS && '--disable-gpu',
                '--disable-dev-shm-usage',

                // on macOS, disable-background-timer-throttling is not enough
                // and we need disable-renderer-backgrounding too
                // see https://github.com/karma-runner/karma-chrome-launcher/issues/123
                '--disable-renderer-backgrounding',
                '--disable-device-discovery-notifications',

                '--autoplay-policy=no-user-gesture-required',
                '--mute-audio',
                '--no-sandbox',
                '--enable-precise-memory-info',
                '--js-flags="--max_old_space_size=8192" --expose-gc'
              ].filter(Boolean)
            }
          },
          {
            browser: 'firefox',
            provide: {
              browser: 'firefox',
              platform: os.platform()
            }
          },
          {
            browser: 'webkit',
            provide: {
              browser: 'webkit',
              platform: os.platform()
            }
          }
        ]
      }
    }
  })
);

declare module 'vitest' {
  export interface ProvidedContext {
    browser: 'chromium' | 'firefox' | 'webkit';
    platform: NodeJS.Platform;
  }
}
