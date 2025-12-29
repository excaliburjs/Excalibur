import * as ex from '@excalibur';

import { TestUtils } from '../__util__/test-utils';

describe('A Parallax Component', () => {
  it('exists', () => {
    expect(ex.ParallaxComponent).toBeDefined();
  });

  it('can be added to an actor', () => {
    const actor = new ex.Actor({ x: 100, y: 100 });
    actor.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));

    const comp = actor.get(ex.ParallaxComponent);

    expect(comp.parallaxFactor).toBeVector(ex.vec(0.5, 0.5));
  });

  describe('@visual', () => {
    it('will apply a parallax effect to the graphics', async () => {
      const game = TestUtils.engine({ width: 500, height: 500 }, ['use-canvas-context']);
      await TestUtils.runToReady(game);
      game.currentScene.camera.pos = ex.vec(0, 0);
      game.currentScene.camera.drawPos = ex.vec(0, 0);

      const clock = game.clock as ex.TestClock;

      const actor = new ex.Actor({ x: 0, y: 0, width: 120, height: 120, color: ex.Color.Green });
      actor.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));
      game.add(actor);

      game.currentScene.camera.pos = ex.vec(100, 100);
      game.currentScene.camera.drawPos = ex.vec(100, 100);
      expect(game.currentScene.camera.pos).toBeVector(ex.vec(100, 100));

      clock.step(16);
      await expect(game.canvas).toEqualImage('/src/spec/assets/images/parallax-spec/parallax1.png');
      expect(actor.hasTag('ex.offscreen')).toBe(false);

      game.currentScene.camera.pos = ex.vec(520, 520);
      game.currentScene.camera.drawPos = ex.vec(520, 520);
      clock.step();
      expect(game.currentScene.camera.pos).toBeVector(ex.vec(520, 520));
      await expect(game.canvas).toEqualImage('/src/spec/assets/images/parallax-spec/parallax2.png');
      expect(actor.hasTag('ex.offscreen')).toBe(false);

      game.currentScene.camera.pos = ex.vec(620, 620);
      game.currentScene.camera.drawPos = ex.vec(620, 620);
      clock.step();
      expect(game.currentScene.camera.pos).toBeVector(ex.vec(620, 620));
      expect(actor.hasTag('ex.offscreen')).toBe(true);
      game.dispose();
    });

    it('works with TileMaps correctly', async () => {
      const game = TestUtils.engine({ width: 500, height: 500 });
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
      tilemap.tiles.forEach((t) => {
        t.addGraphic(graphic);
      });
      tilemap.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));

      game.add(tilemap);
      tilemap._initialize(game);

      clock.step(16);

      await expect(game.canvas).toEqualImage('/src/spec/assets/images/parallax-spec/tilemap.png');

      game.currentScene.camera.pos = ex.vec(250, -480);

      clock.step(16); // seems like there is an out of phase issue
      clock.step(16);

      await expect(game.canvas).toEqualImage('/src/spec/assets/images/parallax-spec/tilemap2.png');
      game.dispose();
    });
  });
});
