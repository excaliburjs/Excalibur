
import type { Plugin } from 'vite';
import MagicString from 'magic-string';

export function inlineCssByDefault(): Plugin {
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
