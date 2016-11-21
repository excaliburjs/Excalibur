/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('The engine', () => {
   var engine: ex.Engine;
   var scene: ex.Scene;   
   var mock = new Mocks.Mocker();
   var loop: Mocks.IGameLoop;

   beforeEach(() => {
      engine = new ex.Engine({
            width: 500,
            height: 500,
            suppressConsoleBootMessage: true,
            suppressMinimumBrowserFeatureDetection: true
         });   
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      loop = mock.loop(engine);
   });

   it('should emit a preframe event', (done) => {
      // engine.on('preframe', done);

      // loop.advance(100);
   });

});