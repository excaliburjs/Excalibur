import { ExcaliburMatchers, ensureImagesLoaded, ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { BodyComponent } from '@excalibur';
import { ColliderComponent } from '../engine/Collision/ColliderComponent';

const drawWithTransform = (ctx: CanvasRenderingContext2D | ex.ExcaliburGraphicsContext, tm: ex.TileMap, delta: number = 1) => {
  ctx.save();
  ctx.translate(tm.pos.x, tm.pos.y);
  ctx.rotate(tm.rotation);
  ctx.scale(tm.scale.x, tm.scale.y);
  tm.draw(ctx, delta);
  ctx.restore();
};

describe('A TileMap', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  let texture: ex.LegacyDrawing.Texture;
  beforeEach(async () => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    engine = TestUtils.engine({
      width: 800,
      height: 200
    });
    scene = new ex.Scene();
    engine.addScene('root', scene);
    engine.start();
    const clock = engine.clock as ex.TestClock;
    texture = new ex.LegacyDrawing.Texture('src/spec/images/TileMapSpec/Blocks.png', true);
    await texture.load();
    clock.step(1);
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('exists', () => {
    expect(ex.TileMap).toBeDefined();
  });

  it('should have props set by the constructor', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 64,
      tileHeight: 48,
      height: 4,
      width: 20
    });

    expect(tm.pos.x).toBe(0);
    expect(tm.pos.y).toBe(0);
    expect(tm.tileWidth).toBe(64);
    expect(tm.tileHeight).toBe(48);
    expect(tm.height).toBe(4);
    expect(tm.width).toBe(20);
  });

  it('can set the z-index convenience prop', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      height: 3,
      width: 5
    });

    tm.z = 99;
    const tx = tm.get(ex.TransformComponent);
    expect(tm.z).toEqual(99);
    expect(tx.z).toEqual(99);
  });

  it('can iterate over rows and cols', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      height: 3,
      width: 5
    });

    expect(tm.getRows().length).toBe(3);
    expect(tm.getRows()[0].length).toBe(5);
    expect(tm.getRows()[0][4].pos.x).toBe(4 * 32);
    expect(tm.getRows()[0][4].x).toBe(4);
    expect(tm.getRows()[0][4].y).toBe(0);
    expect(tm.getRows()[2][4].pos.x).toBe(4 * 32);
    expect(tm.getRows()[2][4].x).toBe(4);
    expect(tm.getRows()[2][4].pos.y).toBe(2 * 32);
    expect(tm.getRows()[2][4].y).toBe(2);

    expect(tm.getColumns().length).toBe(5);
    expect(tm.getColumns()[0].length).toBe(3);
    expect(tm.getColumns()[4][0].pos.x).toBe(4 * 32);
    expect(tm.getColumns()[4][0].x).toBe(4);
    expect(tm.getColumns()[4][0].y).toBe(0);
    expect(tm.getColumns()[4][2].pos.x).toBe(4 * 32);
    expect(tm.getColumns()[4][2].pos.y).toBe(2 * 32);
    expect(tm.getColumns()[4][2].x).toBe(4);
    expect(tm.getColumns()[4][2].y).toBe(2);
  });

  it('can store arbitrary data in cells', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      height: 3,
      width: 5
    });

    const cell = tm.getTile(4, 2);
    cell.data.set('some_value', 'anything');

    const otherCell = tm.getTile(4, 2);

    expect(otherCell.data.get('some_value')).toBe('anything');

    const otherCell2 = tm.getTile(0, 0);

    expect(otherCell2.data.get('some_vale')).not.toBeDefined();
  });

  it('can use arbitrary graphics', async () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      height: 3,
      width: 5
    });
    tm._initialize(engine);

    const cell = tm.getTile(0, 0);
    const rectangle = new ex.Rectangle({
      width: 32,
      height: 32,
      color: ex.Color.Red
    });
    const circle = new ex.Circle({
      radius: 16,
      color: ex.Color.Blue
    });
    const animation = new ex.Animation({
      frames: [
        { graphic: rectangle, duration: 100 },
        { graphic: circle, duration: 100 }
      ]
    });

    cell.addGraphic(animation);

    drawWithTransform(engine.graphicsContext, tm, 99);

    await expectAsync(engine.canvas).toEqualImage('src/spec/images/TileMapSpec/TileMapGraphicSquare.png');

    tm.update(engine, 99);

    drawWithTransform(engine.graphicsContext, tm, 99);

    await expectAsync(engine.canvas).toEqualImage('src/spec/images/TileMapSpec/TileMapGraphicCircle.png');
  });

  it('should draw the correct proportions', async () => {
    await texture.load();
    const tm = new ex.TileMap({
      pos: ex.vec(30, 30),
      tileWidth: 64,
      tileHeight: 48,
      height: 3,
      width: 7
    });
    const spriteTiles = new ex.LegacyDrawing.SpriteSheet(texture, 1, 1, 64, 48);
    tm.tiles.forEach(function (cell: ex.Tile) {
      cell.solid = true;
      cell.addGraphic(spriteTiles.sprites[0]);
    });
    tm._initialize(engine);

    drawWithTransform(engine.graphicsContext, tm, 100);

    await expectAsync(engine.canvas).toEqualImage('src/spec/images/TileMapSpec/TileMap.png');
  });

  it('should handle offscreen culling correctly with negative coords', async () => {
    await texture.load();
    const tm = new ex.TileMap({
      pos: ex.vec(-100, -100),
      tileWidth: 64,
      tileHeight: 48,
      height: 20,
      width: 20
    });
    const spriteTiles = new ex.LegacyDrawing.SpriteSheet(texture, 1, 1, 64, 48);
    tm.tiles.forEach(function (cell: ex.Tile) {
      cell.solid = true;
      cell.addGraphic(spriteTiles.sprites[0]);
    });
    tm._initialize(engine);

    tm.update(engine, 100);

    drawWithTransform(engine.graphicsContext, tm, 100);

    await expectAsync(engine.canvas).toEqualImage('src/spec/images/TileMapSpec/TileMapCulling.png');
  });

  describe('with an actor', () => {
    let tm: ex.TileMap;
    beforeEach(() => {
      tm = new ex.TileMap({
        pos: ex.vec(0, 0),
        tileWidth: 64,
        tileHeight: 48,
        height: 10,
        width: 10
      });
      tm.tiles.forEach(function (cell: ex.Tile) {
        cell.solid = true;
      });
    });

    it('should collide when the actor is on a solid cell', () => {
      const actor = new ex.Actor({ width: 20, height: 20 });

      tm.update(engine, 1);
      const collision = tm.get(ColliderComponent).collide(actor.collider);

      expect(collision).not.toBeNull();
      expect(collision).toBeTruthy();
    });

    it('should not collide when the actor has zero size dimensions', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 0, height: 0 });
      // retry
      tm.update(engine, 1);
      const collision = tm.get(ColliderComponent).collide(actor.collider);

      expect(collision).toEqual([]);
    });
  });
});
