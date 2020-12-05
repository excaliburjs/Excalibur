import * as ex from '@excalibur';
import { TransformComponent } from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';
import { GraphicsComponent } from '../engine/Graphics';
import { TestUtils } from './util/TestUtils';

describe('A Graphics ECS System', () => {
  let entities: ex.Entity<ex.TransformComponent | ex.Graphics.GraphicsComponent>[];
  let engine: ex.Engine;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({ width: 100, height: 100 });
    entities = [
      new ex.Entity().addComponent(new ex.TransformComponent).addComponent(new ex.Graphics.GraphicsComponent),
      new ex.Entity().addComponent(new ex.TransformComponent).addComponent(new ex.Graphics.GraphicsComponent),
      new ex.Entity().addComponent(new ex.TransformComponent).addComponent(new ex.Graphics.GraphicsComponent)
    ];
    entities[0].components.transform.z = 10;
    entities[1].components.transform.z = 5;
    entities[2].components.transform.z = 1;
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

  it('draws entities with transform and graphics components', async () => {
    const sut = new ex.Graphics.GraphicsSystem();
    engine.currentScene.camera.update(engine, 1);
    sut.initialize(engine.currentScene);

    const rect = new ex.Graphics.Rect({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const circle = new ex.Graphics.Circle({
      radius: 13,
      color: ex.Color.Green
    });

    const rect2 = new ex.Graphics.Rect({
      width: 25,
      height: 25,
      color: ex.Color.Red
    });

    entities[0].components.transform.pos = ex.vec(25, 25);
    entities[0].components.transform.rotation = Math.PI / 4;
    entities[0].components.graphics.show(rect);

    entities[1].components.transform.pos = ex.vec(75, 75);
    entities[1].components.graphics.show(circle);

    entities[2].components.transform.pos = ex.vec(75, 25);
    entities[2].components.transform.scale = ex.vec(2, 2);
    entities[2].components.graphics.show(rect2);

    const offscreen = new ex.Entity()
      .addComponent(new TransformComponent)
      .addComponent(new GraphicsComponent);
    offscreen.components.transform.pos = ex.vec(112.5, 112.5);
    offscreen.components.graphics.show(rect);

    spyOn(offscreen.components.graphics, 'draw');

    entities.push(offscreen);

    sut.update(entities, 1);

    expect(offscreen.components.graphics.draw).not.toHaveBeenCalled();
    const [actual, image] = await ensureImagesLoaded(engine.canvas, 'src/spec/images/GraphicsSystemSpec/graphics-system.png');
    expect(actual).toEqualImage(image);
  });
});