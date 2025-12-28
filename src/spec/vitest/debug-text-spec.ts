import * as ex from '@excalibur';

describe('DebugText', () => {
  it('exists', () => {
    expect(ex.DebugText);
  });

  describe('@visual', () => {
    it('can write text (2DCanvas)', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      const debugText = new ex.DebugText();

      await debugText.load();

      ctx.clear();

      debugText.write(ctx, 'some text', ex.vec(0, 50));

      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/DebugTextSpec/draw-canvas2d.png');
    });

    it('can write text (WebGL)', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContextWebGL({ canvasElement });

      const debugText = new ex.DebugText();

      await debugText.load();

      ctx.clear();

      debugText.write(ctx, 'some text', ex.vec(0, 50));

      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/DebugTextSpec/draw-webgl.png', 0.94);
    });
  });
});
