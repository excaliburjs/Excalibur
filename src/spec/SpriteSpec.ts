import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '../../build/dist/excalibur';
import { Mocks } from './util/Mocks';
import { TestUtils } from './util/TestUtils';

describe('A sprite', () => {
  let engine: ex.Engine;
  let texture: ex.Texture;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({
      width: 62,
      height: 64
    });

    texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should have props set by the constructor', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      expect(texture.isLoaded()).toBe(true);
      expect(sprite.x).toBe(0);
      expect(sprite.y).toBe(0);
      expect(sprite.width).toBe(62);
      expect(sprite.height).toBe(64);
      expect(sprite.rotation).toBe(0);
      expect(sprite.anchor.x).toBe(0.0);
      expect(sprite.anchor.y).toBe(0.0);
      expect(sprite.scale.x).toBe(1);
      expect(sprite.scale.y).toBe(1);
      expect(sprite.flipHorizontal).toBe(false);
      expect(sprite.flipVertical).toBe(false);

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should throw if no image texture is provided', () => {
    let s: ex.Sprite = null;
    try {
      s = new ex.Sprite({
        x: 1,
        y: 1,
        width: 1,
        height: 1
      });
    } catch (e) {
      expect(e.message).toBe('An image texture is required to contsruct a sprite');
    }
  });

  it('should scale about the anchor', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        scale: new ex.Vector(2, 2),
        anchor: new ex.Vector(0.5, 0.5)
      });

      sprite.draw(engine.ctx, 62 / 2, 64 / 2);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/iconscale.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should rotate about the anchor', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: Math.PI / 4,
        anchor: new ex.Vector(0.5, 0.5)
      });

      sprite.draw(engine.ctx, 62 / 2, 64 / 2);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/iconrotate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be inverted', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      sprite.invert();

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon-inverted.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be colorized', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      sprite.colorize(ex.Color.Blue.clone());

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon-colorized.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be lightened', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      sprite.lighten();

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon-lightened.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be darkened', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      sprite.darken();

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon-darkened.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be saturated', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      sprite.saturate();

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon-saturated.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be desaturated', (done) => {
    texture.load().then(() => {
      let sprite = new ex.Sprite({
        image: texture,
        x: 0,
        y: 0,
        width: 62,
        height: 64,
        rotation: 0,
        anchor: new ex.Vector(0.0, 0.0),
        scale: new ex.Vector(1, 1),
        flipVertical: false,
        flipHorizontal: false
      });

      sprite.desaturate();

      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteSpec/icon-desaturated.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should always have non-zero dimensions', (done) => {
    texture.load().then(() => {
      try {
        let sprite = new ex.Sprite({
          image: texture,
          x: 0,
          y: 0,
          width: 0,
          height: 1
        });
      } catch (e) {
        expect(e.message).toBe(`The width of a sprite cannot be 0 or negative, sprite width: ${this.width}, original width: 62`);
      }

      try {
        let sprite = new ex.Sprite({
          image: texture,
          x: 0,
          y: 0,
          width: 1,
          height: 0
        });
      } catch (e) {
        expect(e.message).toBe(`The height of a sprite cannot be 0 or negative, sprite height: ${this.height}, original height: 64`);
      }

      done();
    });
  });
});
