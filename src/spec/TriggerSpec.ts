import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('A Trigger', () => {
  let scene: ex.Scene;
  let engine: ex.Engine;
  const mock = new Mocks.Mocker();
  let loop: Mocks.GameLoopLike;

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
    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100,
      repeat: 1
    });
    const actor = new ex.Actor(0, 0, 10, 10);
    actor.body.collider.type = ex.CollisionType.Active;
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
    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100,
      repeat: 3
    });
    const actor = new ex.Actor(0, 0, 10, 10);
    actor.body.collider.type = ex.CollisionType.Active;
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
    let fired = 0;

    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100
    });

    trigger.body.collider.type = ex.CollisionType.Passive;

    const actor = new ex.Actor(0, 0, 10, 10);
    actor.body.collider.type = ex.CollisionType.Active;
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
    let fired = 0;

    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100
    });

    const actor = new ex.Actor(0, 0, 10, 10);
    actor.body.collider.type = ex.CollisionType.Active;
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
    const trigger = new ex.Trigger({
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
    const trigger = new ex.Trigger({
      pos: new ex.Vector(200, 200),
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
    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      visible: true,
      width: 100,
      height: 100,
      filter: () => false
    });

    const actor = new ex.Actor(0, 100, 10, 10);

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
    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      visible: true,
      width: 100,
      height: 100,
      filter: () => true
    });

    const actor = new ex.Actor(0, 100, 10, 10);
    actor.body.collider.type = ex.CollisionType.Active;

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
    const actor = new ex.Actor(0, 100, 10, 10);
    const actor2 = new ex.Actor(0, 100, 10, 10);

    const trigger = new ex.Trigger({
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
