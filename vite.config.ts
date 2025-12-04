import * as path from 'path';
import * as fs from 'fs';
import type { ResolvedConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import banner from 'vite-plugin-banner';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import versioner from './version';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const now = new Date();
const dt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

import commonConfig from './vite.config.common';
import { inlineCssByDefault } from './vite.plugins';

export default defineConfig(({ mode }) => {
  let config: ResolvedConfig;

  // eslint-disable-next-line no-console
  console.log(`[version] ${version}.js`);

  return mergeConfig(commonConfig, {
    build: {
      target: 'es2018',
      outDir: path.resolve(__dirname, 'build'),
      emptyOutDir: false,
      lib: {
        formats: ['es', 'umd'],
        name: 'ex',
        fileName(format) {
          let fileName = 'excalibur';

          if (config.build.minify) {
            fileName += '.min';
          }

          if (mode === 'development') {
            fileName += '.development';
          }

          if (format === 'es') {
            return `esm/${fileName}.js`;
          }

          return `dist/${fileName}.js`;
        },
        entry: 'src/engine/index.ts'
      }
    },

    plugins: [
      inlineCssByDefault(),
      
      // get the resolved vite config so we can reference it in
      // callbacks
      {
        name: 'get-config',
        configResolved(v) {
          config = v;
        }
      },
      viteStaticCopy({
        targets: [
          {
            src: 'src/engine/excalibur.d.ts',
            dest: 'dist/'
          }
        ]
      }),

      banner(
        `${pkg.name} - ${version} - ${dt}
${pkg.homepage}
Copyright (c) ${now.getFullYear()} Excalibur.js <${pkg.author}>
Licensed ${pkg.license}
@preserve`
      )
    ]
  });
});
