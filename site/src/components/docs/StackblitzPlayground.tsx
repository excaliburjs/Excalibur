import sdk, { VM } from '@stackblitz/sdk';
import { useEffect, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const StackblitzPlayground = ({ code, title, assets = {} }: { title: string; code: string; assets?: Record<string, string> }) => {
  const { colorMode } = useColorMode();
  const embedRef = useRef<HTMLDivElement>();
  const vmRef = useRef<Promise<VM>>();

  useEffect(() => {
    if (embedRef.current && !vmRef.current) {
      vmRef.current = buildFileAssets(assets).then(({ assetFiles }) => {
        return sdk.embedProject(embedRef.current,
          {
            title: title || 'Excalibur.js example',
            description: 'Blank starter project for building ES6 apps.',
            template: 'typescript',
            files: {
              'index.html': `<canvas id="game"></canvas>`,
              'game.ts': `import * as ex from './excalibur';

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
              'index.ts': `import * as ex from './excalibur';
import game from './game';
  
${code}`,
              'index.d.ts': `/// <reference types="excalibur" />`,
              ...assetFiles
            },
            dependencies: {
              'excalibur': 'latest'
            }
          },
          {
            openFile: 'index.ts',
            clickToLoad: true,
            hideExplorer: false,
            hideNavigation: true,
            hideDevTools: false,
            height: 400,
            theme: colorMode === 'dark' ? 'dark' : 'light'
          },
        );
      });
    }
  }, []);

  useEffect(() => {
    if (vmRef.current) {
      vmRef.current.then((vm) => {
        vm.editor.setTheme(colorMode === 'dark' ? 'dark' : 'light')
      }, (err) => {
        console.log('Could not set Stackblitz theme', err);
      });
    }
  }, [colorMode]);

  return (
    <div ref={embedRef} />
  )
}

async function buildFileAssets(assets: Record<string, string>) {
  // player-run.png: "/assets/images/player-run-43f110652c0efed153e43ba4126a14a2.png"

  assets['excalibur.js'] = '/excalibur.js';

  if (Object.values(assets).length === 0) {
    return { assetFiles: {} };
  }

  const assetPromises = Object.entries(assets).reduce((acc, [name, url]) => {

    if (name === 'excalibur.js') {
      acc[name] = fetch(url).then(res => res.text()).then(rawScript => {
        const script = stripWebpackHmrDevServerRequire(rawScript);
        return `// @ts-nocheck\n\n${script}`;
      });
    } else {
      acc[name] = fetch(url).then(res => res.blob()).then(blob => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
    }
    return acc;
  }, {} as Record<string, Promise<string>>);

  await Promise.all(Object.values(assetPromises));

  const assetFiles: Record<string, string> = {};

  for (const [name, assetPromise] of Object.entries(assetPromises)) {
    const asset = await assetPromise;

    if (name.endsWith('.js')) {
      assetFiles[`${name.split('.')[0]}.ts`] = asset;
    } else {
      assetFiles[`${name}.ts`] = `export default '${asset}';`;
    }
  }

  return {
    assetFiles: {
      'files.d.ts': `declare module '*.png' {
        const value: string;
        export default value;
      }
      
      declare module '*.mp3';
      declare module '*.svg';`,
      ...assetFiles
    },
  }
}

function stripWebpackHmrDevServerRequire(script: string) {
  return script.replace(/__webpack_require__\((448|825)\);/g, '');
}

export default StackblitzPlayground;