import * as ex from '@excalibur';

export namespace TestUtils {
  /**
   * Builds an engine with testing switches on
   * @param options
   */
  export function engine(options: ex.EngineOptions = {}): ex.Engine {
    options = ex.Util.extend(
      false,
      {
        width: 500,
        height: 500,
        suppressConsoleBootMessage: true,
        enableCanvasTransparency: true,
        suppressMinimumBrowserFeatureDetection: true,
        suppressHiDPIScaling: true,
        suppressPlayButton: true,
        displayMode: ex.DisplayMode.Position,
        position: 'top'
      },
      options
    );
    const game = new ex.Engine(options);

    return game;
  }
}
