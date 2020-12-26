import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A scene', () => {
  let actor: ex.Actor;
  let engine: ex.Engine;
  let scene: ex.Scene;

  beforeEach(() => {
    actor = new ex.Actor();
    engine = TestUtils.engine({ width: 100, height: 100 });
    scene = new ex.Scene();

    spyOn(scene, 'draw').and.callThrough();
    spyOn(actor, 'draw');
    engine.removeScene('root');
    engine.addScene('root', scene);
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

  it('cannot have the same TileMap added to it more than once', () => {
    const tileMap = new ex.TileMap(1, 1, 1, 1, 1, 1);
    scene.add(tileMap);
    expect(scene.tileMaps.length).toBe(1);
    scene.add(tileMap);
    expect(scene.tileMaps.length).toBe(1);
  });

  it('draws onscreen Actors', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 0;
    actor.pos.y = 0;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBeFalsy();
    expect(actor.draw).toHaveBeenCalled();
  });

  it('draws onscreen Actors left', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = -4;
    actor.pos.y = 0;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(false, 'Actor should be onscreen');
    expect(actor.draw).toHaveBeenCalled();
  });
  it('does not draw offscreen Actors left', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = -6;
    actor.pos.y = 0;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(true, 'Actor should be offscreen');
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors top', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 0;
    actor.pos.y = -4;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(false, 'Actor should be onscreen');
    expect(actor.draw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors top', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 0;
    actor.pos.y = -6;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(true, 'Actor should be offscreen');
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors right', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 104;
    actor.pos.y = 0;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(false, 'Actor should be onscreen');
    expect(actor.draw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors right', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 106;
    actor.pos.y = 0;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(true, 'Actor should be offscreen');
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('draws onscreen Actors bottom', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 0;
    actor.pos.y = 104;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(false, 'Actor should be onscreen');
    expect(actor.draw).toHaveBeenCalled();
  });

  it('does not draw offscreen Actors bottom', () => {
    engine.goToScene('root');
    actor.traits.length = 0;
    actor.traits.push(new ex.Traits.OffscreenCulling());
    actor.pos.x = 0;
    actor.pos.y = 106;
    actor.width = 10;
    actor.height = 10;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(actor.isOffScreen).toBe(true, 'Actor should be offscreen');
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('does not draw offscreen Actors', () => {
    engine.goToScene('root');
    actor.pos.x = 1000;
    actor.pos.y = 1000;
    scene.update(engine, 100);
    expect(actor.isOffScreen).toBeFalsy();

    actor.pos.x = 1010;
    actor.pos.y = 1010;
    actor.width = 5;
    actor.height = 5;

    scene.add(actor);
    scene.update(engine, 100);
    scene.draw(engine.ctx, 100);

    expect(scene.camera.getFocus().x).toBe(50);
    expect(scene.camera.getFocus().y).toBe(50);
    expect(engine.worldToScreenCoordinates(new ex.Vector(50, 50)).x).toBe(50);
    expect(engine.worldToScreenCoordinates(new ex.Vector(50, 50)).y).toBe(50);
    expect(engine.drawWidth).toBe(100);
    expect(engine.drawHeight).toBe(100);

    expect(actor.isOffScreen).toBeTruthy();
    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('draws visible Actors', () => {
    engine.goToScene('root');
    actor.visible = true;

    scene.add(actor);
    scene.draw(engine.ctx, 100);

    expect(actor.draw).toHaveBeenCalled();
  });

  it('does not draw invisible actors', () => {
    engine.goToScene('root');
    actor.visible = false;

    scene.add(actor);
    scene.draw(engine.ctx, 100);

    expect(actor.draw).not.toHaveBeenCalled();
  });

  it('fires initialize before activate', (done) => {
    let initialized = false;
    scene.on('initialize', (evt: ex.InitializeEvent) => {
      initialized = true;
    });
    scene.on('activate', (evt: ex.ActivateEvent) => {
      expect(initialized).toBe(true, 'Initialization should happen before activation');
      done();
    });

    engine.goToScene('root');
  });

  it('fires initialize before actor initialize before activate', (done) => {
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
    //scene.update(engine, 100);
    //scene.update(engine, 100);
  });

  it('can only be initialized once', () => {
    let initializeCount = 0;
    scene.on('initialize', (evt) => {
      initializeCount++;
    });

    engine.goToScene('root');
    scene.update(engine, 100);
    scene.update(engine, 100);
    scene._initialize(engine);
    scene._initialize(engine);
    scene._initialize(engine);

    expect(initializeCount).toBe(1, 'Scenes can only be initialized once');
  });

  it('should initialize before actors in the scene', () => {
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

    scene.update(engine, 10); //call _processKillQueue

    expect(scene.actors.indexOf(actor)).toBe(0);
    expect(scene.actors.length).toBe(1);
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
    scene.update(engine, 11);
    scene.draw(engine.ctx, 11);

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
    scene.update(engine, 11);
    scene.draw(engine.ctx, 11);

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
    (actor as any)._isKilled = true;

    spyOn(actor, 'kill').and.callThrough();

    scene.remove(actor);
    expect(actor.kill).toHaveBeenCalledTimes(0);
  });

  it('will remove an actor from a scene if actor is killed', () => {
    scene.add(actor);
    spyOn(scene, 'remove').and.callThrough();

    actor.kill();
    expect(scene.remove).toHaveBeenCalledTimes(1);
    expect(actor.isKilled()).toBe(true);
  });

  it('will update TileMaps that were added in a Timer callback', () => {
    let updated = false;
    const tilemap = new ex.TileMap(0, 0, 1, 1, 1, 1);
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
    scene.update(engine, 11);
    scene.draw(engine.ctx, 11);

    expect(scene.tileMaps.indexOf(tilemap)).toBeGreaterThan(-1, 'TileMap was not added to scene');
    expect(updated).toBe(true, 'TileMap was not updated after timer callback');
  });

  it('will return true if it is the current engine scene', () => {
    engine.goToScene('root');
    expect(scene.isCurrentScene()).toBe(true);
  });

  it('will not be the current scene if no engine is given', () => {
    const otherScene = new ex.Scene(engine);
    expect(otherScene.isCurrentScene()).toBe(false);
  });

  it('will not be the current scene if the scene was switched', () => {
    const otherScene = new ex.Scene(engine);
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
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      engine.removeScene('root');
      engine.addScene('root', scene);
    });

    afterEach(() => {
      engine.stop();
      engine = null;
      scene = null;
    });

    it('can have onInitialize overridden safely', () => {
      let initCalled = false;
      scene.onInitialize = (engine) => {
        expect(engine).not.toBe(null);
      };

      scene.on('initialize', () => {
        initCalled = true;
      });

      spyOn(scene, 'onInitialize').and.callThrough();

      engine.goToScene('root');
      (<any>engine)._update(100);

      expect(initCalled).toBe(true);
      expect(scene.onInitialize).toHaveBeenCalledTimes(1);
    });

    it('can have onPostUpdate overridden safely', () => {
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
      scene.onPreDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(scene, 'onPreDraw').and.callThrough();
      spyOn(scene, '_predraw').and.callThrough();

      scene.draw(engine.ctx, 100);
      scene.draw(engine.ctx, 100);

      expect(scene._predraw).toHaveBeenCalledTimes(2);
      expect(scene.onPreDraw).toHaveBeenCalledTimes(2);
    });

    it('can have onPostDraw overridden safely', () => {
      scene.onPostDraw = (ctx, delta) => {
        expect(<any>ctx).not.toBe(null);
        expect(delta).toBe(100);
      };

      spyOn(scene, 'onPostDraw').and.callThrough();
      spyOn(scene, '_postdraw').and.callThrough();

      scene.draw(engine.ctx, 100);
      scene.draw(engine.ctx, 100);

      expect(scene._postdraw).toHaveBeenCalledTimes(2);
      expect(scene.onPostDraw).toHaveBeenCalledTimes(2);
    });
  });
});
