import * as ex from '@excalibur';
import { TransformComponent } from '@excalibur';
import { GraphicsComponent } from '../../engine/Graphics';
import { TestUtils } from '../__util__/TestUtils';

describe('A Graphics ECS System', () => {
  let entities: ex.Entity[];
  let engine: ex.Engine;
  beforeEach(() => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    entities = [
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent()),
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent()),
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent()),

      // parent
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent()),

      // child of ^
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.GraphicsComponent())
    ];
    entities[0].get(TransformComponent).z = 100;
    entities[1].get(TransformComponent).z = 50;
    entities[2].get(TransformComponent).z = 10;

    entities[3].get(TransformComponent).z = 5;
    entities[3].addChild(entities[4]);
    entities[4].get(TransformComponent).z = -1;
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.GraphicsSystem).toBeDefined();
  });

  it('sorts entities by transform.globalZ', () => {
    const world = engine.currentScene.world;
    const sut = new ex.GraphicsSystem(world);
    engine.currentScene._initialize(engine);
    sut.initialize(world, engine.currentScene);
    const es = [...entities];
    es.forEach((e) => sut.query.entityAdded$.notifyAll(e));
    sut.preupdate();
    expect(sut.sortedTransforms.map((t) => t.owner)).toEqual(entities.reverse());
  });

  describe('@visual', () => {
    it('draws entities with transform and graphics components', async () => {
      const world = engine.currentScene.world;
      const sut = new ex.GraphicsSystem(world);
      const offscreenSystem = new ex.OffscreenSystem(world);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      offscreenSystem.initialize(world, engine.currentScene);
      sut.initialize(world, engine.currentScene);

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
      entities[0].get(GraphicsComponent).use(rect);

      entities[1].get(TransformComponent).pos = ex.vec(75, 75);
      entities[1].get(GraphicsComponent).use(circle);

      entities[2].get(TransformComponent).pos = ex.vec(75, 25);
      entities[2].get(TransformComponent).scale = ex.vec(2, 2);
      entities[2].get(GraphicsComponent).use(rect2);

      const offscreenRect = rect.clone();
      const offscreen = new ex.Entity().addComponent(new TransformComponent()).addComponent(new GraphicsComponent());
      offscreen.get(TransformComponent).pos = ex.vec(112.5, 112.5);
      offscreen.get(GraphicsComponent).use(offscreenRect);

      vi.spyOn(rect, 'draw');
      vi.spyOn(circle, 'draw');
      vi.spyOn(rect2, 'draw');
      vi.spyOn(offscreenRect, 'draw');

      entities.push(offscreen);
      engine.graphicsContext.clear();
      entities.forEach((e) => offscreenSystem.query.checkAndModify(e));
      entities.forEach((e) => sut.query.checkAndModify(e));

      offscreenSystem.update();

      sut.preupdate();
      sut.update(1);

      expect(rect.draw).toHaveBeenCalled();
      expect(circle.draw).toHaveBeenCalled();
      expect(rect2.draw).toHaveBeenCalled();
      expect(offscreenRect.draw).not.toHaveBeenCalled();

      engine.graphicsContext.flush();
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GraphicsSystemSpec/graphics-system.png');
    });

    it('will multiply the opacity set on the context', async () => {
      const world = engine.currentScene.world;
      const sut = new ex.GraphicsSystem(world);
      const offscreenSystem = new ex.OffscreenSystem(world);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      offscreenSystem.initialize(world, engine.currentScene);
      sut.initialize(world, engine.currentScene);

      engine.graphicsContext.opacity = 0.5;

      const actor = new ex.Actor({
        x: 10,
        y: 10,
        height: 10,
        width: 10,
        color: ex.Color.Red
      });
      actor.graphics.opacity = 0.5;

      sut.query.checkAndModify(actor);

      offscreenSystem.query.checkAndModify(actor);
      offscreenSystem.update();

      engine.graphicsContext.clear();
      sut.preupdate();
      sut.update(1);

      engine.graphicsContext.flush();
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GraphicsSystemSpec/graphics-context-opacity.png');
    });

    it('can flip graphics horizontally', async () => {
      const world = engine.currentScene.world;
      const sut = new ex.GraphicsSystem(world);
      const offscreenSystem = new ex.OffscreenSystem(world);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      offscreenSystem.initialize(world, engine.currentScene);
      sut.initialize(world, engine.currentScene);

      const sword = new ex.ImageSource('/src/spec/assets/images/GraphicsSystemSpec/sword.png');
      await sword.load();

      const actor = new ex.Actor({
        x: 50,
        y: 50,
        height: 100,
        width: 100
      });
      actor.graphics.use(sword.toSprite());
      actor.graphics.flipHorizontal = true;

      sut.query.checkAndModify(actor);

      offscreenSystem.update();

      engine.graphicsContext.clear();
      sut.preupdate();
      sut.update(1);

      engine.graphicsContext.flush();
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GraphicsSystemSpec/sword-flip-horizontal.png');
    });

    it('can flip graphics vertically', async () => {
      const world = engine.currentScene.world;
      const sut = new ex.GraphicsSystem(world);
      const offscreenSystem = new ex.OffscreenSystem(world);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      offscreenSystem.initialize(world, engine.currentScene);
      sut.initialize(world, engine.currentScene);

      const sword = new ex.ImageSource('/src/spec/assets/images/GraphicsSystemSpec/sword.png');
      await sword.load();

      const actor = new ex.Actor({
        x: 50,
        y: 50,
        height: 100,
        width: 100
      });
      actor.graphics.use(sword.toSprite());
      actor.graphics.flipVertical = true;

      sut.query.checkAndModify(actor);

      offscreenSystem.update();

      engine.graphicsContext.clear();
      sut.preupdate();
      sut.update(1);

      engine.graphicsContext.flush();
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GraphicsSystemSpec/sword-flip-vertical.png');
    });

    it('can flip graphics both horizontally and vertically', async () => {
      const world = engine.currentScene.world;
      const sut = new ex.GraphicsSystem(world);
      const offscreenSystem = new ex.OffscreenSystem(world);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      offscreenSystem.initialize(world, engine.currentScene);
      sut.initialize(world, engine.currentScene);

      const sword = new ex.ImageSource('/src/spec/assets/images/GraphicsSystemSpec/sword.png');
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

      sut.query.checkAndModify(actor);

      offscreenSystem.update();

      engine.graphicsContext.clear();
      sut.preupdate();
      sut.update(1);

      engine.graphicsContext.flush();
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GraphicsSystemSpec/sword-flip-both.png');
    });

    it('can flip graphics both horizontally and vertically with an offset', async () => {
      const world = engine.currentScene.world;
      const sut = new ex.GraphicsSystem(world);
      const offscreenSystem = new ex.OffscreenSystem(world);
      engine.currentScene.camera.update(engine, 1);
      engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      offscreenSystem.initialize(world, engine.currentScene);
      sut.initialize(world, engine.currentScene);

      const sword = new ex.ImageSource('/src/spec/assets/images/GraphicsSystemSpec/sword.png');
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

      sut.query.checkAndModify(actor);

      offscreenSystem.update();

      engine.graphicsContext.clear();
      sut.preupdate();
      sut.update(1);

      engine.graphicsContext.flush();
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GraphicsSystemSpec/sword-flip-both-offset.png');
    });
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

    vi.spyOn(game.graphicsContext, 'translate');
    vi.spyOn(game.graphicsContext, 'rotate');
    vi.spyOn(game.graphicsContext, 'scale');

    const graphicsSystem = new ex.GraphicsSystem(game.currentScene.world);
    graphicsSystem.initialize(game.currentScene.world, game.currentScene);
    graphicsSystem.preupdate();
    graphicsSystem.query.checkAndModify(actor);

    game.currentFrameLagMs = 8; // current lag in a 30 fps frame
    graphicsSystem.update(30);

    expect(game.graphicsContext.translate).toHaveBeenCalledWith(24, 24);
    game.dispose();
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

    const translateSpy = vi.spyOn(game.graphicsContext, 'translate');
    vi.spyOn(game.graphicsContext, 'rotate');
    vi.spyOn(game.graphicsContext, 'scale');

    const graphicsSystem = new ex.GraphicsSystem(game.currentScene.world);
    graphicsSystem.initialize(game.currentScene.world, game.currentScene);
    graphicsSystem.preupdate();
    graphicsSystem.query.checkAndModify(actor);

    game.currentFrameLagMs = 1000 / 30 / 2; // current lag in a 30 fps frame
    graphicsSystem.update(16);

    expect(translateSpy.mock.calls[0]).toEqual([10, 10]);
    expect(translateSpy.mock.calls[1]).toEqual([45, 45]); // 45 because the parent offsets by (-10, -10)
    game.dispose();
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

    vi.spyOn(game.graphicsContext, 'translate');
    vi.spyOn(game.graphicsContext, 'rotate');
    vi.spyOn(game.graphicsContext, 'scale');

    const graphicsSystem = new ex.GraphicsSystem(game.currentScene.world);
    graphicsSystem.initialize(game.currentScene.world, game.currentScene);
    graphicsSystem.preupdate();
    graphicsSystem.query.checkAndModify(actor);

    actor.body.enableFixedUpdateInterpolate = false;
    game.currentFrameLagMs = 8; // current lag in a 30 fps frame
    graphicsSystem.update(30);

    expect(game.graphicsContext.translate).toHaveBeenCalledWith(100, 100);
    game.dispose();
  });

  it('can add graphics+transform to a parent without a transform', () => {
    const world = engine.currentScene.world;
    const sut = new ex.GraphicsSystem(world);
    engine.currentScene.camera.update(engine, 1);
    engine.currentScene._initialize(engine);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    sut.initialize(world, engine.currentScene);
    sut.preupdate();

    const parent = new ex.Entity();
    const child = new ex.Entity();
    child.addComponent(new ex.TransformComponent());
    child.addComponent(new ex.GraphicsComponent());
    parent.addChild(child);

    sut.query.checkAndModify(parent);
    sut.query.checkAndModify(child);

    expect(() => sut.update(1)).not.toThrow();
  });
});
