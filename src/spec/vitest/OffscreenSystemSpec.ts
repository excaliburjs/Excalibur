import * as ex from '@excalibur';
import { GraphicsComponent, TransformComponent } from '@excalibur';

import { TestUtils } from '../__util__/TestUtils';

describe('The OffscreenSystem', () => {
  let entities: ex.Entity[];
  let engine: ex.Engine;
  beforeEach(() => {
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

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.OffscreenSystem).toBeDefined();
  });

  it('decorates offscreen entities with "offscreen" tag', () => {
    const sut = new ex.OffscreenSystem(engine.currentScene.world);
    engine.currentScene.camera.update(engine, 1);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    engine.currentScene._initialize(engine);
    sut.initialize(engine.currentScene.world, engine.currentScene);

    const rect = new ex.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const offscreen = new ex.Entity([new TransformComponent(), new GraphicsComponent()]);

    offscreen.get(GraphicsComponent).use(rect);
    offscreen.get(TransformComponent).pos = ex.vec(112.5, 112.5);

    const offscreenSpy = vi.fn();
    const onscreenSpy = vi.fn();

    offscreen.events.on('enterviewport', onscreenSpy);
    offscreen.events.on('exitviewport', offscreenSpy);
    sut.query.checkAndModify(offscreen);

    // Should be offscreen
    sut.update();
    expect(offscreenSpy).toHaveBeenCalled();
    expect(onscreenSpy).not.toHaveBeenCalled();
    expect(offscreen.hasTag('ex.offscreen')).toBe(true);
    offscreenSpy.mockReset();
    onscreenSpy.mockReset();

    // Should be onscreen
    offscreen.get(TransformComponent).pos = ex.vec(80, 80);
    sut.update();
    offscreen.processComponentRemoval();
    expect(offscreenSpy).not.toHaveBeenCalled();
    expect(onscreenSpy).toHaveBeenCalled();
    expect(offscreen.hasTag('ex.offscreen')).toBe(false);
  });
});
