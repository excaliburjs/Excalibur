import sdk, { VM } from '@stackblitz/sdk';
import { useEffect, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const StackblitzPlayground = ({ code }: { code: string }) => {
  const { colorMode } = useColorMode();
  const embedRef = useRef<HTMLDivElement>();
  const vmRef = useRef<Promise<VM>>();

  useEffect(() => {
    if (embedRef.current && !vmRef.current) {
      vmRef.current = sdk.embedProject(embedRef.current,
        {
          title: 'Excalibur.js example',
          description: 'Blank starter project for building ES6 apps.',
          template: 'typescript',
          files: {
            'index.html': `
            <canvas id="game"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/excalibur/dist/excalibur.min.js"></script>
          `,
            'game.ts': `import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FillScreen,
  pointerScope: ex.PointerScope.Canvas,
  grabWindowFocus: false,
  scrollPreventionMode: ex.ScrollPreventionMode.None
});
      
export default game;`,
            'index.ts': `import * as ex from 'excalibur';
import game from './game';

${code}`
          },
          dependencies: {
            'excalibur': 'latest'
          }
        },
        {
          openFile: 'example.ts',
          hideExplorer: true,
          hideNavigation: true,
          hideDevTools: true,
          height: 400,
          theme: colorMode === 'dark' ? 'dark' : 'light'
        },
      );
    }
  }, []);

  useEffect(() => {
    if (vmRef.current) {
      vmRef.current.then(vm => {
        vm.editor.setTheme(colorMode === 'dark' ? 'dark' : 'light')
      });
    }
  }, [colorMode]);

  return (
    <div ref={embedRef} />
  )
}

function indentString(str: string, indent: number) {
  return str.split('\n').map(line => ' '.repeat(indent) + line).join('\n');
}

export default StackblitzPlayground;