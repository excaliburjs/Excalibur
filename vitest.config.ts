/// <reference types="@vitest/browser/providers/playwright" />

import type { Plugin } from 'vitest/config';
import { defineConfig } from 'vitest/config';
import * as path from 'path';

const versioner = require('./version');
const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

const isArmMacOS = process.platform === 'darwin' && process.arch === 'arm64';

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
    reporters: [['default', { summary: false }]],
    browser: {
      enabled: true,
      provider: 'playwright',
      isolate: true,

      headless: process.env.CI === 'true' || process.env.HEADLESS === 'true',
      // https://vitest.dev/guide/browser/playwright
      // run `vitest --browser <name>` to run tests in a specific browser
      instances: [
        {
          browser: 'chromium',
          provide: {
            browser: 'chromium'
          },
          launch: {
            // channel: 'chromium',
            // needed for linux
            ignoreDefaultArgs: ['--disable-render-backgrounding'],
            args: [
              '--autoplay-policy=no-user-gesture-required',
              '--mute-audio',
              '--no-sandbox',
              '--enable-precise-memory-info',
              '--js-flags="--max_old_space_size=8192"',
              // breaks webGL on arm macs
              !isArmMacOS && '--disable-gpu'
            ].filter(Boolean)
          }
        },
        {
          browser: 'firefox',
          provide: {
            browser: 'firefox'
          }
        },
        {
          browser: 'webkit',
          provide: {
            browser: 'webkit'
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
  }
}
