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

    scene = new ex.Scene();
    engine.addScene('test', scene);
    engine.goToScene('test');

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
    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    actor.body.collisionType = ex.CollisionType.Active;
    actor.vel.y = 10;
    engine.currentScene.add(trigger);
    engine.currentScene.add(actor);
    spyOn(trigger, 'action');

    // Act
    actor.vel = ex.vec(0, 10);
    for (let i = 0; i < 20; i++) {
      engine.currentScene.update(engine, 1000);
    }

    actor.vel = ex.vec(0, -10);
    for (let i = 0; i < 20; i++) {
      engine.currentScene.update(engine, 1000);
    }

    actor.vel = ex.vec(0, 10);
    for (let i = 0; i < 20; i++) {
      engine.currentScene.update(engine, 1000);
    }

    // Assert
    expect(trigger.action).toHaveBeenCalledTimes(1);
    expect(trigger.isKilled()).toBe(true);
  });

  it('can be triggered multiple times', () => {
    // Arrange
    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100,
      repeat: 3
    });
    trigger.collider.update();
    const enterSpy = jasmine.createSpy('enter');
    const exitSpy = jasmine.createSpy('exit');
    trigger.on('enter', enterSpy);
    trigger.on('exit', exitSpy);

    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    actor.body.collisionType = ex.CollisionType.Active;
    actor.vel.y = 10;
    engine.currentScene.add(trigger);
    engine.currentScene.add(actor);
    spyOn(trigger, 'action').and.callThrough();

    // Act
    // Enter trigger first
    actor.vel.y = 10;
    for (let i = 0; i < 10; i++) {
      engine.currentScene.update(engine, 1000);
    }

    // Exit trigger first
    actor.vel.y = -10;
    for (let i = 0; i < 10; i++) {
      engine.currentScene.update(engine, 1000);
    }

    // Enter trigger second
    actor.vel.y = 10;
    for (let i = 0; i < 10; i++) {
      engine.currentScene.update(engine, 1000);
    }

    // Exit trigger second
    actor.vel.y = -10;
    for (let i = 0; i < 10; i++) {
      engine.currentScene.update(engine, 1000);
    }

    // Enter trigger third
    actor.vel.y = 10;
    for (let i = 0; i < 10; i++) {
      engine.currentScene.update(engine, 1000);
    }

    // The last enter also has an exit because the actor is killed
    // and no longer generates a pair, therefore exit

    // Assert
    expect(trigger.action).toHaveBeenCalledTimes(3);
    expect(enterSpy).toHaveBeenCalledTimes(3);
    expect(exitSpy).toHaveBeenCalledTimes(3);
    expect(trigger.isKilled()).toBe(true);
  });

  it('fires an event when an actor enters the trigger once', () => {
    // Arrange
    let fired = 0;

    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100
    });

    trigger.body.collisionType = ex.CollisionType.Passive;

    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    actor.body.collisionType = ex.CollisionType.Active;
    actor.vel.y = 10;

    trigger.on('collisionstart', (evt: ex.EnterTriggerEvent) => {
      fired++;
    });

    engine.add(trigger);
    engine.add(actor);

    // Act
    actor.vel = ex.vec(0, 10);
    for (let i = 0; i < 40; i++) {
      loop.advance(1000);
    }

    expect(fired).toBe(1);
  });

  it('fires an event when the actor exits the trigger', () => {
    // Arrange
    const trigger = new ex.Trigger({
      pos: new ex.Vector(0, 100),
      width: 100,
      height: 100
    });
    trigger.collider.update();

    const actor = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
    actor.body.collisionType = ex.CollisionType.Active;
    actor.vel.y = 10;

    engine.add(trigger);
    engine.add(actor);

    const exitSpy = jasmine.createSpy('exit');
    const collisionEnd = jasmine.createSpy('collisionend');
    trigger.on('exit', exitSpy);
    trigger.on('collisionend', collisionEnd);

    // Act
    actor.vel = ex.vec(0, 10);
    for (let i = 0; i < 40; i++) {
      loop.advance(1000);
    }

    // Assert
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(collisionEnd).toHaveBeenCalledTimes(1);
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
    trigger.collider.update();

    const actor = new ex.Actor({ x: 0, y: 100, width: 10, height: 10 });

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
    trigger.collider.update();

    const actor = new ex.Actor({ x: 0, y: 100, width: 10, height: 10 });
    actor.body.collisionType = ex.CollisionType.Active;
    actor.vel.y = 10;

    engine.add(trigger);
    engine.add(actor);
    spyOn(trigger, 'action').and.callThrough();

    // Act
    for (let i = 0; i < 2; i++) {
      loop.advance(1000);
    }

    // Assert
    expect(trigger.action).toHaveBeenCalled();
  });

  it('will only trigger on a target', () => {
    // Arrange
    const actor = new ex.Actor({ x: 0, y: 100, width: 10, height: 10 });
    const actor2 = new ex.Actor({ x: 0, y: 100, width: 10, height: 10 });

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
