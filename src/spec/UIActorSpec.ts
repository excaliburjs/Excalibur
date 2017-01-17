/// <reference path="jasmine.d.ts" />
/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="TestUtils.ts" />
/// <reference path="Mocks.ts" />

describe('A UIActor', () => {
   var uiActor: ex.UIActor;
   var engine: ex.Engine;
   var scene: ex.Scene;
   var mock = new Mocks.Mocker();
   
   beforeEach(() => {
      jasmine.addMatchers(imagediff.jasmine);

      uiActor = new ex.UIActor(50, 50, 100, 50);
      uiActor.color = ex.Color.Blue;
      uiActor.collisionType = ex.CollisionType.Active;
      engine = TestUtils.engine();

      
      scene = new ex.Scene(engine);
      engine.currentScene = scene;

      spyOn(scene, 'draw').and.callThrough();
      spyOn(uiActor, 'draw').and.callThrough();     
		
   });

   afterEach(() => {
      engine.stop();
   });
	
   it('is drawn when visible', () => {
      uiActor.visible = true;

      scene.add(uiActor);
      scene.draw(engine.ctx, 100);

      expect(uiActor.draw).toHaveBeenCalled();				
   });

   it('is not drawn when not visible', () => {
      uiActor.visible = false;

      scene.add(uiActor);
      scene.draw(engine.ctx, 100);

      expect(uiActor.draw).not.toHaveBeenCalled();				
   });

   it('is drawn on the screen when visible', (done) => {
        uiActor.visible = true;
        scene.add(uiActor);
        scene.draw(engine.ctx, 100);

        imagediff.expectCanvasImageMatches('UIActorSpec/actordraws.png', engine.canvas, done);
   });

   it('is not drawn on the screen when not visible', (done) => {
      uiActor.visible = false;
      scene.add(uiActor);
      scene.draw(engine.ctx, 100);
      
      imagediff.expectCanvasImageMatches('UIActorSpec/actordoesnotdraw.png', engine.canvas, done);
   });

   it('is drawn on the top left with empty constructor', (done) => {
            
      ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

      let game = TestUtils.engine({ width: 720, height: 480 });
      let bg = new ex.Texture('src/spec/images/UIActorSpec/emptyctor.png', true);
      let loader = new ex.Loader();

      loader.addResource(bg);

      let uiActor = new ex.UIActor();
      uiActor.addDrawing(bg);
      game.add(uiActor);

      uiActor.on('postdraw', (ev: ex.PostDrawEvent) => {
         var imgData = ev.ctx.getImageData(0, 0, 1, 1).data;
         console.log('uiactor postdraw, rgba:', imgData[0], imgData[1], imgData[2], imgData[3]);
      });

      game.on('postframe', (ev) => {   
         console.log('engine postframe', ev.stats.id);

         if (ev.stats.id > 9) {
            
            imagediff.expectCanvasImageMatches('UIActorSpec/emptyctor.png', game.canvas, done);
            game.stop();        
         }    
      });

      game.start(loader);
      
   });

});