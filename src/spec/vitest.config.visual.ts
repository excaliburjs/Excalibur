/// <reference types="@vitest/browser/providers/playwright" />

import * as os from 'os';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';
const isArmMacOS = process.platform === 'darwin' && process.arch === 'arm64';
const HEADLESS = process.env.HEADLESS === 'true' || process.env.CI === 'true';

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      name: 'visual',
      globals: true,
      setupFiles: ['./__util__/setup.ts', './__matchers__/expect.ts', './__matchers__/expect.visual.ts'],
      include: ['./vitest/**/*Spec.ts'],
      testNamePattern: /@visual/,
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
              channel: 'chrome',
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
          }
        ]
      }
    }
  } satisfies ViteUserConfig)
);
