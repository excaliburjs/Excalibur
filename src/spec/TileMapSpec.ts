import { ExcaliburMatchers, ensureImagesLoaded, ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

const drawWithTransform = (ctx: CanvasRenderingContext2D | ex.Graphics.ExcaliburGraphicsContext, tm: ex.TileMap, delta: number = 1) => {
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
  let texture: ex.Texture;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    engine = TestUtils.engine({
      width: 800,
      height: 200
    });
    scene = new ex.Scene();
    engine.addScene('root', scene);
    engine.start();

    texture = new ex.Texture('src/spec/images/TileMapSpec/Blocks.png', true);
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
      x: 0,
      y: 0,
      cellWidth: 64,
      cellHeight: 48,
      rows: 4,
      cols: 20
    });

    expect(tm.x).toBe(0);
    expect(tm.y).toBe(0);
    expect(tm.cellWidth).toBe(64);
    expect(tm.cellHeight).toBe(48);
    expect(tm.rows).toBe(4);
    expect(tm.cols).toBe(20);
  });

  it('can iterate over rows and cols', () => {
    const tm = new ex.TileMap({
      x: 0,
      y: 0,
      cellWidth: 32,
      cellHeight: 32,
      rows: 3,
      cols: 5
    });

    expect(tm.getRows().length).toBe(3);
    expect(tm.getRows()[0].length).toBe(5);
    expect(tm.getRows()[0][4].x).toBe(4 * 32);
    expect(tm.getRows()[0][4].y).toBe(0);
    expect(tm.getRows()[2][4].x).toBe(4 * 32);
    expect(tm.getRows()[2][4].y).toBe(2 * 32);

    expect(tm.getColumns().length).toBe(5);
    expect(tm.getColumns()[0].length).toBe(3);
    expect(tm.getColumns()[4][0].x).toBe(4 * 32);
    expect(tm.getColumns()[4][0].y).toBe(0);
    expect(tm.getColumns()[4][2].x).toBe(4 * 32);
    expect(tm.getColumns()[4][2].y).toBe(2 * 32);
  });

  it('can store arbitrary data in cells', () => {
    const tm = new ex.TileMap({
      x: 0,
      y: 0,
      cellWidth: 32,
      cellHeight: 32,
      rows: 3,
      cols: 5
    });

    const cell = tm.getCell(4, 2);
    cell.data.set('some_value', 'anything');

    const otherCell = tm.getCell(4, 2);

    expect(otherCell.data.get('some_value')).toBe('anything');

    const otherCell2 = tm.getCell(0, 0);

    expect(otherCell2.data.get('some_vale')).not.toBeDefined();
  });

  it('can use arbitrary graphics', async () => {
    const tm = new ex.TileMap({
      x: 0,
      y: 0,
      cellWidth: 32,
      cellHeight: 32,
      rows: 3,
      cols: 5
    });
    tm._initialize(engine);

    const cell = tm.getCell(0, 0);
    const rectangle = new ex.Graphics.Rectangle({
      width: 32,
      height: 32,
      color: ex.Color.Red
    });
    const circle = new ex.Graphics.Circle({
      radius: 16,
      color: ex.Color.Blue
    });
    const animation = new ex.Graphics.Animation({
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
      x: 30,
      y: 30,
      cellWidth: 64,
      cellHeight: 48,
      rows: 3,
      cols: 7
    });
    const spriteTiles = new ex.SpriteSheet(texture, 1, 1, 64, 48);
    tm.data.forEach(function (cell: ex.Cell) {
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
      x: -100,
      y: -100,
      cellWidth: 64,
      cellHeight: 48,
      rows: 20,
      cols: 20
    });
    const spriteTiles = new ex.SpriteSheet(texture, 1, 1, 64, 48);
    tm.data.forEach(function (cell: ex.Cell) {
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
        x: 0,
        y: 0,
        cellWidth: 64,
        cellHeight: 48,
        rows: 10,
        cols: 10
      });
      tm.data.forEach(function (cell: ex.Cell) {
        cell.solid = true;
      });
    });

    it('should collide when the actor is on a solid cell', () => {
      const actor = new ex.Actor(0, 0, 20, 20);

      const collision = tm.collides(actor);

      expect(collision).not.toBeNull();
      expect(collision).toBeTruthy();
    });

    it('should not collide when the actor has zero size dimensions', () => {
      const actor = new ex.Actor(0, 0, 0, 0);

      const collision = tm.collides(actor);

      expect(collision).toBeNull();
    });
  });
});
