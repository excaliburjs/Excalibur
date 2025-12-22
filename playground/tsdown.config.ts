import { defineConfig } from 'tsdown';
import Raw from 'unplugin-raw/rolldown';

export default defineConfig({
  entry: '../src/engine/index.ts',
  dts: true,
  tsconfig: '../src/engine/tsconfig.json',
  outDir: './types',
  // See: https://github.com/rolldown/tsdown/discussions/631
  loader: { '.glsl': 'text', '.png': 'asset' },
  external: [/\.css\?inline$/, /\.css$/],
  plugins: [Raw()]
});
