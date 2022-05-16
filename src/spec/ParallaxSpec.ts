import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';


describe('A Parallax Component', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
  it('exists', () => {
    expect(ex.ParallaxComponent).toBeDefined();
  });

  it('can be added to an actor', () => {
    const actor = new ex.Actor({x: 100, y: 100});
    actor.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));

    const comp = actor.get(ex.ParallaxComponent);

    expect(comp.parallaxFactor).toBeVector(ex.vec(0.5, 0.5));
  });

  it('will apply a parallax effect to the graphics', async () => {
    const game = TestUtils.engine({width: 500, height: 500}, ['use-canvas-context']);
    await TestUtils.runToReady(game);
    game.currentScene.camera.pos = ex.vec(0, 0);

    const clock = game.clock as ex.TestClock;

    const actor = new ex.Actor({x: 0, y: 0, width: 120, height: 120, color: ex.Color.Green});
    actor.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));
    game.add(actor);

    game.currentScene.camera.pos = ex.vec(100, 100);
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(100, 100));

    clock.step(16);
    await expectAsync(game.canvas).toEqualImage('src/spec/images/ParallaxSpec/parallax1.png');
    expect(actor.hasTag('ex.offscreen')).toBeFalse();

    game.currentScene.camera.pos = ex.vec(520, 520);
    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(520, 520));
    await expectAsync(game.canvas).toEqualImage('src/spec/images/ParallaxSpec/parallax2.png');
    expect(actor.hasTag('ex.offscreen')).toBeFalse();

    game.currentScene.camera.pos = ex.vec(620, 620);
    clock.step();
    expect(game.currentScene.camera.pos).toBeVector(ex.vec(620, 620));
    expect(actor.hasTag('ex.offscreen')).toBeTrue();
  });

  it('works with TileMaps correctly', async () => {
    const game = TestUtils.engine({width: 500, height: 500});
    await TestUtils.runToReady(game);
    const clock = game.clock as ex.TestClock;

    const graphic = new ex.Rectangle({
      color: ex.Color.Green,
      strokeColor: ex.Color.Black,
      width: 64,
      height: 64
    });
    const tilemap = new ex.TileMap({
      tileWidth: 64,
      tileHeight: 64,
      rows: 4,
      columns: 4
    });
    tilemap.tiles.forEach(t => {
      t.addGraphic(graphic);
    });
    tilemap.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));

    game.add(tilemap);

    clock.step(16);

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/ParallaxSpec/tilemap.png');

    game.currentScene.camera.pos = ex.vec(250, -480);

    clock.step(16); // seems like there is an out of phase issue
    clock.step(16);

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/ParallaxSpec/tilemap2.png');
  });
});