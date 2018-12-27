/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="Mocks.ts" />

describe('A Gif', () => {
  let engine: ex.Engine;
  let gif: ex.Gif;
  beforeEach(() => {
    jasmine.addMatchers(imagediff.jasmine);
    engine = TestUtils.engine({
      width: 100,
      height: 100
    });

    gif = new ex.Gif('base/src/spec/images/GifSpec/sword.gif');
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should load', (done) => {
    gif.load().then(() => {
      expect(gif).toBeDefined();

      let spriteFrame: ex.Sprite = gif.asSprite();
      expect(spriteFrame).toBeDefined();
      expect(spriteFrame.drawHeight).toBe(100);
      expect(spriteFrame.drawWidth).toBe(100);

      var sprite = gif.asSprite();
      var actor = new ex.Actor(0, 0, gif.width, gif.height);
      actor.addDrawing(sprite);
      engine.add(actor);

      imagediff.expectCanvasImageMatches('GifSpec/frame1.png', engine.canvas, done);
    });
  });
});
