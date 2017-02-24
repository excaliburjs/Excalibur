/// <reference path="../../build/dist/excalibur.d.ts" />


module TestUtils {

   export function engine(options: ex.IEngineOptions = {}): ex.Engine {
      options = ex.Util.extend(false, {
         canvasWidth: 500,
         canvasHeight: 500,
         suppressConsoleBootMessage: true,
         suppressMinimumBrowserFeatureDetection: true
      }, options);
      var game = new ex.Engine(options);

      return game;
   }

}