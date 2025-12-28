import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';
import { BodyComponent } from '@excalibur';
import { ColliderComponent } from '../../engine/collision/collider-component';

const drawWithTransform = (ctx: ex.ExcaliburGraphicsContext, tm: ex.TileMap, elapsedMs: number = 1) => {
  ctx.save();
  ctx.translate(tm.pos.x, tm.pos.y);
  ctx.rotate(tm.rotation);
  ctx.scale(tm.scale.x, tm.scale.y);
  tm.draw(ctx, elapsedMs);
  ctx.restore();
};

describe('A TileMap', () => {
  let engine: ex.Engine;
  let scene: ex.Scene;
  let texture: ex.ImageSource;
  beforeEach(async () => {
    engine = TestUtils.engine({
      width: 800,
      height: 200
    });
    scene = new ex.Scene();
    engine.addScene('root', scene);
    await TestUtils.runToReady(engine);
    const clock = engine.clock as ex.TestClock;
    texture = new ex.ImageSource('/src/spec/assets/images/TileMapSpec/Blocks.png');
    await texture.load();
    clock.step(1);
  });
  afterEach(() => {
    engine.stop();
    engine.dispose();
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
      rows: 4,
      columns: 20
    });

    expect(tm.pos.x).toBe(0);
    expect(tm.pos.y).toBe(0);
    expect(tm.tileWidth).toBe(64);
    expect(tm.tileHeight).toBe(48);
    expect(tm.rows).toBe(4);
    expect(tm.columns).toBe(20);
  });

  it('can set the z-index convenience prop', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      rows: 3,
      columns: 5
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
      rows: 3,
      columns: 5
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

  it('can pack tile colliders', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(200, 200),
      tileWidth: 16,
      tileHeight: 16,
      columns: 6,
      rows: 4
    });
    tm._initialize(engine);

    tm.getTile(0, 0).solid = true;
    tm.getTile(0, 1).solid = true;
    tm.getTile(0, 2).solid = true;
    tm.getTile(0, 3).solid = true;

    tm.getTile(1, 0).solid = false;
    tm.getTile(1, 1).solid = false;
    tm.getTile(1, 2).solid = false;
    tm.getTile(1, 3).solid = false;

    tm.getTile(2, 0).solid = false;
    tm.getTile(2, 1).solid = false;
    tm.getTile(2, 2).solid = false;
    tm.getTile(2, 3).solid = false;

    tm.getTile(3, 0).solid = true;
    tm.getTile(3, 1).solid = true;
    tm.getTile(3, 2).solid = true;
    tm.getTile(3, 3).solid = true;

    tm.getTile(4, 0).solid = true;
    tm.getTile(4, 1).solid = true;
    tm.getTile(4, 2).solid = true;
    tm.getTile(4, 3).solid = true;

    tm.flagCollidersDirty();

    tm.update(engine, 1);

    const collider = tm.get(ex.ColliderComponent);
    const composite = collider.get() as ex.CompositeCollider;
    const colliders = composite.getColliders();

    expect(colliders.length).toBe(2);
    expect(colliders[0].bounds.top).toBe(200);
    expect(colliders[0].bounds.left).toBe(200);
    expect(colliders[0].bounds.right).toBe(216);
    expect(colliders[0].bounds.bottom).toBe(264);

    expect(colliders[1].bounds.left).toBe(248);
    expect(colliders[1].bounds.right).toBe(280);
    expect(colliders[1].bounds.top).toBe(200);
    expect(colliders[1].bounds.bottom).toBe(264);
  });

  it('can store arbitrary data in cells', () => {
    const tm = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 32,
      tileHeight: 32,
      rows: 3,
      columns: 5
    });

    const cell = tm.getTile(4, 2);
    cell.data.set('some_value', 'anything');

    const otherCell = tm.getTile(4, 2);

    expect(otherCell.data.get('some_value')).toBe('anything');

    const otherCell2 = tm.getTile(0, 0);

    expect(otherCell2.data.get('some_vale')).not.toBeDefined();
  });

  describe('@visual', () => {
    it('can use arbitrary graphics', async () => {
      const tm = new ex.TileMap({
        pos: ex.vec(0, 0),
        tileWidth: 32,
        tileHeight: 32,
        rows: 3,
        columns: 5
      });
      tm._initialize(engine);
      tm.update(engine, 99);

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
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/TileMapGraphicSquare.png');

      tm.update(engine, 99);

      drawWithTransform(engine.graphicsContext, tm, 99);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/TileMapGraphicCircle.png');
    });

    it('should draw the correct proportions', async () => {
      await texture.load();
      const tm = new ex.TileMap({
        pos: ex.vec(30, 30),
        tileWidth: 64,
        tileHeight: 48,
        rows: 3,
        columns: 7
      });
      const spriteTiles = ex.SpriteSheet.fromImageSource({
        image: texture,
        grid: {
          rows: 1,
          columns: 1,
          spriteWidth: 64,
          spriteHeight: 48
        }
      });
      tm.tiles.forEach(function (cell: ex.Tile) {
        cell.solid = true;
        cell.addGraphic(spriteTiles.sprites[0]);
      });
      tm._initialize(engine);

      drawWithTransform(engine.graphicsContext, tm, 100);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/TileMap.png');
    });

    it('should draw from the bottom', async () => {
      const tm = new ex.TileMap({
        pos: ex.vec(30, 30),
        tileWidth: 64,
        tileHeight: 48,
        rows: 3,
        columns: 7
      });
      const tileGraphic = new ex.Rectangle({
        color: ex.Color.Red,
        strokeColor: ex.Color.Black,
        width: 64,
        height: 64
      });
      tm.tiles.forEach(function (cell: ex.Tile) {
        cell.solid = true;
        cell.addGraphic(tileGraphic);
      });
      tm._initialize(engine);

      drawWithTransform(engine.graphicsContext, tm, 100);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/tilemap-from-bottom.png');
    });

    it('should draw from the top', async () => {
      const tm = new ex.TileMap({
        pos: ex.vec(30, 30),
        tileWidth: 64,
        tileHeight: 48,
        rows: 3,
        columns: 7,
        renderFromTopOfGraphic: true
      });
      const tileGraphic = new ex.Rectangle({
        color: ex.Color.Red,
        strokeColor: ex.Color.Black,
        width: 64,
        height: 64
      });
      tm.tiles.forEach(function (cell: ex.Tile) {
        cell.solid = true;
        cell.addGraphic(tileGraphic);
      });
      tm._initialize(engine);

      drawWithTransform(engine.graphicsContext, tm, 100);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/tilemap-from-top.png');
    });

    it('should handle offscreen culling correctly with negative coords', async () => {
      await texture.load();
      const tm = new ex.TileMap({
        pos: ex.vec(-100, -100),
        tileWidth: 64,
        tileHeight: 48,
        rows: 20,
        columns: 20
      });
      const spriteTiles = ex.SpriteSheet.fromImageSource({
        image: texture,
        grid: {
          rows: 1,
          columns: 1,
          spriteWidth: 64,
          spriteHeight: 48
        }
      });
      tm.tiles.forEach(function (cell: ex.Tile) {
        cell.solid = true;
        cell.addGraphic(spriteTiles.sprites[0]);
      });
      tm._initialize(engine);

      tm.update(engine, 100);

      drawWithTransform(engine.graphicsContext, tm, 100);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/TileMapCulling.png');
    });

    it('should handle offscreen culling correctly when scaled', async () => {
      await texture.load();
      const tm = new ex.TileMap({
        pos: ex.vec(100, 100),
        tileWidth: 64,
        tileHeight: 48,
        rows: 20,
        columns: 20
      });
      tm.scale = ex.vec(2, 2);
      const spriteTiles = ex.SpriteSheet.fromImageSource({
        image: texture,
        grid: {
          rows: 1,
          columns: 1,
          spriteWidth: 64,
          spriteHeight: 48
        }
      });
      tm.tiles.forEach(function (cell: ex.Tile) {
        cell.solid = true;
        cell.addGraphic(spriteTiles.sprites[0]);
      });
      tm._initialize(engine);
      engine.currentScene.add(tm);

      engine.currentScene.camera.x = 600;
      engine.currentScene.update(engine, 100);
      engine.currentScene.draw(engine.graphicsContext, 100);
      engine.graphicsContext.flush();

      expect(tm.getTile(0, 0).bounds).toEqual(
        new ex.BoundingBox({
          left: 100,
          top: 100,
          right: 228,
          bottom: 196
        })
      );

      expect(tm.getTile(1, 0).bounds).toEqual(
        new ex.BoundingBox({
          left: 228,
          top: 100,
          right: 356,
          bottom: 196
        })
      );

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/TileMapSpec/tilemap-scaled.png');
    });
  });

  it('can return a tile by xy coord', () => {
    const sut = new ex.TileMap({
      pos: ex.vec(-100, -100),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });

    expect(sut.pos).toBeVector(ex.vec(-100, -100));
    const tile = sut.getTile(19, 19);
    expect(tile.x).toBe(19);
    expect(tile.y).toBe(19);
    expect(tile.pos).toBeVector(ex.vec(19 * 64 - 100, 19 * 48 - 100));

    const nullTile = sut.getTile(20, 20);
    expect(nullTile).toBeNull();

    expect(sut.getTileByPoint(ex.vec(19 * 64 - 100, 19 * 48 - 100)).x).toBe(19);
    expect(sut.getTileByPoint(ex.vec(19 * 64 - 100, 19 * 48 - 100)).y).toBe(19);
    expect(sut.getTileByPoint(ex.vec(19 * 64, 19 * 48))).toBeNull();

    expect(sut.getTileByIndex(20 * 20 - 1)).toBe(tile);
  });

  it('can return a tile by xy coord when scaled', () => {
    const sut = new ex.TileMap({
      pos: ex.vec(-100, -100),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });
    sut.scale = ex.vec(2, 2);
    sut.flagTilesDirty();

    expect(sut.pos).toBeVector(ex.vec(-100, -100));
    const tile = sut.getTile(19, 19);
    expect(tile.x).toBe(19);
    expect(tile.y).toBe(19);
    expect(tile.pos).toBeVector(ex.vec(19 * 64 * 2 - 100, 19 * 48 * 2 - 100));

    const nullTile = sut.getTile(20, 20);
    expect(nullTile).toBeNull();

    expect(sut.getTileByPoint(ex.vec(19 * 64 * 2 - 100, 19 * 48 * 2 - 100)).x).toBe(19);
    expect(sut.getTileByPoint(ex.vec(19 * 64 * 2 - 100, 19 * 48 * 2 - 100)).y).toBe(19);
    expect(sut.getTileByPoint(ex.vec(19 * 64 * 2, 19 * 48 * 2))).toBeNull();

    expect(sut.getTileByIndex(20 * 20 - 1)).toBe(tile);
  });

  it('can add and remove graphics on a tile', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/TileMapSpec/Blocks.png');
    await image.load();
    const sprite = image.toSprite();
    const sut = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });
    const tile = sut.getTile(0, 0);

    tile.addGraphic(sprite);
    tile.addGraphic(sprite.clone());

    expect(tile.getGraphics().length).toBe(2);

    tile.removeGraphic(sprite);

    expect(tile.getGraphics().length).toBe(1);

    tile.clearGraphics();

    expect(tile.getGraphics().length).toBe(0);
  });

  it('can add and remove colliders on a tile', () => {
    const engine = TestUtils.engine();
    const sut = new ex.TileMap({
      pos: ex.vec(0, 0),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });

    const tile = sut.getTile(0, 0);
    tile.solid = true;

    const box = ex.Shape.Box(10, 10);

    tile.addCollider(box);
    tile.addCollider(box.clone());
    sut.update(engine, 0);
    const tileMapCollider = sut.get(ColliderComponent).get() as ex.CompositeCollider;

    expect(tile.getColliders().length).toBe(2);
    expect(tileMapCollider.getColliders().length).toBe(2);

    tile.removeCollider(box);

    expect(tile.getColliders().length).toBe(1);

    tile.clearColliders();
    tile.solid = false;
    sut.update(engine, 0);

    expect(tile.getColliders().length).toBe(0);
    const tileMapCollider2 = sut.get(ColliderComponent).get() as ex.CompositeCollider;
    expect(tileMapCollider2.getColliders().length).toBe(0);
    engine.dispose();
  });

  it('can get the bounds of a tile', () => {
    const sut = new ex.TileMap({
      pos: ex.vec(100, 100),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });

    const tile = sut.getTile(0, 0);
    expect(tile.bounds).toEqual(
      new ex.BoundingBox({
        left: 100,
        top: 100,
        right: 164,
        bottom: 148
      })
    );
  });

  it('can get the center of a tile', () => {
    const sut = new ex.TileMap({
      pos: ex.vec(100, 100),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });

    const tile = sut.getTile(0, 0);
    expect(tile.center).toBeVector(ex.vec(132, 124));
  });

  it('can respond to pointer events', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);
    const sut = new ex.TileMap({
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

  describe('with an actor', () => {
    let tm: ex.TileMap;
    beforeEach(() => {
      tm = new ex.TileMap({
        pos: ex.vec(0, 0),
        tileWidth: 64,
        tileHeight: 48,
        rows: 10,
        columns: 10
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
