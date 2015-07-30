/// <reference path="jasmine.d.ts" />
/// <reference path="../engine/Engine.ts" />


describe('A Collision', () => {
   var actor1 = null;
   var actor2 = null;
   var scene = null;
   var engine = null;
   beforeEach(() => {

      
      // mock engine    
      engine = {
         currentScene : scene,
         keys: [],
         clicks: [],
         mouseDown: [],
         mouseMove: [],
         mouseUp: [],
         touchStart: [],
         touchMove: [],
         touchEnd: [],
         touchCancel: [],
         canvas: {
            width: 0,
            height: 0
         },
         getWidth: function () { return 0; },
         getHeight: function () { return 0; },
         camera: {
            getZoom: function () { return 1; }
         },
         worldToScreenCoordinates: function(){
            return new ex.Point(0, 0);
         },
         screenToWorldCoordinates: function(){
            return new ex.Point(0, 0);
         }
      };
      scene = new ex.Scene(engine);
      actor1 = new ex.Actor(0, 0, 10, 10);
      actor2 = new ex.Actor(0, 0, 10, 10);
      actor1.collisionType = ex.CollisionType.Fixed;
      actor2.collisionType = ex.CollisionType.Fixed;
      scene.add(actor1);
      scene.add(actor2);
   });

   it('should throw one event for each actor participating', () => {
      var numCollisions = 0;
      actor1.on('collision', (e: ex.CollisionEvent) => {
         e.other.kill();
         numCollisions++;
      });

      actor2.on('collision', (e: ex.CollisionEvent) => {         
         numCollisions++;
      });
      scene.update(engine, 20);
      scene.update(engine, 20);
      scene.update(engine, 20);
      scene.update(engine, 20);
      expect(numCollisions).toBe(2);
   });

});