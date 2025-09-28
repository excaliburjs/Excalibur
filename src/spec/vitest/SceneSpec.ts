import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

describe('A scene', () => {
  let actor: ex.Actor;
  let engine: ex.Engine;
  let scene: ex.Scene;
  let clock: ex.TestClock;

  beforeEach(async () => {
    actor = new ex.Actor();
    engine = TestUtils.engine({ width: 100, height: 100 });
    scene = new ex.Scene();

    vi.spyOn(scene, 'draw');
    engine.addScene('newScene', scene);
    engine.goToScene('newScene');
    await TestUtils.runToReady(engine);

    clock = engine.clock as ex.TestClock;
    clock.step(100);
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('should be loaded', () => {
    expect(ex.Scene).toBeTruthy();
  });

  it('can have a background color set', async () => {
    engine.backgroundColor = ex.Color.Black;

    const newScene = new ex.Scene();
    newScene.backgroundColor = ex.Color.Yellow;

    engine.addScene('background', newScene);
    await engine.goToScene('background');

    (engine as any)._draw(100);

    expect(engine.graphicsContext.backgroundColor).toEqual(ex.Color.Yellow);
    expect(engine.graphicsContext.backgroundColor).toEqual(newScene.backgroundColor);
  });

  it('cannot have the same ScreenElement added to it more than once', () => {
    engine.goToScene('root');
    const screenElement = new ex.ScreenElement();
    scene.add(screenElement);
    expect(scene.actors.length).toBe(1);
    scene.add(screenElement);
    expect(scene.actors.length).toBe(1);
  });

  it('cannot have the same Actor added to it more than once', () => {
    scene.add(actor);
    expect(scene.actors.length).toBe(1);
    scene.add(actor);
    expect(scene.actors.length).toBe(1);
  });

  it('can clear all entities and timers', () => {
    const actor1 = new ex.Actor();
    const actor2 = new ex.Actor();
    const actor3 = new ex.Actor();
    const timer = new ex.Timer({
      interval: 300
    });
    scene.add(actor1);
    scene.add(actor2);
    scene.add(actor3);
    scene.add(timer);

    expect(scene.entities.length).toBe(3);
    expect(scene.timers.length).toBe(1);
    scene.clear();

    expect(scene.entities.length, 'deferred entity removal means entities cleared at end of update').toBe(3);
    expect(scene.timers.length, "timers don't have deferred removal").toBe(0);

    scene.update(engine, 100);
    expect(scene.entities.length).toBe(0);
    expect(scene.timers.length).toBe(0);
  });

  it('cannot have the same TileMap added to it more than once', () => {
    const tileMap = new ex.TileMap({ pos: ex.vec(1, 1), tileWidth: 1, tileHeight: 1, columns: 1, rows: 1 });
    scene.add(tileMap);
    expect(scene.tileMaps.length).toBe(1);
    scene.add(tileMap);
    expect(scene.tileMaps.length).toBe(1);
  });

  it('draws onscreen Actors', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 0;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('draws onscreen Actors left', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      name: 'Left',
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = -4;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });
  it('does not draw offscreen Actors left', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = -6;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors top', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 0;
    actor.pos.y = -4;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors top', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 0;
    actor.pos.y = -6;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors right', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 104;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors right', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 106;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors bottom', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 0;
    actor.pos.y = 104;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors bottom', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = vi.fn();
    actor.pos.x = 0;
    actor.pos.y = 106;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen, 'Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('does not draw offscreen Actors', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 5,
      height: 5
    });
    actor.pos.x = 1000;
    actor.pos.y = 1000;
    scene.update(engine, 100);
    expect(actor.isOffScreen).toBeFalsy();

    actor.pos.x = 1010;
    actor.pos.y = 1010;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(scene.camera.getFocus().x).toBe(50);
    expect(scene.camera.getFocus().y).toBe(50);
    expect(engine.worldToScreenCoordinates(new ex.Vector(50, 50)).x).toBe(50);
    expect(engine.worldToScreenCoordinates(new ex.Vector(50, 50)).y).toBe(50);
    expect(engine.drawWidth).toBe(100);
    expect(engine.drawHeight).toBe(100);

    expect(actor.isOffScreen).toBeTruthy();
  });

  it('draws visible Actors', () => {
    engine.goToScene('root');
    actor.graphics.visible = true;
    actor.graphics.onPostDraw = vi.fn();

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw invisible actors', () => {
    engine.goToScene('root');
    actor.graphics.visible = false;
    actor.graphics.onPostDraw = vi.fn();

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('initializes after start or play in first update', async () => {
    const scene = new ex.Scene();
    vi.spyOn(scene, 'onInitialize');

    engine.addScene('otherScene', scene);
    expect(scene.onInitialize).toHaveBeenCalledTimes(0);

    await engine.goToScene('otherScene');

    expect(scene.onInitialize).toHaveBeenCalledTimes(1);
  });

  it('calls onActivate and onDeactivate with the correct args', async () => {
    const sceneA = new ex.Scene();
    sceneA.onDeactivate = vi.fn();
    const sceneB = new ex.Scene();
    sceneB.onActivate = vi.fn();

    engine.addScene('sceneA', sceneA);
    engine.addScene('sceneB', sceneB);

    await engine.goToScene('sceneA');

    await engine.goToScene('sceneB', { sceneActivationData: { foo: 'bar' } });

    expect(sceneA.onDeactivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      nextScene: sceneB
    });
    expect(sceneB.onActivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      nextScene: sceneB,
      data: { foo: 'bar' }
    });
  });

  it('calls onActivate and onDeactivate with the correct args (with deactivation data)', async () => {
    const sceneA = new ex.Scene();
    sceneA.onDeactivate = vi.fn(() => {
      return 'SomeDeactivationData';
    });
    const sceneB = new ex.Scene();
    sceneB.onActivate = vi.fn();

    engine.addScene('sceneA', sceneA);
    engine.addScene('sceneB', sceneB);

    await engine.goToScene('sceneA');

    await engine.goToScene('sceneB', { sceneActivationData: { foo: 'bar' } });

    expect(sceneA.onDeactivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      nextScene: sceneB
    });
    expect(sceneB.onActivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      previousSceneData: 'SomeDeactivationData',
      nextScene: sceneB,
      data: { foo: 'bar' }
    });
  });

  it('calls onActivate and onDeactivate with the correct args (with ASYNC deactivation data)', async () => {
    const sceneA = new ex.Scene();
    sceneA.onDeactivate = vi.fn(() => {
      return 'SomeDeactivationData';
    });
    const sceneB = new ex.Scene();
    sceneB.onActivate = vi.fn();

    engine.addScene('sceneA', sceneA);
    engine.addScene('sceneB', sceneB);

    await engine.goToScene('sceneA');

    await engine.goToScene('sceneB', { sceneActivationData: { foo: 'bar' } });

    expect(sceneA.onDeactivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      nextScene: sceneB
    });
    expect(sceneB.onActivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      previousSceneData: 'SomeDeactivationData',
      nextScene: sceneB,
      data: { foo: 'bar' }
    });
  });

  it('fires initialize before activate', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = null;
      engine = TestUtils.engine({ width: 100, height: 100 });
      const scene = new ex.Scene();

      engine.removeScene('otherScene');
      engine.addScene('otherScene', scene);

      let initialized = false;
      scene.once('initialize', (evt: ex.InitializeEvent) => {
        initialized = true;
      });
      scene.once('activate', (evt: ex.ActivateEvent) => {
        expect(initialized, 'Initialization should happen before activation').toBe(true);
        done();
      });

      engine.goToScene('otherScene');
      engine.start();
      const clock = engine.clock as ex.TestClock;
      clock.step(100);
    }));

  it.skip('fires initialize before actor initialize before activate', () =>
    new Promise<void>((done) => {
      engine.stop();
      engine.dispose();
      engine = null;
      engine = TestUtils.engine({ width: 100, height: 100 });
      scene = new ex.Scene();

      engine.removeScene('otherScene');
      engine.addScene('otherScene', scene);

      let sceneInitialized = false;
      const sceneActivated = false;
      let actorInitialized = false;
      scene.once('initialize', (evt) => {
        sceneInitialized = true;
        expect(actorInitialized, 'Actor should be initialized before scene initialization').toBe(true);
      });
      const actor = new ex.Actor();
      actor.once('initialize', (evt) => {
        actorInitialized = true;
      });

      scene.once('activate', (evt) => {
        expect(actorInitialized, 'Actor should be initialized before scene is activated').toBe(true);
        done();
      });

      scene.add(actor);
      engine.goToScene('otherScene');
      engine.start();
      const clock = engine.clock as ex.TestClock;
      clock.step(100);
      engine.dispose();
    }));

  it('can only be initialized once', async () => {
    engine.stop();
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);
    scene = new ex.Scene();

    engine.addScene('newScene', scene);

    const initSpy = vi.fn();
    scene.on('initialize', initSpy);

    await engine.goToScene('newScene');
    scene.update(engine, 100);
    scene.update(engine, 100);
    await scene._initialize(engine);
    await scene._initialize(engine);
    await scene._initialize(engine);

    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it('should initialize before actors in the scene', async () => {
    engine.stop();
    engine.dispose();
    engine = null;
    engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);
    const clock = engine.clock as ex.TestClock;
    clock.step(1);
    scene = new ex.Scene();
    engine.addScene('newScene', scene);

    const actor = new ex.Actor();
    scene.add(actor);
    let sceneInit = false;
    scene.onInitialize = () => {
      sceneInit = true;
    };
    actor.onInitialize = () => {
      expect(sceneInit, 'Scene should be initialized first before any actors').toBe(true);
    };

    await engine.goToScene('newScene');

    clock.step(1);
    scene.update(engine, 100);
    engine.dispose();
  });

  it('should allow adding and removing an Actor in same frame', () => {
    let removed = false;
    scene.add(actor);
    actor.on('postupdate', () => {
      scene.remove(actor);
      removed = true;
    });
    scene.update(engine, 10);

    expect(removed, 'Actor postupdate was not called').toBe(true);
    expect(scene.actors.indexOf(actor)).toBe(-1);
  });

  it('should allow adding and killing an Actor in same frame', () => {
    let removed = false;
    scene.add(actor);
    actor.on('postupdate', () => {
      actor.kill();
      removed = true;
    });
    scene.update(engine, 10);

    expect(removed, 'Actor postupdate was not called').toBe(true);
    expect(scene.actors.indexOf(actor)).toBe(-1);
  });

  it('should allow another Actor to add and remove a different Actor in same frame', () => {
    let removed = false;
    const otherActor = new ex.Actor();
    scene.add(otherActor);

    otherActor.on('initialize', () => {
      scene.add(actor);
    });
    otherActor.on('postupdate', () => {
      scene.remove(actor);
      removed = true;
    });
    scene.update(engine, 10);

    expect(removed, 'Actor postupdate was not called').toBe(true);
    expect(scene.actors.indexOf(actor)).toBe(-1);
    expect(scene.actors.length).toBe(1);
  });

  it('should allow another Actor to add and kill a different Actor in same frame', () => {
    let removed = false;
    const otherActor = new ex.Actor();
    scene.add(otherActor);
    otherActor.on('initialize', () => {
      scene.add(actor);
    });
    otherActor.on('postupdate', () => {
      actor.kill();
      removed = true;
    });
    scene.update(engine, 10);

    expect(removed, 'Actor postupdate was not called').toBe(true);
    expect(scene.actors.indexOf(actor)).toBe(-1);
    expect(scene.actors.length).toBe(1);
  });

  it('will still be in the draw tree if it is killed and then added in the same frame', () => {
    const actor = new ex.Actor();
    scene.add(actor);
    actor.kill();
    scene.add(actor);

    scene.update(engine, 10); // deferred removals are processed

    expect(scene.actors.indexOf(actor)).toBe(0);
    expect(scene.actors.length).toBe(1);
  });

  it('can have actors transferred to another scene', () => {
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    const actor = new ex.Actor();

    const entityRemoved = vi.fn();
    const entityAdded = vi.fn();

    scene1.on('entityremoved', entityRemoved);
    scene2.on('entityadded', entityAdded);

    scene1.add(actor);

    expect(actor.scene).toBe(scene1);
    expect(scene1.contains(actor)).toBe(true);
    expect(scene2.contains(actor)).toBe(false);

    scene2.transfer(actor);

    expect(actor.scene).toBe(scene2);
    expect(scene1.contains(actor)).toBe(false);
    expect(scene2.contains(actor)).toBe(true);

    expect(entityAdded).toHaveBeenCalledTimes(1);
    expect(entityRemoved).toHaveBeenCalledTimes(1);
  });

  it('can transfer timers', () => {
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    const timer = new ex.Timer({
      fcn: () => {
        /* pass */
      },
      interval: 100
    });

    const entityRemoved = vi.fn();
    const entityAdded = vi.fn();

    scene1.on('entityremoved', entityRemoved);
    scene2.on('entityadded', entityAdded);

    scene1.add(timer);

    expect(timer.scene).toBe(scene1);
    expect(scene1.timers.includes(timer)).toBe(true);
    expect(scene2.timers.includes(timer)).toBe(false);

    scene2.transfer(timer);

    expect(timer.scene).toBe(scene2);
    expect(scene1.timers.includes(timer)).toBe(false);
    expect(scene2.timers.includes(timer)).toBe(true);

    expect(entityAdded).toHaveBeenCalledTimes(1);
    expect(entityRemoved).toHaveBeenCalledTimes(1);
  });

  it('can have timers added and retrieved', () => {
    const timer = new ex.Timer({
      repeats: true,
      interval: 1000
    });
    const timer2 = new ex.Timer({
      repeats: true,
      interval: 1000
    });
    scene.add(timer);
    scene.add(timer2);
    expect(scene.timers).toEqual([timer, timer2]);
  });

  it('will update Actors that were added in a Timer callback', () => {
    let updated = false;
    let initialized = false;
    const actor = new ex.Actor();
    actor.on('initialize', () => {
      initialized = true;
    });
    actor.on('postupdate', () => {
      updated = true;

      expect(initialized, 'Actor was not initialized before calling update').toBe(true);
    });
    actor.on('postdraw', () => {
      expect(updated, 'Actor was not updated before calling draw').toBe(true);
      expect(initialized, 'Actor was not initialized before calling draw').toBe(true);
    });

    // create Timer
    const timer = new ex.Timer({
      interval: 10,
      fcn: () => {
        scene.add(actor);
      },
      repeats: false
    });

    scene.add(timer);
    timer.start();
    scene.update(engine, 11);
    scene.draw(engine.graphicsContext, 11);

    expect(scene.actors.indexOf(actor), 'Actor was not added to scene').toBeGreaterThan(-1);
    expect(initialized, 'Actor was not initialized after timer callback').toBe(true);
    expect(updated, 'Actor was not updated after timer callback').toBe(true);
  });

  it('will update ScreenElement that were added in a Timer callback', () => {
    let updated = false;
    let initialized = false;
    const actor = new ex.ScreenElement();
    actor.on('initialize', () => {
      initialized = true;
    });
    actor.on('postupdate', () => {
      updated = true;

      expect(initialized, 'ScreenElement was not initialized before calling update').toBe(true);
    });
    actor.on('postdraw', () => {
      expect(updated, 'ScreenElement was not updated before calling draw').toBe(true);
      expect(initialized, 'ScreenElement was not initialized before calling draw').toBe(true);
    });

    // create Timer
    const timer = new ex.Timer({
      interval: 10,
      fcn: () => {
        scene.add(actor);
      },
      repeats: false
    });

    scene.add(timer);
    timer.start();
    scene.update(engine, 11);
    scene.draw(engine.graphicsContext, 11);

    expect(scene.actors.indexOf(actor), 'ScreenElement was not added to scene').toBeGreaterThan(-1);
    expect(initialized, 'ScreenElement was not initialized after timer callback').toBe(true);
    expect(updated, 'ScreenElement was not updated after timer callback').toBe(true);
  });

  it('will kill the actor if the actor is removed from the scene', () => {
    scene.add(actor);

    vi.spyOn(actor, 'kill');

    scene.remove(actor);

    expect(actor.isKilled()).toBe(true);
    expect(actor.kill).toHaveBeenCalledTimes(1);
  });

  it('will not kill the actor if it is already dead', () => {
    scene.add(actor);
    actor.active = false;

    vi.spyOn(actor, 'kill');

    scene.remove(actor);
    expect(actor.kill).toHaveBeenCalledTimes(0);
  });

  it('will remove an actor from a scene if actor is killed', () => {
    scene.add(actor);
    vi.spyOn(scene, 'remove');

    actor.kill();
    scene.update(engine, 100);
    expect(scene.actors).not.toContain(actor);
    expect(actor.isKilled()).toBe(true);
  });

  it('will update TileMaps that were added in a Timer callback', () => {
    let updated = false;
    const tilemap = new ex.TileMap({ pos: ex.vec(0, 0), tileWidth: 1, tileHeight: 1, columns: 1, rows: 1 });
    tilemap._initialize(scene.engine);
    tilemap.on('postupdate', () => {
      updated = true;
    });
    tilemap.on('postdraw', () => {
      expect(updated, 'TileMap was not updated before calling draw').toBe(true);
    });

    // create Timer
    const timer = new ex.Timer({
      interval: 10,
      fcn: () => {
        scene.add(tilemap);
      },
      repeats: false
    });

    scene.add(timer);
    timer.start();
    scene.update(engine, 11);
    scene.draw(engine.graphicsContext, 11);

    expect(scene.tileMaps.indexOf(tilemap), 'TileMap was not added to scene').toBeGreaterThan(-1);
    expect(updated, 'TileMap was not updated after timer callback').toBe(true);
  });

  it('will return true if it is the current engine scene', () => {
    engine.goToScene('root');
    expect(scene.isCurrentScene()).toBe(true);
  });

  it('will not be the current scene if no engine is given', () => {
    const otherScene = new ex.Scene();
    expect(otherScene.isCurrentScene()).toBe(false);
  });

  it('will not be the current scene if the scene was switched', async () => {
    const otherScene = new ex.Scene();
    await engine.goToScene('root');
    engine.addScene('secondaryScene', otherScene);
    await engine.goToScene('secondaryScene');

    expect(scene.isCurrentScene()).toBe(false);
    expect(otherScene.isCurrentScene()).toBe(true);
  });

  describe('lifecycle overrides', () => {
    let scene: ex.Scene;
    let engine: ex.Engine;
    beforeEach(() => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      scene = new ex.Scene();
      engine.removeScene('newScene');
      engine.addScene('newScene', scene);
    });

    afterEach(() => {
      engine.stop();
      engine.dispose();
      engine = null;
      scene = null;
    });

    it('can have onInitialize overridden safely', async () => {
      const clock = engine.clock as ex.TestClock;
      let initCalled = false;
      scene.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      scene.on('initialize', () => {
        initCalled = true;
      });

      vi.spyOn(scene, 'onInitialize');

      await TestUtils.runToReady(engine);
      await engine.goToScene('newScene');
      clock.step(100);

      expect(initCalled).toBe(true);
      expect(scene.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', async () => {
      await scene._initialize(engine);
      scene.onPostUpdate = (engine, elapsedMs) => {
        expect(engine).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(scene, 'onPostUpdate');
      vi.spyOn(scene, '_postupdate');

      scene.update(engine, 100);
      scene.update(engine, 100);

      expect(scene._postupdate).toHaveBeenCalledTimes(2);
      expect(scene.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', async () => {
      await scene._initialize(engine);
      scene.onPreUpdate = (engine, elapsedMs) => {
        expect(engine).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(scene, 'onPreUpdate');
      vi.spyOn(scene, '_preupdate');

      scene.update(engine, 100);
      scene.update(engine, 100);

      expect(scene._preupdate).toHaveBeenCalledTimes(2);
      expect(scene.onPreUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreDraw overridden safely', async () => {
      await scene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      scene.onPreDraw = (ctx, elapsedMs) => {
        expect(<any>ctx).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(scene, 'onPreDraw');
      vi.spyOn(scene, '_predraw');

      scene.draw(engine.graphicsContext, 100);
      scene.draw(engine.graphicsContext, 100);

      expect(scene._predraw).toHaveBeenCalledTimes(2);
      expect(scene.onPreDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPostDraw overridden safely', async () => {
      await scene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      scene.onPostDraw = (ctx, elapsedMs) => {
        expect(<any>ctx).not.toBe(null);
        expect(elapsedMs).toBe(100);
      };

      vi.spyOn(scene, 'onPostDraw');
      vi.spyOn(scene, '_postdraw');

      scene.draw(engine.graphicsContext, 100);
      scene.draw(engine.graphicsContext, 100);

      expect(scene._postdraw).toHaveBeenCalledTimes(2);
      expect(scene.onPostDraw).toHaveBeenCalledTimes(2);
    });
  });
});
