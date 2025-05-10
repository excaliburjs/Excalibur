/// <reference types="@vitest/browser/providers/playwright" />

import type { Plugin } from 'vitest/config';
import { defineConfig } from 'vitest/config';
import * as path from 'path';
import * as os from 'os';
import { EngineInstanceReporter } from './src/spec/vitest/__reporters__/engine-instance';
import { MemoryReporter } from './src/spec/vitest/__reporters__/memory';

const versioner = require('./version');
const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

const isArmMacOS = process.platform === 'darwin' && process.arch === 'arm64';
const HEADLESS = process.env.HEADLESS === 'true' || process.env.CI === 'true';

export default defineConfig({
  plugins: [importAs('glsl', '?raw'), importAs('css', '?inline')],
  optimizeDeps: {
    include: ['jasmine']
  },
  resolve: {
    alias: {
      '@excalibur': path.resolve(__dirname, './src/engine/')
    }
  },
  define: {
    'process.env.__EX_VERSION': JSON.stringify(version),
    'process.env.NODE_ENV': JSON.stringify('development'),
    __dirname: JSON.stringify(__dirname)
  },
  esbuild: {
    target: 'es2018',
    tsconfigRaw: {
      compilerOptions: {
        verbatimModuleSyntax: false
      }
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
});

/**
 * Changes the default import behavior for certain file types to
 * use the provided query string (e.g. `?raw`)
 */
function importAs(ext: string, query: string): Plugin {
  return {
    name: 'raw',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id.endsWith(ext)) {
        return this.resolve(id + query, importer);
      }
    }
  };
}

declare module 'vitest' {
  export interface ProvidedContext {
    browser: 'chromium' | 'firefox' | 'webkit';
    platform: NodeJS.Platform;
  }
}
