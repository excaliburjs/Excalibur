import { DisplayMode, Engine, EngineOptions, KeyEvent, Keys, Logger, PointerScope } from '../engine';

interface HTMLCanvasElement {
  gameRef?: Engine;
}

/**
 *
 */
function isCanvasElement(el: any): el is HTMLCanvasElement {
  return el && el.nodeName === 'CANVAS';
}

let observer: MutationObserver;

/**
 * When Storybook unmounts story, make sure we cleanup the running game
 * to avoid weird state issues, or at least not to balloon memory.
 * @param records Change records
 */
const onDomMutated: MutationCallback = (records) => {
  if (records.length && records[0].removedNodes.length) {
    Array.from(records[0].removedNodes).forEach((node) => {
      if (isCanvasElement(node)) {
        console.debug('Stopping unmounted game', node.gameRef);
        node.gameRef?.stop();
        delete node.gameRef;
      }
    });
  }
};

/**
 * Helper to generate Storybook game engine instance
 * @param storyFn The storybook fn to pass the engine to
 * @param options Engine options to override the default behavior of the engine on storybook (see EngineOptions)
 */
export const withEngine = (storyFn: (game: Engine, args?: Record<string, any>) => void, options?: EngineOptions) => {
  if (!observer) {
    observer = new MutationObserver(onDomMutated);
    observer.observe(document.getElementById('storybook-root'), { childList: true, subtree: true });
  }

  return (args?: any) => {
    const canvas = document.createElement('canvas');
    const game = new Engine({
      canvasElement: canvas,
      displayMode: DisplayMode.FitScreen,
      suppressPlayButton: true,
      pointerScope: PointerScope.Canvas,
      ...options
    });

    Logger.getInstance().info('Press \'d\' for debug mode');

    game.input.keyboard.on('down', (keyDown?: KeyEvent) => {
      if (keyDown.key === Keys.D) {
        game.toggleDebug();
      }
    });

    storyFn(game, args);

    // store game ref
    (canvas as any).gameRef = game;

    return canvas;
  };
};

/**
 *
 */
function isNumberBasedEnum(e: any) {
  return Object.values(e).some((v) => typeof v === 'number');
}

/**
 * Helper to generate Storybook Control Select Options from a Enum Type
 * @param e Enum
 */
export const enumToControlSelectOptions = (e: any): unknown[] => {
  if (isNumberBasedEnum(e)) {
    return Object.values(e).filter((v) => typeof v === 'number');
  }

  return Object.values(e);
};

/**
 * Helper to generate Storybook Control Select Labels from a Enum Type
 * @param e Enum
 */
export const enumToControlSelectLabels = (e: any): string[] => {
  if (isNumberBasedEnum(e)) {
    return Object.keys(e).filter((k) => typeof e[k] === 'number');
  }
  return Object.keys(e);
};
