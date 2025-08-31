import * as ex from '@excalibur';

import { TestUtils } from '../__util__/TestUtils';

describe('A IsometricMap', () => {
  it('exists', () => {
    expect(ex.IsometricMap).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.IsometricMap({
      pos: ex.vec(10, 10),
      tileWidth: 10,
      tileHeight: 10,
      columns: 20,
      rows: 10
    });

    expect(sut).toBeDefined();
  });

  describe('@visual', () => {
    it('can be drawn', async () => {
      const engine = TestUtils.engine({}, ['suppress-obsolete-message']);
      // engine.toggleDebug();
      const clock = engine.clock as ex.TestClock;
      const image = new ex.ImageSource('/src/spec/assets/images/IsometricMapSpec/tile.png');
      await image.load();
      const sprite = image.toSprite();
      await TestUtils.runToReady(engine);

      const sut = new ex.IsometricMap({
        pos: ex.vec(250, 10),
        tileWidth: 32,
        tileHeight: 16,
        columns: 15,
        rows: 15
      });

      sut.tiles.forEach((tile) => tile.addGraphic(sprite));

      engine.add(sut);
      clock.step(100);

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/IsometricMapSpec/map.png');
      engine.dispose();
    });

    it('can be drawn from the top', async () => {
      const engine = TestUtils.engine({}, ['suppress-obsolete-message']);
      // engine.toggleDebug();
      const clock = engine.clock as ex.TestClock;
      const image = new ex.ImageSource('/src/spec/assets/images/IsometricMapSpec/cube.png');
      await image.load();
      const sprite = image.toSprite();
      await TestUtils.runToReady(engine);

      const sut = new ex.IsometricMap({
        pos: ex.vec(250, 10),
        renderFromTopOfGraphic: true,
        tileWidth: 32,
        tileHeight: 16,
        columns: 15,
        rows: 15
      });

      sut.tiles.forEach((tile) => tile.addGraphic(sprite));

      engine.add(sut);
      clock.step(100);

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/IsometricMapSpec/cube-map-top.png');
      engine.dispose();
    });

    it('can be drawn from the bottom', async () => {
      const engine = TestUtils.engine({}, ['suppress-obsolete-message']);
      // engine.toggleDebug();
      const clock = engine.clock as ex.TestClock;
      const image = new ex.ImageSource('/src/spec/assets/images/IsometricMapSpec/cube.png');
      await image.load();
      const sprite = image.toSprite();
      await TestUtils.runToReady(engine);

      const sut = new ex.IsometricMap({
        pos: ex.vec(250, 10),
        tileWidth: 32,
        tileHeight: 16,
        columns: 15,
        rows: 15
      });

      sut.tiles.forEach((tile) => tile.addGraphic(sprite));

      engine.add(sut);
      clock.step(100);

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/IsometricMapSpec/cube-map-bottom.png');
      engine.dispose();
    });

    it('can be debug drawn', async () => {
      const engine = TestUtils.engine({}, ['suppress-obsolete-message']);
      engine.toggleDebug();
      engine.debug.entity.showName = false;
      engine.debug.entity.showId = false;
      engine.debug.graphics.showBounds = false;
      engine.debug.transform.showPosition = true;
      engine.debug.isometric.showGrid = true;
      engine.debug.isometric.showPosition = true;
      const clock = engine.clock as ex.TestClock;
      const image = new ex.ImageSource('/src/spec/assets/images/IsometricMapSpec/cube.png');
      await image.load();
      const sprite = image.toSprite();
      await TestUtils.runToReady(engine);

      const sut = new ex.IsometricMap({
        pos: ex.vec(250, 10),
        tileWidth: 32,
        tileHeight: 16,
        columns: 15,
        rows: 15
      });

      sut.tiles.forEach((tile) => tile.addGraphic(sprite));

      engine.add(sut);
      clock.step(100);

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/IsometricMapSpec/cube-map-debug.png');
      engine.dispose();
    });
  });

  it('can find a tile coordinate from a world position', async () => {
    const engine = TestUtils.engine({}, ['suppress-obsolete-message']);
    await TestUtils.runToReady(engine);

    const sut = new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });

    const topLeft = sut.worldToTile(ex.vec(250, 10));
    expect(topLeft).toBeVector(ex.vec(0, 0));

    const aboveTopLeft = sut.worldToTile(ex.vec(250, -10));
    expect(aboveTopLeft).toBeVector(ex.vec(-1, -1));

    const topRight = sut.worldToTile(ex.vec(15 * 32, 15 * 8));
    expect(topRight).toBeVector(ex.vec(14, 0));

    const bottomRight = sut.worldToTile(ex.vec(15 * 16, 15 * 16));
    expect(bottomRight).toBeVector(ex.vec(14, 14));

    const bottomLeft = sut.worldToTile(ex.vec(0, 15 * 8));
    expect(bottomLeft).toBeVector(ex.vec(0, 14));
    engine.dispose();
  });

  it('can find a top left world coordinate from a tile coordinate', async () => {
    const engine = TestUtils.engine({}, ['suppress-obsolete-message']);
    await TestUtils.runToReady(engine);

    const sut = new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });

    expect(sut.tileToWorld(ex.vec(0, 0))).toBeVector(ex.vec(250, 10));
    expect(sut.tiles[0].pos).toBeVector(ex.vec(250, 10));

    expect(sut.tileToWorld(ex.vec(-1, -1))).toBeVector(ex.vec(250, -6));

    expect(sut.tileToWorld(ex.vec(14, 0))).toBeVector(ex.vec(474, 122));

    expect(sut.tileToWorld(ex.vec(14, 14))).toBeVector(ex.vec(250, 234));
    expect(sut.tiles[sut.tiles.length - 1].pos).toBeVector(ex.vec(250, 234));

    expect(sut.tileToWorld(ex.vec(0, 14))).toBeVector(ex.vec(26, 122));
    engine.dispose();
  });

  it('can find the center of an isometric tile', () => {
    const sut = new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });

    const tile = sut.getTile(0, 0);
    expect(tile.center).toBeVector(ex.vec(250, 10 + 8));
  });

  it('can update colliders', () => {
    const sut = new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });

    sut.update();

    const collider = sut.collider.get() as ex.CompositeCollider;
    expect(collider.getColliders()).toEqual([]);
    sut.tiles[0].solid = true;
    sut.tiles[0].addCollider(ex.Shape.Box(10, 10));

    sut.update();

    expect(collider.getColliders().length).toBe(1);

    sut.tiles[0].clearColliders();

    sut.update();

    expect(collider.getColliders().length).toBe(0);

    sut.update();

    const box = ex.Shape.Box(10, 10);
    sut.tiles[0].addCollider(box);

    sut.update();

    expect(collider.getColliders().length).toBe(1);

    sut.tiles[0].removeCollider(box);

    sut.update();

    expect(collider.getColliders().length).toBe(0);
  });

  it('can update graphics', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/IsometricMapSpec/cube.png');
    await image.load();
    const sprite = image.toSprite();

    const sut = new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });

    sut.tiles[0].addGraphic(sprite);
    sut.tiles[0].addGraphic(sprite.clone());

    expect(sut.tiles[0].getGraphics().length).toBe(2);

    sut.tiles[0].removeGraphic(sprite);

    expect(sut.tiles[0].getGraphics().length).toBe(1);

    sut.tiles[0].clearGraphics();

    expect(sut.tiles[0].getGraphics().length).toBe(0);
  });

  it('can get a tile by coordinate', () => {
    const sut = new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });

    expect(sut.getTile(0, 0).pos).toBeVector(ex.vec(250, 10));
    expect(sut.getTile(14, 0).pos).toBeVector(ex.vec(474, 122));
    expect(sut.getTile(0, 14).pos).toBeVector(ex.vec(26, 122));
    expect(sut.getTile(14, 14).pos).toBeVector(ex.vec(250, 234));

    expect(sut.getTile(-1, -1)).toBeNull();
    expect(sut.getTile(15, 15)).toBeNull();

    expect(sut.getTileByPoint(ex.vec(250, 10)).x).toBe(0);
    expect(sut.getTileByPoint(ex.vec(250, 10)).y).toBe(0);

    expect(sut.getTileByPoint(ex.vec(474, 122)).x).toBe(14);
    expect(sut.getTileByPoint(ex.vec(474, 122)).y).toBe(0);

    expect(sut.getTileByPoint(ex.vec(26, 122)).x).toBe(0);
    expect(sut.getTileByPoint(ex.vec(26, 122)).y).toBe(14);

    expect(sut.getTileByPoint(ex.vec(250, 234)).x).toBe(14);
    expect(sut.getTileByPoint(ex.vec(250, 234)).y).toBe(14);
  });

  it('can respond to pointer events', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);
    const sut = new ex.IsometricMap({
      pos: ex.vec(100, 100),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });
    engine.add(sut);

    const tile = sut.getTile(0, 0);

    const pointerdown = vi.fn();
    const pointerup = vi.fn();
    const pointermove = vi.fn();
    const pointercancel = vi.fn();
    tile.on('pointerdown', pointerdown);
    tile.on('pointerup', pointerup);
    tile.on('pointermove', pointermove);
    tile.on('pointercancel', pointercancel);

    engine.input.pointers.triggerEvent('down', ex.vec(110, 110));
    engine.input.pointers.triggerEvent('up', ex.vec(110, 110));
    engine.input.pointers.triggerEvent('move', ex.vec(110, 110));
    engine.input.pointers.triggerEvent('cancel', ex.vec(110, 110));
    expect(pointerdown).toHaveBeenCalledTimes(1);
    expect(pointerup).toHaveBeenCalledTimes(1);
    expect(pointermove).toHaveBeenCalledTimes(1);
    expect(pointercancel).toHaveBeenCalledTimes(1);

    engine.dispose();
  });
});
