import * as ex from '../../../build/dist/excalibur';

export namespace TestUtils {
  export function engine(options: ex.IEngineOptions = {}): ex.Engine {
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
    var game = new ex.Engine(options);

    return game;
  }
}
