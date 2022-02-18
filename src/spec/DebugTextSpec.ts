import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

/**
 *
 */
function flushWebGLCanvasTo2D(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0);
  return canvas;
}

describe('DebugText', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  it('exists', () => {
    expect(ex.DebugText);
  });

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

    await expectAsync(canvasElement).toEqualImage('src/spec/images/DebugTextSpec/draw-canvas2d.png');
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

    await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage('src/spec/images/DebugTextSpec/draw-webgl.png', .94);
  });
});
