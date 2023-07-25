import * as ex from '@excalibur';
import { GraphicsComponent, TransformComponent } from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('The OffscreenSystem', () => {
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
    expect(ex.OffscreenSystem).toBeDefined();
  });

  it('decorates offscreen entities with "offscreen" tag', () => {
    const sut = new ex.OffscreenSystem();
    engine.currentScene.camera.update(engine, 1);
    engine.screen.setCurrentCamera(engine.currentScene.camera);
    engine.currentScene._initialize(engine);
    sut.initialize(engine.currentScene);

    const rect = new ex.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const offscreen = new ex.Entity([new TransformComponent(), new GraphicsComponent()]);

    offscreen.get(GraphicsComponent).show(rect);
    offscreen.get(TransformComponent).pos = ex.vec(112.5, 112.5);

    const offscreenSpy = jasmine.createSpy('offscreenSpy');
    const onscreenSpy = jasmine.createSpy('onscreenSpy');

    offscreen.events.on('enterviewport', onscreenSpy);
    offscreen.events.on('exitviewport', offscreenSpy);

    // Should be offscreen
    sut.update([offscreen]);
    expect(offscreenSpy).toHaveBeenCalled();
    expect(onscreenSpy).not.toHaveBeenCalled();
    expect(offscreen.hasTag('ex.offscreen')).toBeTrue();
    offscreenSpy.calls.reset();
    onscreenSpy.calls.reset();

    // Should be onscreen
    offscreen.get(TransformComponent).pos = ex.vec(80, 80);
    sut.update([offscreen]);
    offscreen.processComponentRemoval();
    expect(offscreenSpy).not.toHaveBeenCalled();
    expect(onscreenSpy).toHaveBeenCalled();
    expect(offscreen.hasTag('ex.offscreen')).toBeFalse();
  });
});