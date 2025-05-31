import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const versioner = require('./version');
const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

/**
 * Common config needed to build excalibur for either testing or production build. Anything
 * that is needed to run excalibur at all should be put in here.
 */
export default defineConfig({
  plugins: [defaultImportQueryForExtension('glsl', '?raw'), defaultImportQueryForExtension('css', '?inline')],
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

/**
 * Changes the default import behavior for certain file types to
 * use the provided query string (e.g. `?raw`)
 */
function defaultImportQueryForExtension(ext: string, query: string): Plugin {
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
