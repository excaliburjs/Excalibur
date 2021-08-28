import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Gif', () => {
  let engine: ex.Engine;
  let gif: ex.Gif;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({
      width: 100,
      height: 100
    });

    gif = new ex.Gif('src/spec/images/GifSpec/sword.gif', ex.Color.Black.clone());
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should parse gif files correctly', (done) => {
    gif.load().then(() => {
      expect(gif).not.toBeNull();
      expect(gif.readCheckBytes).toEqual([11, 3, 4, 11, 4]);
      done();
    });
  });

  it('should load each frame', (done) => {
    gif.load().then(() => {
      expect(gif).toBeDefined();

      const spriteFrame: ex.LegacyDrawing.Sprite = gif.asSprite();
      expect(spriteFrame).toBeDefined();
      expect(spriteFrame.drawHeight).toBe(100);
      expect(spriteFrame.drawWidth).toBe(100);

      let sprite: ex.LegacyDrawing.Sprite = gif.asSprite();
      expect(gif.isLoaded()).toBe(true);
      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/GifSpec/frame1.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);

        engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);

        sprite = gif.asSprite(1);
        expect(gif.isLoaded()).toBe(true);
        sprite.draw(engine.ctx, 0, 0);
        ensureImagesLoaded(engine.canvas, 'src/spec/images/GifSpec/frame2.png').then(([canvas, image]) => {
          expect(canvas).toEqualImage(image);
          done();
        });
      });
    });
  });

  it('should be read as a SpriteSheet', (done) => {
    gif.load().then(() => {
      // jasmine.addMatchers(ExcaliburMatchers);
      expect(gif).toBeDefined();
      const spriteSheet: ex.LegacyDrawing.SpriteSheet = gif.asSpriteSheet();
      const sprite = spriteSheet.getSprite(0);
      sprite.draw(engine.ctx, 0, 0);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/GifSpec/frame1.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
        done();
      });
    });
  });

  it('should be read as an Animation', (done) => {
    gif.load().then(() => {
      expect(gif).toBeDefined();
      const animation: ex.LegacyDrawing.Animation = gif.asAnimation(engine, 500);

      expect(animation.sprites.length).toBe(2);
      const frame1 = animation.sprites[0];
      const frame2 = animation.sprites[1];

      frame2.draw(engine.ctx, 0, 0);
      ensureImagesLoaded(engine.canvas, 'src/spec/images/GifSpec/frame2.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        engine.ctx.clearRect(0, 0, engine.canvas.width, engine.canvas.height);
        done();
      });
    });
  });
});
