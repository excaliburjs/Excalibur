/// <reference path="Mocks.ts" />

describe('A Trigger', () => {
   var scene: ex.Scene;
   var engine: ex.Engine;
   var mock = new Mocks.Mocker();
   var loop: Mocks.IGameLoop;

   beforeEach(() => {
      engine = TestUtils.engine({ width: 600, height: 400 });
      
      scene = new ex.Scene(engine);

      loop = mock.loop(engine);
      engine.start();
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

      actor.vel.y = -10;
      for (let i = 0; i < 20; i++) {
         engine.currentScene.update(engine, 1000);
      }

      actor.vel.y = 10;
      for (let i = 0; i < 20; i++) {
         engine.currentScene.update(engine, 1000);
      }

      // Assert
      expect(trigger.action).toHaveBeenCalledTimes(1);
      
   });

   it('can be triggered multiple times', () => {
      // Arrange
      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         width: 100,
         height: 100,
         repeat: 3
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

      actor.vel.y = -10;
      for (let i = 0; i < 20; i++) {
         engine.currentScene.update(engine, 1000);
      }

      actor.vel.y = 10;
      for (let i = 0; i < 20; i++) {
         engine.currentScene.update(engine, 1000);
      }

      // Assert
      expect(trigger.action).toHaveBeenCalledTimes(3);

   });

   it('fires an event when an actor enters the trigger once', () => {
      // Arrange 
      var fired = 0;

      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         width: 100,
         height: 100
      });

      trigger.collisionType = ex.CollisionType.Passive;

      var actor = new ex.Actor(0, 0, 10, 10);
      actor.collisionType = ex.CollisionType.Active;
      actor.vel.y = 10;


      trigger.on('collisionstart', (evt: ex.EnterTriggerEvent) => {
         fired++;
      });

      engine.add(trigger);
      engine.add(actor);

      // Act
      actor.vel.y = 10;
      for (let i = 0; i < 40; i++) {
         loop.advance(1000);
      }

      expect(fired).toBe(1);

   });

   it('fires an event when the actor exits the trigger', () => {
      // Arrange 
      var fired = 0;

      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         width: 100,
         height: 100
      });

      var actor = new ex.Actor(0, 0, 10, 10);
      actor.collisionType = ex.CollisionType.Active;
      actor.vel.y = 10;

      engine.add(trigger);
      engine.add(actor);

      trigger.on('collisionend', (evt: ex.ExitTriggerEvent) => {
         fired++;
      });

      // Act
      actor.vel.y = 10;
      for (let i = 0; i < 40; i++) {
         loop.advance(1000);
      }

      // Assert
      expect(fired).toBe(1);
      
   });

   it('does not draw by default', () => {
      // Arrange
      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         width: 100,
         height: 100
      });

      engine.add(trigger);

      spyOn(trigger, 'draw');
      // Act
      for (let i = 0; i < 2; i++) {
         loop.advance(1000);
      }

      // Assert
      expect(trigger.draw).not.toHaveBeenCalled();
   });

   it('can draw if directed', () => {
      // Arrange
      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         visible: true,
         width: 100,
         height: 100
      });

      engine.add(trigger);

      spyOn(trigger, 'draw');
      // Act
      for (let i = 0; i < 2; i++) {
         loop.advance(1000);
      }

      // Assert
      expect(trigger.draw).toHaveBeenCalled();
   });

   it('will only trigger if the filter is false', () => {
      // Arrange
      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         visible: true,
         width: 100,
         height: 100,
         filter: () => false
      });

      var actor = new ex.Actor(
         0, 100,
         10, 10
      );

      engine.add(trigger);
      engine.add(actor);
      spyOn(trigger, 'action');

      // Act
      for (let i = 0; i < 2; i++) {
         loop.advance(1000);
      }

      // Assert
      expect(trigger.action).not.toHaveBeenCalled();
   });

   it('will not only trigger if the filter is true', () => {
      // Arrange
      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         visible: true,
         width: 100,
         height: 100,
         filter: () => true
      });

      var actor = new ex.Actor(
         0, 100,
         10, 10
      );
      actor.collisionType = ex.CollisionType.Active;

      engine.add(trigger);
      engine.add(actor);
      spyOn(trigger, 'action');

      // Act
      for (let i = 0; i < 2; i++) {
         loop.advance(1000);
      }

      // Assert
      expect(trigger.action).toHaveBeenCalled();
   });

   it('will only trigger on a target', () => {
      // Arrange
      var actor = new ex.Actor(
         0, 100,
         10, 10
      );
      var actor2 = new ex.Actor(
         0, 100,
         10, 10
      );

      var trigger = new ex.Trigger({
         pos: new ex.Vector(0, 100),
         visible: true,
         width: 100,
         height: 100,
         target: actor
      });

      engine.add(trigger);
      engine.add(actor2);
      spyOn(trigger, 'action');

      // Act
      for (let i = 0; i < 2; i++) {
         loop.advance(1000);
      }

      // Assert
      expect(trigger.action).not.toHaveBeenCalled();
      expect(trigger.target).toBe(actor);
   });

});