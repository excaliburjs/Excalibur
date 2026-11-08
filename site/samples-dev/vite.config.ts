import path from 'path';
import { defineConfig, mergeConfig } from 'vite';
import commonConfig from '../../vite.config.common';

/**
 * Dev server for the live samples embedded in blog posts (site/blog/** /samples/*.ts).
 * Resolves `import * as ex from 'excalibur'` to the engine source so edits in either
 * the sample or the engine hot reload. Run from the repo root with `npm run samples`.
 */
const engineEntry = path.join(__dirname, '../../src/engine/index.ts');

export default mergeConfig(
  commonConfig,
  defineConfig({
    root: __dirname,
    resolve: {
      alias: { excalibur: engineEntry }
    },
    plugins: [
      {
        // Samples may import plugins by URL (see astar.ts), and those plugins import 'excalibur' by bare
        // name. Vite only rewrites imports in modules it serves, so give the browser an import map that
        // points the bare name at the same source entry the alias resolves to.
        name: 'excalibur-import-map',
        transformIndexHtml() {
          return [
            {
              tag: 'script',
              attrs: { type: 'importmap' },
              children: JSON.stringify({ imports: { excalibur: `/@fs${engineEntry}` } }),
              injectTo: 'head-prepend'
            }
          ];
        }
      }
    ],
    server: {
      open: true,
      fs: {
        allow: [path.join(__dirname, '../..')]
      }
    }
  })
);
