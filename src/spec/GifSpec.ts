import { ExcaliburMatchers, ensureImagesLoaded, ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Gif', () => {
  let engine: ex.Engine;
  let gif: ex.Gif;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
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

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/GifSpec/frame1.png');
    engine.graphicsContext.backgroundColor = ex.Color.Transparent;
    engine.graphicsContext.clear();

    sprite = gif.toSprite(1);
    expect(gif.isLoaded()).toBe(true);
    sprite.draw(engine.graphicsContext, 0, 0);
    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/GifSpec/frame2.png');
  });

  it('should be read as a SpriteSheet', async () => {
    await gif.load();
    expect(gif).toBeDefined();
    const spriteSheet: ex.SpriteSheet = gif.toSpriteSheet();
    const sprite = spriteSheet.getSprite(0, 0);
    sprite.draw(engine.graphicsContext, 0, 0);
    engine.graphicsContext.flush();

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/GifSpec/frame1.png');
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

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(engine.canvas)).toEqualImage('src/spec/images/GifSpec/frame2.png');
  });
});
