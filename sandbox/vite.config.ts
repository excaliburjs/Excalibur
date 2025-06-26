import path from 'path';
import { defineConfig, mergeConfig } from 'vite';
import commonConfig from '../vite.config.common';

export default mergeConfig(
  commonConfig,
  defineConfig({
    resolve: {
      alias: { '@excalibur': path.join(__dirname, '../src/engine/index.ts') }
    },
    server: {
      fs: {
        allow: [path.join(__dirname, '..')]
      }
    },
    plugins: [
      {
        // brutally inject every js/ts file with an ex import at the top
        name: 'load-excalibur',
        transform(code, id) {
          const isJsFile = id.endsWith('.ts') || id.endsWith('.js');
          if (isJsFile) {
            code = `import * as ex from '@excalibur'\n${code}`;
          }

          return {
            code,
            map: null
          };
        }
      }
    ]
  })
);
