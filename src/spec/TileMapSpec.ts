import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('A TileMap', () => {
  let engine: ex.Engine;
  let texture: ex.Texture;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({
      width: 800,
      height: 200
    });

    texture = new ex.Texture('base/src/spec/images/TileMapSpec/Blocks.png', true);
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

  it('should draw the correct proportions', (done) => {
    texture.load().then(() => {
      const tm = new ex.TileMap({
        x: 30,
        y: 30,
        cellWidth: 64,
        cellHeight: 48,
        rows: 3,
        cols: 7
      });
      const spriteTiles = new ex.SpriteSheet(texture, 1, 1, 64, 48);
      tm.registerSpriteSheet('default', spriteTiles);
      tm.data.forEach((cell: ex.Cell) => {
        cell.solid = true;
        cell.pushSprite(new ex.TileSprite('default', 0));
      });

      tm.draw(engine.ctx, 100);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/TileMapSpec/TileMap.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should handle offscreen culling correctly with negative coords', (done) => {
    texture.load().then(() => {
      const tm = new ex.TileMap({
        x: -100,
        y: -100,
        cellWidth: 64,
        cellHeight: 48,
        rows: 20,
        cols: 20
      });
      const spriteTiles = new ex.SpriteSheet(texture, 1, 1, 64, 48);
      tm.registerSpriteSheet('default', spriteTiles);
      tm.data.forEach(function(cell: ex.Cell) {
        cell.solid = true;
        cell.pushSprite(new ex.TileSprite('default', 0));
      });

      tm.update(engine, 100);
      tm.draw(engine.ctx, 100);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/TileMapSpec/TileMapCulling.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});
