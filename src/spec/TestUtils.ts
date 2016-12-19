/// <reference path="../../build/dist/excalibur.d.ts" />


module TestUtils {

   export function engine(options: ex.IEngineOptions = {}): ex.Engine {
      options = ex.Util.extend(false, options, {
         width: 500,
         height: 500,
         suppressConsoleBootMessage: true,
         suppressMinimumBrowserFeatureDetection: true
      });
      var game = new ex.Engine(options);

      return game;
   }

}