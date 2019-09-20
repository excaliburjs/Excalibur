import { Engine, DisplayMode } from '../engine';

/**
 * Helper to generate Storybook game engine instance
 * @param storyFn The storybook fn to pass the engine to
 */
export const withEngine = (storyFn: (game: Engine) => void) => {
  return () => {
    const canvas = document.createElement('canvas');
    const game = new Engine({ canvasElement: canvas, displayMode: DisplayMode.FullScreen, suppressPlayButton: true });

    storyFn(game);

    return canvas;
  };
};
