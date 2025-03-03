/// <reference types="@vitest/browser/providers/playwright" />

import type { Plugin } from 'vitest/config';
import { defineConfig } from 'vitest/config';
import * as path from 'path';

const versioner = require('./version');
const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

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
    setupFiles: ['./src/spec/__setup__/setup.ts'],
    include: ['**/*.vitest.ts'],

    browser: {
      enabled: true,
      provider: 'playwright',
      isolate: true,
      headless: process.env.CI === 'true' || process.env.HEADLESS === 'true',
      // https://vitest.dev/guide/browser/playwright
      // run `vitest --browser <name>` to run tests in a specific browser
      instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }]
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
