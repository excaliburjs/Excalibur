import * as ex from '@excalibur';
import { afterEach } from 'vitest';

const engines: ex.Engine[] = [];
afterEach(() => {
  for (const engine of engines.splice(0)) {
    engine.stop();
    engine.dispose();
  }
});

export namespace TestUtils {
  export function engine(options: ex.EngineOptions = {}, flags: string[] = ['suppress-obsolete-message']): ex.Engine {
    options = {
      width: 500,
      height: 500,
      suppressConsoleBootMessage: true,
      enableCanvasTransparency: true,
      suppressMinimumBrowserFeatureDetection: true,
      suppressHiDPIScaling: true,
      suppressPlayButton: true,
      snapToPixel: false,
      antialiasing: false,
      displayMode: ex.DisplayMode.Fixed,
      ...options
    };
    ex.Debug.clear();
    ex.Flags._reset();
    ex.Flags.enable('suppress-obsolete-message');
    flags.forEach((f) => ex.Flags.enable(f));
    const game = new ex.Engine(options);

    // keeps the pointer based tests consistent
    game.canvas.style.display = 'block';
    game.canvas.style.position = 'absolute';
    game.canvas.style.top = '0px';

    // Make all the clocks test clocks in the test utils
    game.clock.stop();
    game.clock = game.clock.toTestClock();

    (ex.WebAudio as any)._UNLOCKED = true;

    engines.push(game);
    return game;
  }
}
