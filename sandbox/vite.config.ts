import path from 'path';
import { createRequire } from 'module';
import { defineConfig, mergeConfig } from 'vite';
import commonConfig from '../vite.config.common';

// The runner embeds the playground's React components, so reuse the playground's
// dependencies (react plugin, react 19) instead of adding them to the root package.
const playgroundRequire = createRequire(path.join(__dirname, '../playground/package.json'));
const reactPlugin = playgroundRequire('@vitejs/plugin-react');
const react = reactPlugin.default ?? reactPlugin;
const playgroundModules = path.join(__dirname, '../playground/node_modules');

const excaliburEntryPoint = path.join(__dirname, '../src/engine/index.ts');

// Runs before any module script in sandbox pages. When the page is framed by the
// runner, forward console output and uncaught errors to the runner's log panel
// (`__runnerLog`), so test logs are visible without opening iframe devtools.
// Cross-origin parents/frames throw on access and are silently skipped.
const consoleForwarder = `
(function () {
  if (window.parent === window) return;
  function send(level, args) {
    try {
      var target = window.parent.__runnerLog ? window.parent : window.top;
      if (target.__runnerLog) target.__runnerLog(level, Array.prototype.slice.call(args));
    } catch (e) {}
  }
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var original = console[level].bind(console);
    console[level] = function () {
      original.apply(console, arguments);
      send(level, arguments);
    };
  });
  window.addEventListener('error', function (event) { send('error', [event.message]); });
  window.addEventListener('unhandledrejection', function (event) { send('error', ['Uncaught (in promise)', event.reason]); });
})();
`;

export default mergeConfig(
  commonConfig,
  defineConfig({
    root: __dirname,
    resolve: {
      alias: {
        excalibur: excaliburEntryPoint,
        // Keep a single react copy (the playground's) for both the sandbox entry
        // and the embedded playground components
        react: path.join(playgroundModules, 'react'),
        'react-dom': path.join(playgroundModules, 'react-dom')
      }
    },
    server: {
      open: true,
      fs: {
        allow: [path.join(__dirname, '..')]
      }
    },
    plugins: [
      react(),
      {
        // Inject an import map so raw browser modules (iframe tests, and eventually
        // playground editor code) can `import ... from 'excalibur'` directly.
        // Vite-transformed modules resolve the bare import through the alias above.
        name: 'excalibur-sandbox-html',
        transformIndexHtml() {
          const entryUrl = `/@fs/${excaliburEntryPoint.replace(/\\/g, '/')}`;
          return [
            {
              tag: 'script',
              children: consoleForwarder,
              injectTo: 'head-prepend'
            },
            {
              tag: 'script',
              attrs: { type: 'importmap' },
              children: JSON.stringify({ imports: { excalibur: entryUrl } }),
              injectTo: 'head-prepend'
            }
          ];
        }
      }
    ]
  })
);
