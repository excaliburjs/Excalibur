/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Core.ts" />

describe("A Collision Group", ()=>{

   var scene;
   var actor1;
   var actor2;
   var engine;

   beforeEach(()=>{
      scene = new ex.Scene();
      actor1 = new ex.Actor(100, 100, 100, 100);
      actor2 = new ex.Actor(100, 100, 100, 100);
      // Setting actor collision types to passive otherwise they push each other around
      actor1.collisionType = ex.CollisionType.Passive;
      actor2.collisionType = ex.CollisionType.Passive;
      
      scene.addChild(actor1);
      scene.addChild(actor2);
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
            height: 0,
         },
         camera: {
            getZoom: function(){return 1}
         },
         getWidth: function(){return 0},
         getHeight: function(){return 0},
         worldToScreenCoordinates: function(){
            return new ex.Point(0,0);
         },
         screenToWorldCoordinates: function(){
            return new ex.Point(0,0);
         }
      };
   });

   it("does not effect actors without collision groupings", ()=>{
      expect(actor1.collides(actor2)).not.toBe(ex.Side.None);
      expect(actor2.collides(actor1)).not.toBe(ex.Side.None);
   });

   it("handler should fire only on collision with registered group", ()=>{
      var collided = false;
      actor1.onCollidesWith('group', function(){
         collided = true;
      });

      // Ensure that the handler is not fired without collision groups
      expect(collided).toBe(false);
      scene.update(engine, 20);
      expect(collided).toBe(false);

      // Collision handler should fire
      actor2.addCollisionGroup('group');
      expect(collided).toBe(false);
      scene.update(engine, 20);
      expect(collided).toBe(true);

   });

   it("can fire with multiple handlers", ()=>{
      var collided1 = false;
      var collided2 = false;
      actor1.onCollidesWith('group1', function(){
         collided1 = true;
      });
      actor1.onCollidesWith('group2', function(){
         collided2 = true;
      });

      actor2.addCollisionGroup('group1');
      actor2.addCollisionGroup('group2');

      expect(collided1).toBe(false);
      expect(collided2).toBe(false);

      scene.update(engine, 30);

      expect(collided1).toBe(true);
      expect(collided2).toBe(true);
   });

   it("should pass back the collided actor in the callback", ()=>{

      var actor = null;
      actor1.onCollidesWith('group', (a)=>{
         actor = a;
      });
      actor2.addCollisionGroup('group');
      expect(actor).toBeFalsy();

      scene.update(engine, 30);

      expect(actor).toBe(actor2);
   });
});