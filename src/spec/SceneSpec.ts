import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A scene', () => {
  let actor: ex.Actor;
  let engine: ex.Engine;
  let scene: ex.Scene;
  let clock: ex.TestClock;

  beforeEach(() => {
    actor = new ex.Actor();
    engine = TestUtils.engine({ width: 100, height: 100 });
    scene = new ex.Scene();

    spyOn(scene, 'draw').and.callThrough();
    engine.removeScene('root');
    engine.addScene('root', scene);
    engine.goToScene('root');
    engine.start();

    clock = engine.clock as ex.TestClock;
    clock.step(100);
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should be loaded', () => {
    expect(ex.Scene).toBeTruthy();
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

    expect(scene.entities.length).withContext('deferred entity removal means entities cleared at end of update').toBe(3);
    expect(scene.timers.length).withContext('timers dont have deferred removal').toBe(0);

    scene.update(engine, 100);
    expect(scene.entities.length).toBe(0);
    expect(scene.timers.length).toBe(0);
  });

  it('cannot have the same TileMap added to it more than once', () => {
    const tileMap = new ex.TileMap({ pos: ex.vec(1, 1), tileWidth: 1, tileHeight: 1, columns: 1, rows: 1});
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
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
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
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = -4;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });
  it('does not draw offscreen Actors left', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = -6;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors top', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = 0;
    actor.pos.y = -4;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors top', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = 0;
    actor.pos.y = -6;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors right', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = 104;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors right', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = 106;
    actor.pos.y = 0;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be offscreen').toBe(true);
    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors bottom', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = 0;
    actor.pos.y = 104;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be onscreen').toBe(false);
    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors bottom', () => {
    engine.goToScene('root');
    const actor = new ex.Actor({
      width: 10,
      height: 10,
      color: ex.Color.Red
    });
    actor.graphics.onPostDraw = jasmine.createSpy('draw');
    actor.pos.x = 0;
    actor.pos.y = 106;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.isOffScreen).withContext('Actor should be offscreen').toBe(true);
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
    actor.graphics.onPostDraw = jasmine.createSpy('draw');

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.graphics.onPostDraw).toHaveBeenCalled();
  });

  it('does not draw invisible actors', () => {
    engine.goToScene('root');
    actor.graphics.visible = false;
    actor.graphics.onPostDraw = jasmine.createSpy('draw');

    scene.add(actor);
    scene.draw(engine.graphicsContext, 100);

    expect(actor.graphics.onPostDraw).not.toHaveBeenCalled();
  });

  it('initializes after start or play in first update', () => {
    const scene = new ex.Scene();
    spyOn(scene, 'onInitialize');

    engine.removeScene('root');
    engine.addScene('root', scene);
    expect(scene.onInitialize).toHaveBeenCalledTimes(0);

    engine.goToScene('root');
    engine.start();
    clock.step(100);

    expect(scene.onInitialize).toHaveBeenCalledTimes(1);
  });

  it('calls onActivate and onDeactivate with the correct args', () => {
    const sceneA = new ex.Scene();
    sceneA.onDeactivate = jasmine.createSpy('onDeactivate()');
    const sceneB = new ex.Scene();
    sceneB.onActivate = jasmine.createSpy('onActivate()');

    engine.removeScene('root');
    engine.addScene('root', sceneA);
    engine.addScene('sceneB', sceneB);

    engine.goToScene('root');
    engine.start();
    clock.step(100);
    clock.step(100);

    engine.goToScene('sceneB', { foo: 'bar' });
    clock.step(100);
    clock.step(100);

    expect(sceneA.onDeactivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      nextScene: sceneB
    });
    expect(sceneB.onActivate).toHaveBeenCalledWith({
      engine,
      previousScene: sceneA,
      nextScene: sceneB,
      data: { foo: 'bar'}
    });
  });

  it('fires initialize before activate', (done) => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    scene = new ex.Scene();

    engine.removeScene('root');
    engine.addScene('root', scene);

    let initialized = false;
    scene.on('initialize', (evt: ex.InitializeEvent) => {
      initialized = true;
    });
    scene.on('activate', (evt: ex.ActivateEvent) => {
      expect(initialized).toBe(true, 'Initialization should happen before activation');
      done();
    });

    engine.goToScene('root');
    engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(100);
  });

  it('fires initialize before actor initialize before activate', (done) => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    scene = new ex.Scene();

    engine.removeScene('root');
    engine.addScene('root', scene);

    let sceneInitialized = false;
    const sceneActivated = false;
    let actorInitialized = false;
    scene.on('initialize', (evt) => {
      sceneInitialized = true;
      expect(actorInitialized).toBe(true, 'Actor should be initialized before scene initialization');
    });
    const actor = new ex.Actor();
    actor.on('initialize', (evt) => {
      actorInitialized = true;
    });

    scene.on('activate', (evt) => {
      expect(actorInitialized).toBe(true, 'Actor should be initialized before scene is activated');
      done();
    });

    scene.add(actor);
    engine.goToScene('root');
    engine.start();
    const clock = engine.clock as ex.TestClock;
    clock.step(100);
  });

  it('can only be initialized once', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    const clock = engine.clock as ex.TestClock;
    scene = new ex.Scene();

    engine.removeScene('root');
    engine.addScene('root', scene);

    let initializeCount = 0;
    scene.on('initialize', (evt) => {
      initializeCount++;
    });

    engine.goToScene('root');
    engine.start();
    clock.step(1);
    scene.update(engine, 100);
    scene.update(engine, 100);
    scene._initialize(engine);
    scene._initialize(engine);
    scene._initialize(engine);

    expect(initializeCount).toBe(1, 'Scenes can only be initialized once');
  });

  it('should initialize before actors in the scene', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    const clock = engine.clock as ex.TestClock;
    scene = new ex.Scene();

    engine.removeScene('root');
    engine.addScene('root', scene);

    const actor = new ex.Actor();
    scene.add(actor);
    let sceneInit = false;
    scene.onInitialize = () => {
      sceneInit = true;
    };
    actor.onInitialize = () => {
      expect(sceneInit).toBe(true, 'Scene should be initialized first before any actors');
    };

    engine.goToScene('root');
    engine.start();
    clock.step(1);
    scene.update(engine, 100);
  });

  it('should allow adding and removing an Actor in same frame', () => {
    let removed = false;
    scene.add(actor);
    actor.on('postupdate', () => {
      scene.remove(actor);
      removed = true;
    });
    scene.update(engine, 10);

    expect(removed).toBe(true, 'Actor postupdate was not called');
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

    expect(removed).toBe(true, 'Actor postupdate was not called');
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

    expect(removed).toBe(true, 'Actor postupdate was not called');
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

    expect(removed).toBe(true, 'Actor postupdate was not called');
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

    const entityRemoved = jasmine.createSpy('entityremoved');
    const entityAdded = jasmine.createSpy('entityadded');

    scene1.on('entityremoved', entityRemoved);
    scene2.on('entityadded', entityAdded);

    scene1.add(actor);

    expect(actor.scene).toBe(scene1);
    expect(scene1.contains(actor)).toBeTrue();
    expect(scene2.contains(actor)).toBeFalse();

    scene2.transfer(actor);

    expect(actor.scene).toBe(scene2);
    expect(scene1.contains(actor)).toBeFalse();
    expect(scene2.contains(actor)).toBeTrue();

    expect(entityAdded).toHaveBeenCalledTimes(1);
    expect(entityRemoved).toHaveBeenCalledTimes(1);

  });

  it('can transfer timers', () => {
    const scene1 = new ex.Scene();
    const scene2 = new ex.Scene();
    const timer = new ex.Timer({
      fcn: () => { /* pass */ },
      interval: 100
    });

    const entityRemoved = jasmine.createSpy('entityremoved');
    const entityAdded = jasmine.createSpy('entityadded');

    scene1.on('entityremoved', entityRemoved);
    scene2.on('entityadded', entityAdded);

    scene1.add(timer);

    expect(timer.scene).toBe(scene1);
    expect(scene1.timers.includes(timer)).toBeTrue();
    expect(scene2.timers.includes(timer)).toBeFalse();

    scene2.transfer(timer);

    expect(timer.scene).toBe(scene2);
    expect(scene1.timers.includes(timer)).toBeFalse();
    expect(scene2.timers.includes(timer)).toBeTrue();

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

      expect(initialized).toBe(true, 'Actor was not initialized before calling update');
    });
    actor.on('postdraw', () => {
      expect(updated).toBe(true, 'Actor was not updated before calling draw');
      expect(initialized).toBe(true, 'Actor was not initialized before calling draw');
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

    expect(scene.actors.indexOf(actor)).toBeGreaterThan(-1, 'Actor was not added to scene');
    expect(initialized).toBe(true, 'Actor was not initialized after timer callback');
    expect(updated).toBe(true, 'Actor was not updated after timer callback');
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

      expect(initialized).toBe(true, 'ScreenElement was not initialized before calling update');
    });
    actor.on('postdraw', () => {
      expect(updated).toBe(true, 'ScreenElement was not updated before calling draw');
      expect(initialized).toBe(true, 'ScreenElement was not initialized before calling draw');
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

    expect(scene.actors.indexOf(actor)).toBeGreaterThan(-1, 'ScreenElement was not added to scene');
    expect(initialized).toBe(true, 'ScreenElement was not initialized after timer callback');
    expect(updated).toBe(true, 'ScreenElement was not updated after timer callback');
  });

  it('will kill the actor if the actor is removed from the scene', () => {
    scene.add(actor);

    spyOn(actor, 'kill').and.callThrough();

    scene.remove(actor);

    expect(actor.isKilled()).toBe(true);
    expect(actor.kill).toHaveBeenCalledTimes(1);
  });

  it('will not kill the actor if it is already dead', () => {
    scene.add(actor);
    actor.active = false;

    spyOn(actor, 'kill').and.callThrough();

    scene.remove(actor);
    expect(actor.kill).toHaveBeenCalledTimes(0);
  });

  it('will remove an actor from a scene if actor is killed', () => {
    scene.add(actor);
    spyOn(scene, 'remove').and.callThrough();

    actor.kill();
    scene.update(engine, 100);
    expect(scene.actors).not.toContain(actor);
    expect(actor.isKilled()).toBe(true);
  });

  it('will update TileMaps that were added in a Timer callback', () => {
    let updated = false;
    const tilemap = new ex.TileMap({ pos: ex.vec(0, 0), tileWidth: 1, tileHeight: 1, columns: 1, rows: 1});
    tilemap.on('postupdate', () => {
      updated = true;
    });
    tilemap.on('postdraw', () => {
      expect(updated).toBe(true, 'TileMap was not updated before calling draw');
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

    expect(scene.tileMaps.indexOf(tilemap)).toBeGreaterThan(-1, 'TileMap was not added to scene');
    expect(updated).toBe(true, 'TileMap was not updated after timer callback');
  });

  it('will return true if it is the current engine scene', () => {
    engine.goToScene('root');
    expect(scene.isCurrentScene()).toBe(true);
  });

  it('will not be the current scene if no engine is given', () => {
    const otherScene = new ex.Scene();
    expect(otherScene.isCurrentScene()).toBe(false);
  });

  it('will not be the current scene if the scene was switched', () => {
    const otherScene = new ex.Scene();
    engine.goToScene('root');
    engine.addScene('secondaryScene', otherScene);
    engine.goToScene('secondaryScene');

    expect(scene.isCurrentScene()).toBe(false);
    expect(otherScene.isCurrentScene()).toBe(true);
  });

  describe('lifecycle overrides', () => {
    let scene: ex.Scene;
    let engine: ex.Engine;
    beforeEach(() => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      scene = new ex.Scene();
      engine.removeScene('root');
      engine.addScene('root', scene);
    });

    afterEach(() => {
      engine.stop();
      engine = null;
      scene = null;
    });

    it('can have onInitialize overridden safely', () => {
      const clock = engine.clock as ex.TestClock;
      let initCalled = false;
      scene.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      scene.on('initialize', () => {
        initCalled = true;
      });

      spyOn(scene, 'onInitialize').and.callThrough();

      TestUtils.runToReady(engine);
      engine.goToScene('root');
      clock.step(100);

      expect(initCalled).toBe(true);
      expect(scene.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', () => {
      scene._initialize(engine);
      scene.onPostUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(scene, 'onPostUpdate').and.callThrough();
      spyOn(scene, '_postupdate').and.callThrough();

      scene.update(engine, 100);
      scene.update(engine, 100);

      expect(scene._postupdate).toHaveBeenCalledTimes(2);
      expect(scene.onPostUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreUpdate overridden safely', () => {
      scene._initialize(engine);
      scene.onPreUpdate = (engine, delta) => {
        expect(engine).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(scene, 'onPreUpdate').and.callThrough();
      spyOn(scene, '_preupdate').and.callThrough();

      scene.update(engine, 100);
      scene.update(engine, 100);

      expect(scene._preupdate).toHaveBeenCalledTimes(2);
      expect(scene.onPreUpdate).toHaveBeenCalledTimes(2);
    });

    it('can have onPreDraw overridden safely', () => {
      scene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      scene.onPreDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(scene, 'onPreDraw').and.callThrough();
      spyOn(scene, '_predraw').and.callThrough();

      scene.draw(engine.graphicsContext, 100);
      scene.draw(engine.graphicsContext, 100);

      expect(scene._predraw).toHaveBeenCalledTimes(2);
      expect(scene.onPreDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPostDraw overridden safely', () => {
      scene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      scene.onPostDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(scene, 'onPostDraw').and.callThrough();
      spyOn(scene, '_postdraw').and.callThrough();

      scene.draw(engine.graphicsContext, 100);
      scene.draw(engine.graphicsContext, 100);

      expect(scene._postdraw).toHaveBeenCalledTimes(2);
      expect(scene.onPostDraw).toHaveBeenCalledTimes(2);
    });
  });
});
