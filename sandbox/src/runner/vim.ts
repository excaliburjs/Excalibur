import type { editor } from 'monaco-editor';
// served straight from the playground's node_modules, no bundling involved
import vimScriptUrl from '../../../playground/node_modules/monaco-vim/dist/monaco-vim.umd.js?url';

export type VimAdapter = { dispose: () => void };

export type MonacoVimApi = {
  initVimMode: (editor: editor.IStandaloneCodeEditor, statusbarNode?: HTMLElement | null) => VimAdapter;
};

declare global {
  interface Window {
    MonacoVim?: MonacoVimApi;
  }
}

let loading: Promise<MonacoVimApi> | null = null;

/**
 * Loads monaco-vim's UMD build, which binds to `window.monaco` — the same instance
 * the editor's CDN loader created. Must be called after the editor has mounted.
 *
 * The UMD is executed with `define`/`exports`/`module` shadowed: monaco's CDN AMD
 * loader leaves a global `define.amd` behind, which would otherwise divert the UMD
 * into an AMD registration that never runs.
 */
export function loadMonacoVim(): Promise<MonacoVimApi> {
  if (window.MonacoVim) {
    return Promise.resolve(window.MonacoVim);
  }
  loading ??= fetch(vimScriptUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`monaco-vim script failed to load: ${response.status}`);
      }
      return response.text();
    })
    .then((code) => {
      const run = new Function('define', 'exports', 'module', `${code}\n//# sourceURL=monaco-vim.umd.js`);
      run(undefined, undefined, undefined);
      if (!window.MonacoVim) {
        throw new Error('monaco-vim loaded but window.MonacoVim is missing');
      }
      return window.MonacoVim;
    });
  return loading;
}
