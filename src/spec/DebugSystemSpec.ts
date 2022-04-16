import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('DebugSystem', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
  let engine: ex.Engine;
  let center: ex.Vector;

  beforeEach(() => {
    engine = TestUtils.engine();
    engine.toggleDebug();
    engine.currentScene.world.clearSystems();
    engine.currentScene._initialize(engine);
    center = engine.screen.center;
  });

  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('exists', () => {
    expect(ex.DebugSystem).toBeDefined();
  });

  it('can use a test clock', () => {
    engine.debug.useTestClock();
    expect(engine.clock).toBeInstanceOf(ex.TestClock);
    expect(engine.clock.isRunning());
  });

  it('can use a standard clock', () => {
    engine.debug.useStandardClock();
    expect(engine.clock).toBeInstanceOf(ex.StandardClock);
    expect(engine.clock.isRunning());
  });

  it('does not crash with an empty collider', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const entity = new ex.Entity([new ex.TransformComponent(), new ex.ColliderComponent()]);

    engine.debug.collider.showAll = true;

    expect(() => {
      debugSystem.update([entity], 100);
    }).not.toThrow();
  });

  it('can show transform and entity info', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const actor = new ex.Actor({ name: 'thingy', x: center.x, y: center.y, width: 50, height: 50, color: ex.Color.Yellow });
    actor.id = 0;
    engine.debug.transform.showAll = true;
    engine.debug.entity.showAll = true;
    debugSystem.update([actor], 100);

    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/transform.png');
  });

  it('can show motion info', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const actor = new ex.Actor({ name: 'thingy', x: center.x, y: center.y, width: 50, height: 50, color: ex.Color.Yellow });
    actor.id = 0;
    actor.vel = ex.vec(100, 0);
    actor.acc = ex.vec(100, -100);
    engine.debug.motion.showAll = true;
    debugSystem.update([actor], 100);

    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/motion.png');
  });

  it('can show body info', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const actor = new ex.Actor({ name: 'thingy', x: -100 + center.x, y: center.y, width: 50, height: 50, color: ex.Color.Yellow });
    actor.id = 0;
    actor.vel = ex.vec(100, 0);
    actor.acc = ex.vec(100, -100);
    engine.debug.body.showAll = true;
    debugSystem.update([actor], 100);

    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/body.png');
  });

  it('can show collider info', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const actor = new ex.Actor({ name: 'thingy', x: -100 + center.x, y: center.y, width: 50, height: 50, color: ex.Color.Yellow });
    actor.id = 0;
    engine.debug.collider.showAll = true;
    debugSystem.update([actor], 100);

    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/collider.png');
  });

  it('can show composite collider info', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const actor = new ex.Actor({ name: 'thingy', x: -100 + center.x, y: center.y, width: 50, height: 50, color: ex.Color.Yellow });
    actor.collider.useCompositeCollider([ex.Shape.Circle(50), ex.Shape.Box(150, 20), ex.Shape.Box(10, 150)]);
    actor.id = 0;
    engine.debug.collider.showAll = true;
    debugSystem.update([actor], 100);

    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/composite-collider.png');
  });

  it('can show graphics info', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();
    await (engine.graphicsContext.debug as any)._debugText.load();

    const actor = new ex.Actor({ name: 'thingy', x: -100 + center.x, y: center.y, width: 50, height: 50 });
    actor.graphics.use(new ex.Rectangle({ width: 200, height: 100, color: ex.Color.Red }));
    actor.id = 0;
    engine.debug.collider.showBounds = false;
    engine.debug.collider.showGeometry = false;
    engine.debug.collider.showOwner = false;
    engine.debug.graphics.showAll = true;
    debugSystem.update([actor], 100);

    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/graphics.png');
  });

  it('can show DebugGraphicsComponent', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();

    const entity = new ex.Entity([
      new ex.TransformComponent(),
      new ex.DebugGraphicsComponent(ctx => {
        ctx.drawCircle(ex.vec(250, 250), 100, ex.Color.Blue);
      })]);
    debugSystem.update([entity], 100);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas))
      .toEqualImage('src/spec/images/DebugSystemSpec/debug-draw-component.png');
  });

  it('can debug draw a tilemap', async () => {
    const debugSystem = new ex.DebugSystem();
    engine.currentScene.world.add(debugSystem);
    debugSystem.initialize(engine.currentScene);

    engine.graphicsContext.clear();

    const tilemap = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 50,
      tileHeight: 50,
      rows: 10,
      columns: 10
    });
    tilemap.tiles[0].solid = true;
    tilemap.update(engine, 1);
    debugSystem.update([tilemap], 100);

    engine.graphicsContext.flush();
    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/DebugSystemSpec/tilemap-debug.png');
  });
});
