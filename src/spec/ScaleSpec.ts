/// <reference path="jasmine.d.ts" />
/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="TestUtils.ts" />
/// <reference path="Mocks.ts" />

describe('A scaled and rotated actor', () => {
   var actor: ex.Actor;
   var engine: ex.Engine;
   var scene: ex.Scene;
   var mock = new Mocks.Mocker();
   
   beforeEach(() => {
      jasmine.addMatchers(imagediff.jasmine);

      actor = new ex.UIActor(50, 50, 100, 50);
      actor.color = ex.Color.Blue;
      actor.collisionType = ex.CollisionType.Active;
      engine = TestUtils.engine();

      
      scene = new ex.Scene(engine);
      engine.currentScene = scene;

      spyOn(scene, 'draw').and.callThrough();
      spyOn(actor, 'draw').and.callThrough();     
		
   });

   afterEach(() => {
      engine.stop();
   });
	
   
   it('is drawn coorectly scaled at 90 degrees', (done) => {            

      let game: ex.Engine = TestUtils.engine({ width: 800, height: 600 });
      game.setAntialiasing(false);
      let bg = new ex.Texture('src/spec/images/ScaleSpec/logo.png', true);
      
      game.start(new ex.Loader([bg])).then(() => {
         let actor = new ex.Actor(game.getDrawWidth() / 2 , game.getDrawHeight() / 2, 100, 100, ex.Color.Black);
         actor.addDrawing(bg);
         actor.setHeight(10);
         actor.scale.setTo(1, .2);
         game.add(actor);

         actor.rotation = Math.PI / 2;

         actor.on('postdraw', (ev: ex.PostDrawEvent) => {
            game.stop();
            imagediff.expectCanvasImageMatches('ScaleSpec/scale.png', game.canvas, done);            
         });
      });
      
   });

});