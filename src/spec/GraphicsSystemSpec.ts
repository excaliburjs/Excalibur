import * as ex from '@excalibur';
import { TransformComponent } from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { GraphicsComponent } from '../engine/Graphics';
import { TestUtils } from './util/TestUtils';

describe('A Graphics ECS System', () => {
  let entities: ex.Entity[];
  let engine: ex.Engine;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    engine = TestUtils.engine({ width: 100, height: 100 });
    entities = [
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent()),
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent()),
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent())
    ];
    entities[0].get(TransformComponent).z = 10;
    entities[1].get(TransformComponent).z = 5;
    entities[2].get(TransformComponent).z = 1;
  });

  it('exists', () => {
    expect(ex.GraphicsSystem).toBeDefined();
  });

  it('sorts entities by transform.z', () => {
    const sut = new ex.GraphicsSystem();
    engine.currentScene._initialize(engine);
    sut.initialize(engine.currentScene);
    const es = [...entities];
    es.forEach(e => sut.notify(new ex.AddedEntity(e)));
    sut.preupdate();
    expect(sut.sortedTransforms.map(t => t.owner)).toEqual(entities.reverse());
  });

  it('draws entities with transform and graphics components', async () => {
    const sut = new ex.GraphicsSystem();
    const offscreenSystem = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    offscreenSystem.initialize(engine.currentScene);
    sut.initialize(engine.currentScene);

    const rect = new ex.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const circle = new ex.Circle({
      radius: 13,
      color: ex.Color.Green
    });

    const rect2 = new ex.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Red
    });

    entities[0].get(TransformComponent).pos = ex.vec(25, 25);
    entities[0].get(TransformComponent).rotation = Math.PI / 4;
    entities[0].get(GraphicsComponent).show(rect);

    entities[1].get(TransformComponent).pos = ex.vec(75, 75);
    entities[1].get(GraphicsComponent).show(circle);

    entities[2].get(TransformComponent).pos = ex.vec(75, 25);
    entities[2].get(TransformComponent).scale = ex.vec(2, 2);
    entities[2].get(GraphicsComponent).show(rect2);

    const offscreenRect = rect.clone();
    const offscreen = new ex.Entity().addComponent(new TransformComponent()).addComponent(new GraphicsComponent());
    offscreen.get(TransformComponent).pos = ex.vec(112.5, 112.5);
    offscreen.get(GraphicsComponent).show(offscreenRect);

    spyOn(rect, 'draw').and.callThrough();
    spyOn(circle, 'draw').and.callThrough();
    spyOn(rect2, 'draw').and.callThrough();
    spyOn(offscreenRect, 'draw').and.callThrough();

    entities.push(offscreen);
    engine.graphicsContext.clear();
    entities.forEach(e => sut.notify(new ex.AddedEntity(e)));

    offscreenSystem.update(entities);

    sut.preupdate();
    sut.update(entities, 1);

    expect(rect.draw).toHaveBeenCalled();
    expect(circle.draw).toHaveBeenCalled();
    expect(rect2.draw).toHaveBeenCalled();
    expect(offscreenRect.draw).not.toHaveBeenCalled();

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/GraphicsSystemSpec/graphics-system.png');
  });

  it('will interpolate body graphics when fixed update is enabled', async () => {
    const game = TestUtils.engine({
      fixedUpdateFps: 30
    });

    await TestUtils.runToReady(game);

    const actor = new ex.Actor({
      x: 100,
      y: 100,
      rotation: 2,
      scale: ex.vec(2, 2)
    });

    actor.body.__oldTransformCaptured = true;

    spyOn(game.graphicsContext, 'translate');
    spyOn(game.graphicsContext, 'rotate');
    spyOn(game.graphicsContext, 'scale');

    const graphicsSystem = new ex.GraphicsSystem();
    graphicsSystem.initialize(game.currentScene);
    graphicsSystem.preupdate();
    graphicsSystem.notify(new ex.AddedEntity(actor));

    game.currentFrameLagMs = 8; // current lag in a 30 fps frame
    graphicsSystem.update([actor], 30);

    expect(game.graphicsContext.translate).toHaveBeenCalledWith(24, 24);
  });

  it('will interpolate child body graphics when fixed update is enabled', async () => {
    const game = TestUtils.engine({
      fixedUpdateFps: 30
    });

    await TestUtils.runToReady(game);

    const parent = new ex.Actor({
      x: 10,
      y: 10
    });

    const actor = new ex.Actor({
      x: 100,
      y: 100,
      rotation: 2,
      scale: ex.vec(2, 2)
    });
    parent.addChild(actor);

    actor.body.__oldTransformCaptured = true;

    spyOn(game.graphicsContext, 'translate');
    spyOn(game.graphicsContext, 'rotate');
    spyOn(game.graphicsContext, 'scale');

    const graphicsSystem = new ex.GraphicsSystem();
    graphicsSystem.initialize(game.currentScene);
    graphicsSystem.preupdate();
    graphicsSystem.notify(new ex.AddedEntity(actor));

    game.currentFrameLagMs = 8; // current lag in a 30 fps frame
    graphicsSystem.update([actor], 30);

    expect(game.graphicsContext.translate).toHaveBeenCalledWith(24, 24);
  });

  it('will not interpolate body graphics if disabled', async () => {
    const game = TestUtils.engine({
      fixedUpdateFps: 30
    });

    await TestUtils.runToReady(game);

    const actor = new ex.Actor({
      x: 100,
      y: 100,
      rotation: 2,
      scale: ex.vec(2, 2)
    });

    actor.body.__oldTransformCaptured = true;

    spyOn(game.graphicsContext, 'translate');
    spyOn(game.graphicsContext, 'rotate');
    spyOn(game.graphicsContext, 'scale');

    const graphicsSystem = new ex.GraphicsSystem();
    graphicsSystem.initialize(game.currentScene);
    graphicsSystem.preupdate();
    graphicsSystem.notify(new ex.AddedEntity(actor));

    actor.body.enableFixedUpdateInterpolate = false;
    game.currentFrameLagMs = 8; // current lag in a 30 fps frame
    graphicsSystem.update([actor], 30);

    expect(game.graphicsContext.translate).toHaveBeenCalledWith(100, 100);
  });

  it('will multiply the opacity set on the context', async () => {
    const sut = new ex.GraphicsSystem();
    const offscreenSystem = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    offscreenSystem.initialize(engine.currentScene);
    sut.initialize(engine.currentScene);



    engine.graphicsContext.opacity = .5;

    const actor = new ex.Actor({
      x: 10,
      y: 10,
      height: 10,
      width: 10,
      color: ex.Color.Red
    });
    actor.graphics.opacity = .5;

    sut.notify(new ex.AddedEntity(actor));

    offscreenSystem.update([actor]);

    engine.graphicsContext.clear();
    sut.preupdate();
    sut.update([actor], 1);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/GraphicsSystemSpec/graphics-context-opacity.png');
  });

  it('can flip graphics horizontally', async () => {
    const sut = new ex.GraphicsSystem();
    const offscreenSystem = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    offscreenSystem.initialize(engine.currentScene);
    sut.initialize(engine.currentScene);

    const sword = new ex.ImageSource('src/spec/images/GraphicsSystemSpec/sword.png');
    await sword.load();

    const actor = new ex.Actor({
      x: 50,
      y: 50,
      height: 100,
      width: 100
    });
    actor.graphics.use(sword.toSprite());
    actor.graphics.flipHorizontal = true;

    sut.notify(new ex.AddedEntity(actor));

    offscreenSystem.update([actor]);

    engine.graphicsContext.clear();
    sut.preupdate();
    sut.update([actor], 1);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/GraphicsSystemSpec/sword-flip-horizontal.png');
  });

  it('can flip graphics vertically', async () => {
    const sut = new ex.GraphicsSystem();
    const offscreenSystem = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    offscreenSystem.initialize(engine.currentScene);
    sut.initialize(engine.currentScene);

    const sword = new ex.ImageSource('src/spec/images/GraphicsSystemSpec/sword.png');
    await sword.load();

    const actor = new ex.Actor({
      x: 50,
      y: 50,
      height: 100,
      width: 100
    });
    actor.graphics.use(sword.toSprite());
    actor.graphics.flipVertical = true;

    sut.notify(new ex.AddedEntity(actor));

    offscreenSystem.update([actor]);

    engine.graphicsContext.clear();
    sut.preupdate();
    sut.update([actor], 1);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/GraphicsSystemSpec/sword-flip-vertical.png');
  });

  it('can flip graphics both horizontally and vertically', async () => {
    const sut = new ex.GraphicsSystem();
    const offscreenSystem = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    offscreenSystem.initialize(engine.currentScene);
    sut.initialize(engine.currentScene);

    const sword = new ex.ImageSource('src/spec/images/GraphicsSystemSpec/sword.png');
    await sword.load();

    const actor = new ex.Actor({
      x: 50,
      y: 50,
      height: 100,
      width: 100
    });
    actor.graphics.use(sword.toSprite());
    actor.graphics.flipVertical = true;
    actor.graphics.flipHorizontal = true;

    sut.notify(new ex.AddedEntity(actor));

    offscreenSystem.update([actor]);

    engine.graphicsContext.clear();
    sut.preupdate();
    sut.update([actor], 1);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/GraphicsSystemSpec/sword-flip-both.png');
  });

  it('can flip graphics both horizontally and vertically with an offset', async () => {
    const sut = new ex.GraphicsSystem();
    const offscreenSystem = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    offscreenSystem.initialize(engine.currentScene);
    sut.initialize(engine.currentScene);

    const sword = new ex.ImageSource('src/spec/images/GraphicsSystemSpec/sword.png');
    await sword.load();

    const actor = new ex.Actor({
      x: 50,
      y: 50,
      height: 100,
      width: 100
    });
    actor.graphics.use(sword.toSprite());
    actor.graphics.flipVertical = true;
    actor.graphics.flipHorizontal = true;
    actor.graphics.offset = ex.vec(25, 25);

    sut.notify(new ex.AddedEntity(actor));

    offscreenSystem.update([actor]);

    engine.graphicsContext.clear();
    sut.preupdate();
    sut.update([actor], 1);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/GraphicsSystemSpec/sword-flip-both-offset.png');
  });
});
