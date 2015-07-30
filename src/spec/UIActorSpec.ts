/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />

describe('A UIActor', () => {
   var uiActor: ex.UIActor;
   var engine;
   var scene;
   
   beforeEach(() => {
      uiActor = new ex.UIActor();
      uiActor.collisionType = ex.CollisionType.Active;
      scene = new ex.Scene(engine);

      spyOn(scene, 'draw').andCallThrough();
      spyOn(uiActor, 'draw');

      // mock engine		
      engine = {
         collisionStrategy: 0,
         currentScene: scene,
         keys: [],
         clicks: [],
         mouseDown: [],
         mouseMove: [],
         mouseUp: [],
         touchStart: [],
         touchMove: [],
         touchEnd: [],
         touchCancel: [],
         width: 100,
         height: 100,
         canvas: {
            width: 100,
            clientWidth: 100,
            height: 100,
            clientHeight: 100
         },
         ctx: {
            canvas: {
               width: 100,
               height: 100
            },
            save: function() { /*do nothing*/ },
            restore: function() { /*do nothing*/ },
            translate: function() { /*do nothing*/ },
            rotate: function() { /*do nothing*/ },
            scale: function() { /*do nothing*/ }
         },
         getWidth: function() { return 100; },
         getHeight: function() { return 100; },
         camera: {
            getZoom: function() { return 1; }
         },
         worldToScreenCoordinates: ex.Engine.prototype.worldToScreenCoordinates,
         screenToWorldCoordinates: ex.Engine.prototype.screenToWorldCoordinates
      };
		
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

});