/// <reference types="@vitest/browser/providers/playwright" />

import * as os from 'os';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

const enableGpu = [
  // apple silicon macs
  process.platform === 'darwin' && process.arch === 'arm64'
].some(Boolean);

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
        // ended up breaking WebGL contexts in some cases
        isolate: true,

        headless: process.env.CI === 'true' ? true : undefined,

        // https://vitest.dev/guide/browser/playwright
        // run `vitest --browser <name>` to run tests in a specific browser
        instances: [
          {
            name: 'chrome',
            browser: 'chromium',
            provide: {
              browser: 'chromium',
              platform: os.platform()
            },
            launch: {
              channel: 'chrome',
              // we pass in a whole bunch of args to try and make rendering as consistent as possible across
              // operating systems.
              ignoreDefaultArgs: ['--disable-render-backgrounding', '--disable-remote-fonts', '--font-render-hinting'],
              args: [
                '--no-default-browser-check',
                '--no-first-run',
                '--disable-default-apps',
                '--disable-popup-blocking',
                '--disable-translate',
                '--disable-background-timer-throttling',
                !enableGpu && '--disable-gpu',
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
