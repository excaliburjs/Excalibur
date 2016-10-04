/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('A Collision', () => {
   var actor1: ex.Actor = null;
   var actor2: ex.Actor = null;
   var scene: ex.Scene = null;
   var engine: ex.Engine = null;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      engine = mock.engine(0, 0);
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      actor1 = new ex.Actor(0, 0, 10, 10);
      actor2 = new ex.Actor(5, 5, 10, 10);
      actor1.collisionType = ex.CollisionType.Active;
      actor2.collisionType = ex.CollisionType.Active;
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