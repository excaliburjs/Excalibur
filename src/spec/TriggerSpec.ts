/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('A Trigger', () => {
   var scene: ex.Scene;
   var engine: ex.Engine;

   beforeEach(() => {
      engine = TestUtils.engine({ width: 600, height: 400 });
      scene = new ex.Scene(engine);      
   });

   afterEach(() => {
      engine.stop();
      engine = null;
   });

   it('should exist', () => {
      expect(ex.Trigger).toBeDefined();
   });

   it('can be triggered once', () => {
      // Arrange
      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         width: 100,
         height: 100,
         repeat: 1
      });
      var actor = new ex.Actor(0, 0, 10, 10);
      actor.collisionType = ex.CollisionType.Active;
      actor.vel.y = 10;
      engine.currentScene.add(trigger);
      engine.currentScene.add(actor);
      spyOn(trigger, 'action');

      // Act
      actor.vel.y = 10;
      for (let i = 0; i < 20; i++) {
         engine.currentScene.update(engine, 1000);
      }

      // Assert
      expect(trigger.action).toHaveBeenCalledTimes(1);
      
   });

});