import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A Gif', () => {
  let engine: ex.Engine;
  let gif: ex.Gif;
  beforeEach(() => {
    engine = TestUtils.engine({
      width: 100,
      height: 100
    });

    gif = new ex.Gif('/src/spec/assets/images/GifSpec/sword.gif');
  });
  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('should parse gif files correctly', () =>
    new Promise<void>((done) => {
      gif.load().then(() => {
        expect(gif).not.toBeNull();
        expect(gif.readCheckBytes).toEqual([11, 3, 4, 11, 4]);
        done();
      });
    }));

  describe('@visual', () => {
    it('should parse gifs that have lct & anim params', async () => {
      const sut = new ex.Gif('/src/spec/assets/images/GifSpec/loading-screen.gif');
      await sut.load();

      const sprite = sut.toSprite(20);
      expect(sut.isLoaded()).toBe(true);

      sprite.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/loading-frame-20.png');
    });

    it('should parse gifs that have animations with sub frames', async () => {
      const sut = new ex.Gif('/src/spec/assets/images/GifSpec/stoplight.gif');
      await sut.load();
      expect(sut.isLoaded()).toBe(true);

      const sprite2 = sut.toSprite(2);
      sprite2.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/stoplight-frame-3.png');

      const sprite1 = sut.toSprite(1);
      sprite1.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/stoplight-frame-2.png');

      const sprite0 = sut.toSprite(0);
      sprite0.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/stoplight-frame-1.png');
    });

    it('should load each frame', async () => {
      await gif.load();
      expect(gif).toBeDefined();

      const spriteFrame: ex.Sprite = gif.toSprite();
      expect(spriteFrame).toBeDefined();
      expect(spriteFrame.height).toBe(100);
      expect(spriteFrame.width).toBe(100);

      let sprite: ex.Sprite = gif.toSprite();
      expect(gif.isLoaded()).toBe(true);
      sprite.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/frame1.png');
      engine.graphicsContext.backgroundColor = ex.Color.Transparent;
      engine.graphicsContext.clear();

      sprite = gif.toSprite(1);
      expect(gif.isLoaded()).toBe(true);
      sprite.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/frame2.png');
    });

    it('should be read as a SpriteSheet', async () => {
      await gif.load();
      expect(gif).toBeDefined();
      const spriteSheet: ex.SpriteSheet = gif.toSpriteSheet();
      const sprite = spriteSheet.getSprite(0, 0);
      sprite.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/frame1.png');
    });

    it('should be read as an Animation', async () => {
      await gif.load();
      expect(gif).toBeDefined();
      const animation: ex.Animation = gif.toAnimation(500);

      expect(animation.frames.length).toBe(2);
      const frame1 = animation.frames[0];
      const frame2 = animation.frames[1];

      frame2.graphic.draw(engine.graphicsContext, 0, 0);
      engine.graphicsContext.flush();

      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/GifSpec/frame2.png');
    });
  });
});
