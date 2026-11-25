export type TestEntry = {
  /** folder/test key, e.g. `camera/lerp` */
  key: string;
  /** display name in the nav */
  name: string;
  /** server url of the test page */
  htmlUrl: string;
  /** base url used to resolve the test's relative assets */
  baseUrl: string;
  /** basename of the test's module script, e.g. `lerp` */
  scriptBase: string;
  loadSource?: () => Promise<string>;
};

const htmls = import.meta.glob('../../tests/**/*.html');
const sources = import.meta.glob(['../../tests/**/*.ts', '../../src/game.ts'], {
  query: '?raw',
  import: 'default'
});

const testEntries: TestEntry[] = Object.keys(htmls)
  .map((file) => {
    const match = /tests\/(.+)\.html$/.exec(file)!;
    const rel = match[1];
    const parts = rel.split('/');
    const test = parts.pop()!;
    const folder = parts.join('/');
    return {
      key: rel,
      name: folder + (test === 'index' ? '' : ' - ' + test),
      htmlUrl: `/tests/${rel}.html`,
      baseUrl: `/tests/${folder}/`,
      scriptBase: test,
      loadSource: sources[`../../tests/${rel}.ts`] as (() => Promise<string>) | undefined
    };
  })
  .sort((a, b) => a.key.localeCompare(b.key));

export const entries: TestEntry[] = [
  {
    key: 'platformer',
    name: 'Sandbox Platformer',
    htmlUrl: '/html/index.html',
    baseUrl: '/html/',
    scriptBase: 'game',
    // glob keys are relative to this file: sandbox/src/game.ts -> ../game.ts
    loadSource: sources['../game.ts'] as (() => Promise<string>) | undefined
  },
  ...testEntries
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a copy of the test's html that runs `js` (compiled editor output) instead of the
 * test's original module script. Everything else (buttons, spans, import map, vite client)
 * is preserved so DOM-dependent tests keep working. A <base> tag keeps relative asset
 * paths resolving against the test's folder even though the document is an srcdoc iframe.
 */
export async function buildEditedHtml(entry: TestEntry, js: string): Promise<string> {
  const response = await fetch(entry.htmlUrl);
  let html = await response.text();

  const moduleUrl = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
  const script = new RegExp(`<script\\b[^>]*src="[^"]*${escapeRegExp(entry.scriptBase)}\\.(?:js|ts)"[^>]*>\\s*</script>`);
  html = html.replace(script, `<script type="module" src="${moduleUrl}"></script>`);
  html = html.replace(/<head[^>]*>/i, (head) => `${head}<base href="${entry.baseUrl}">`);

  return html;
}
