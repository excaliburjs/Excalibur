/// <reference types="@vitest/browser/providers/playwright" />

import * as os from 'os';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      name: 'unit',
      globals: true,
      setupFiles: ['./__util__/setup.ts', './__matchers__/expect.ts'],
      include: ['./vitest/**/*Spec.ts'],
      testNamePattern: /^(?!.*@visual).+$/,
      sequence: {
        groupOrder: 0
      },
      browser: {
        enabled: true,
        provider: 'playwright',
        // this will give each test their own environment. disabling this
        // actually ended up breaking WebGL contexts in some cases
        isolate: true,
        headless: true,

        instances: [
          {
            browser: 'chromium',
            provide: {
              browser: 'chromium',
              platform: os.platform()
            },
            launch: {
              channel: 'chromium',
              args: ['--mute-audio', '--enable-precise-memory-info', '--js-flags="--max_old_space_size=8192" --expose-gc'].filter(Boolean)
            }
          }
        ]
      }
    }
  } satisfies ViteUserConfig)
);
