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
      engine = TestUtils.engine({ width: 800, height: 600 });
      engine.setAntialiasing(false);
      
      scene = new ex.Scene(engine);
      engine.currentScene = scene;

      spyOn(scene, 'draw').and.callThrough();
      spyOn(actor, 'draw').and.callThrough();     
		
   });

   afterEach(() => {
      engine.stop();
   });
	
   
   it('is drawn correctly scaled at 90 degrees', (done) => {                  
      
      let bg = new ex.Texture('src/spec/images/ScaleSpec/logo.png', true);
      
      engine.start(new ex.Loader([bg])).then(() => {
         let actor = new ex.Actor(engine.getDrawWidth() / 2 , engine.getDrawHeight() / 2, 100, 100, ex.Color.Black);
         actor.addDrawing(bg);
         actor.setHeight(10);
         actor.scale.setTo(1, .2);
         engine.add(actor);

         actor.rotation = Math.PI / 2;

         actor.on('postdraw', (ev: ex.PostDrawEvent) => {
            engine.stop();
            imagediff.expectCanvasImageMatches('ScaleSpec/scale.png', engine.canvas, done);            
         });
      });
      
   });

});