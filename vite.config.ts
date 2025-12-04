import * as path from 'path';
import * as fs from 'fs';
import type { ResolvedConfig, Plugin } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import MagicString from 'magic-string';
import banner from 'vite-plugin-banner';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import versioner from './version';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const now = new Date();
const dt = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
const version = process.env.release ? versioner.getReleaseVersion() : versioner.getAlphaVersion();

import commonConfig from './vite.config.common';

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

function inlineCssByDefault(): Plugin {
  return {
    name: 'inline-css-by-default',
    enforce: 'pre',

    transform(code, id) {
      // Only touch JS/TS/JSX/TSX
      if (!/\.(mjs|cjs|js|ts|jsx|tsx)$/.test(id)) {
return null;
}
      if (!code.includes('.css')) {
return null;
}

      // Match both:
      //   import styles from "./foo.css";
      //   import * as styles from "./foo.css";
      //   import { x } from "./foo.css";
      //
      // And *not*:
      //   import "./foo.css";
      //
      const importRegex = /import\s+(?<bindings>[^'"]+?)\s+from\s+['"](?<spec>[^'"]+\.css)['"];?/g;

      let match: RegExpExecArray | null;
      let s: MagicString | undefined;

      while ((match = importRegex.exec(code))) {
        const groups = match.groups!;
        const spec = groups.spec;

        // Don’t touch inline/url/custom-query or CSS Modules
        if (spec.includes('?')) {
continue;
}
        if (spec.endsWith('.module.css')) {
continue;
}

        const start = match.index + match[0].indexOf(spec);
        const end = start + spec.length;

        if (!s) {
s = new MagicString(code);
}
        s.overwrite(start, end, `${spec}?inline`);
      }

      if (!s) {
return null;
}

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      };
    }
  };
}
