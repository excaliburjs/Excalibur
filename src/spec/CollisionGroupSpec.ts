/// <reference path="Mocks.ts" />

describe('A Collision Group', () => {
  var scene;
  var actor1;
  var actor2;
  var engine: ex.Engine;
  var mock = new Mocks.Mocker();

  beforeEach(() => {
    actor1 = new ex.Actor(100, 100, 100, 100);
    actor2 = new ex.Actor(100, 100, 100, 100);
    // Setting actor collision types to passive otherwise they push each other around
    actor1.collisionType = ex.CollisionType.Passive;
    actor2.collisionType = ex.CollisionType.Passive;

    scene.add(actor1);
    scene.add(actor2);
    engine = mock.engine(0, 0);
    scene = new ex.Scene(engine);
    engine.currentScene = scene;
  });
  /*
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
   });*/
});
