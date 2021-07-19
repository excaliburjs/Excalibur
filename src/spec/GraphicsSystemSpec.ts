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
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.Graphics.GraphicsComponent()),
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.Graphics.GraphicsComponent()),
      new ex.Entity().addComponent(new ex.TransformComponent()).addComponent(new ex.Graphics.GraphicsComponent())
    ];
    entities[0].get(TransformComponent).z = 10;
    entities[1].get(TransformComponent).z = 5;
    entities[2].get(TransformComponent).z = 1;
  });

  it('exists', () => {
    expect(ex.Graphics.GraphicsSystem).toBeDefined();
  });

  it('sorts entities by transform.z', () => {
    const sut = new ex.Graphics.GraphicsSystem();
    sut.initialize(engine.currentScene);
    const es = [...entities];
    es.sort(sut.sort);
    expect(es).toEqual(entities.reverse());
  });

  it('decorates offscreen entities with "offscreen" tag', () => {
    const sut = new ex.Graphics.GraphicsSystem();
    engine.currentScene.camera.update(engine, 1);
    sut.initialize(engine.currentScene);

    const rect = new ex.Graphics.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const offscreen = new ex.Entity([new TransformComponent(), new GraphicsComponent()]);

    offscreen.get(GraphicsComponent).show(rect);
    offscreen.get(TransformComponent).pos = ex.vec(112.5, 112.5);

    const offscreenSpy = jasmine.createSpy('offscreenSpy');
    const onscreenSpy = jasmine.createSpy('onscreenSpy');

    offscreen.eventDispatcher.on('enterviewport', onscreenSpy);
    offscreen.eventDispatcher.on('exitviewport', offscreenSpy);

    // Should be offscreen
    sut.update([offscreen], 1);
    expect(offscreenSpy).toHaveBeenCalled();
    expect(onscreenSpy).not.toHaveBeenCalled();
    expect(offscreen.hasTag('offscreen')).toBeTrue();
    offscreenSpy.calls.reset();
    onscreenSpy.calls.reset();

    // Should be onscreen
    offscreen.get(TransformComponent).pos = ex.vec(80, 80);
    sut.update([offscreen], 1);
    offscreen.processComponentRemoval();
    expect(offscreenSpy).not.toHaveBeenCalled();
    expect(onscreenSpy).toHaveBeenCalled();
    expect(offscreen.hasTag('offscreen')).toBeFalse();
  });

  it('draws entities with transform and graphics components', async () => {
    const sut = new ex.Graphics.GraphicsSystem();
    engine.currentScene.camera.update(engine, 1);
    sut.initialize(engine.currentScene);

    const rect = new ex.Graphics.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const circle = new ex.Graphics.Circle({
      radius: 13,
      color: ex.Color.Green
    });

    const rect2 = new ex.Graphics.Rectangle({
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

    sut.update(entities, 1);

    expect(rect.draw).toHaveBeenCalled();
    expect(circle.draw).toHaveBeenCalled();
    expect(rect2.draw).toHaveBeenCalled();
    expect(offscreenRect.draw).not.toHaveBeenCalled();
    await expectAsync(engine.canvas).toEqualImage('src/spec/images/GraphicsSystemSpec/graphics-system.png');
  });
});
