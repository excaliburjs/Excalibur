import * as ex from '@excalibur';

describe('DebugText', () => {
  it('exists', () => {
    expect(ex.DebugText);
  });

  it('can measure text dimensions with scale', async () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    const debugText = new ex.DebugText();
    await debugText.load();

    const small = debugText.measureText('some text', 1);
    const tiny = debugText.measureText('some text', 0.5);

    expect(small.width).toBeGreaterThan(0);
    expect(small.height).toBeGreaterThan(0);
    // Halving the scale should roughly halve the dimensions
    expect(tiny.width).toBeCloseTo(small.width / 2, 0);
    expect(tiny.height).toBeCloseTo(small.height / 2, 0);

    // The convenience passthrough on the graphics context debug API should agree
    const viaCtx = ctx.debug.measureText('some text', 1);
    expect(viaCtx.width).toBe(small.width);
    expect(viaCtx.height).toBe(small.height);
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

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/debug-text-spec/draw-canvas2d.png');
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

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/debug-text-spec/draw-webgl.png', 0.94);
    });
  });
});
