/**
 * This is a .js file instead of .ts so that storybook can import it
 */

import { defineConfig } from 'vite';
import versioner from './version.js';

const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

/**
 * Common config needed to build excalibur for either testing or production build. Anything
 * that is needed to run excalibur at all should be put in here.
 */
export default defineConfig({
  define: {
    'process.env.__EX_VERSION': JSON.stringify(version),
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  esbuild: {
    target: 'es2018',
    tsconfigRaw: {
      compilerOptions: {
        verbatimModuleSyntax: false
      }
    }
  }
});
