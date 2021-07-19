import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A spritesheet', () => {
  let engine: ex.Engine;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({
      width: 96,
      height: 96
    });
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should have props set by the constructor', (done) => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 21,
        rows: 1,
        spWidth: 96,
        spHeight: 96
      });

      expect(ss.image.isLoaded());
      expect(ss.columns).toBe(21);
      expect(ss.rows).toBe(1);
      expect(ss.spWidth).toBe(96);
      expect(ss.spHeight).toBe(96);

      expect(ss.sprites.length).toBe(21);

      ss.getSprite(0).draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSheetSpec/PlayerRun0.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should getAnimationByIndices', () => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 21,
        rows: 1,
        spWidth: 96,
        spHeight: 96
      });

      const frames = [0, 1, 2, 3, 4, 5, 5, 5, 5];
      const anim = ss.getAnimationByIndices(engine, frames, 50);

      expect(anim).not.toBeNull();
      expect(anim.sprites.length).toBe(frames.length);
      expect(anim.speed).toBe(50);
    });
  });

  it('should getAnimationBetween', () => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 21,
        rows: 1,
        spWidth: 96,
        spHeight: 96
      });

      const anim = ss.getAnimationBetween(engine, 0, 5, 50);

      expect(anim).not.toBeNull();
      expect(anim.sprites.length).toBe(5);
      expect(anim.speed).toBe(50);
    });
  });

  it('should getAnimationForAll', () => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 21,
        rows: 1,
        spWidth: 96,
        spHeight: 96
      });

      const anim = ss.getAnimationForAll(engine, 50);

      expect(anim).not.toBeNull();
      expect(anim.sprites.length).toBe(21);
      expect(anim.speed).toBe(50);
    });
  });

  it('should getSprite at an index', (done) => {
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 21,
        rows: 1,
        spWidth: 96,
        spHeight: 96
      });

      expect(ss.image.isLoaded());
      expect(ss.columns).toBe(21);
      expect(ss.rows).toBe(1);
      expect(ss.spWidth).toBe(96);
      expect(ss.spHeight).toBe(96);

      expect(ss.sprites.length).toBe(21);

      ss.getSprite(20).draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSheetSpec/PlayerRun20.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should getAnimationByBespokeCoords', (done) => {
    engine = TestUtils.engine({
      width: 162 + 89,
      height: 94
    });
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/genericItems_spritesheet_colored.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 0,
        rows: 0,
        spWidth: 96,
        spHeight: 96
      });

      const anim = ss.getAnimationByCoords(
        engine,
        [
          {
            x: 0,
            y: 322,
            width: 162,
            height: 94
          },
          {
            x: 130,
            y: 1791,
            width: 89,
            height: 45
          }
        ],
        20
      );

      anim.sprites[0].draw(engine.ctx, 0, 0);
      anim.sprites[1].draw(engine.ctx, 162, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSheetSpec/drillandcup.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should getSprite at an index with equal spacing', (done) => {
    engine = TestUtils.engine({
      width: 32,
      height: 32
    });
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/SpriteSheetSpacing.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 3,
        rows: 2,
        spWidth: 32,
        spHeight: 32,
        spacing: 1
      });

      expect(ss.image.isLoaded());
      expect(ss.columns).toBe(3);
      expect(ss.rows).toBe(2);
      expect(ss.spWidth).toBe(32);
      expect(ss.spHeight).toBe(32);

      expect(ss.sprites.length).toBe(6);

      ss.getSprite(4).draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSheetSpec/SpriteSheetSpacingSingle.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should getSprite at an index with custom spacing dimensions', (done) => {
    engine = TestUtils.engine({
      width: 32,
      height: 32
    });
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/SpriteSheetSpacingCustom.png', true);
    texture.load().then(() => {
      const ss = new ex.SpriteSheet({
        image: texture,
        columns: 3,
        rows: 2,
        spWidth: 32,
        spHeight: 32,
        spacing: {
          top: 0,
          left: 0,
          margin: 1
        }
      });

      expect(ss.image.isLoaded());
      expect(ss.columns).toBe(3);
      expect(ss.rows).toBe(2);
      expect(ss.spWidth).toBe(32);
      expect(ss.spHeight).toBe(32);

      expect(ss.sprites.length).toBe(6);

      ss.getSprite(4).draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSheetSpec/SpriteSheetSpacingSingle.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should throw Error SpriteSheet specified is wider than image width', (done) => {
    let error: any;
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      try {
        const ss = new ex.SpriteSheet({
          image: texture,
          columns: 22,
          rows: 1,
          spWidth: 96,
          spHeight: 96
        });
        expect(ss.image.isLoaded());
      } catch (e) {
        error = e;
      }
      const expectedError = new RangeError('SpriteSheet specified is wider, 22 cols x 96 pixels > 2016 pixels than image width');
      expect(error).toEqual(expectedError);
      done();
    });
  });

  it('should throw Error SpriteSheet specified is higher than image height', (done) => {
    let error: any;
    const texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
    texture.load().then(() => {
      try {
        const ss = new ex.SpriteSheet({
          image: texture,
          columns: 21,
          rows: 2,
          spWidth: 96,
          spHeight: 96
        });
        expect(ss.image.isLoaded());
      } catch (e) {
        error = e;
      }
      const expectedError = new RangeError('SpriteSheet specified is taller, 2 rows x 96 pixels > 96 pixels than image height');
      expect(error).toEqual(expectedError);
      done();
    });
  });
});
