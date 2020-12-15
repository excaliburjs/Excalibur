import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

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

describe('The ExcaliburGraphicsContext', () => {
  describe('2D', () => {
    beforeEach(() => {
      jasmine.addMatchers(ExcaliburMatchers);
      jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    });

    it('exists', () => {
      expect(ex.Graphics.ExcaliburGraphicsContext2DCanvas).toBeDefined();
    });

    it('can be constructed', () => {
      const canvas = document.createElement('canvas');
      const context = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(context).toBeDefined();
    });

    it('has the same dimensions as the canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 123;
      canvas.height = 456;
      const context = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(context.width).toBe(canvas.width);
      expect(context.height).toBe(canvas.height);
    });

    it('can draw a graphic', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 20, 20);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-drawgraphic.png');
    });

    it('can draw debug point', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawPoint(ex.vec(50, 50), {
        size: 20,
        color: ex.Color.Blue
      });

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-drawpoint.png');
    });

    it('can draw debug line', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawLine(ex.vec(0, 0), ex.vec(100, 100), {
        color: ex.Color.Blue
      });

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-drawline.png');
    });

    it('can transform the context', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.save();
      sut.opacity = 0.5;
      sut.translate(50, 50);
      sut.rotate(Math.PI / 4);
      sut.scale(0.5, 0.5);
      sut.drawImage(rect, -25, -25);
      sut.restore();

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-transform.png');
    });

    it('can snap drawings to pixel', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvasElement,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 1.9, 1.9);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-snap-to-pixel.png');
    });
  });

  describe('WebGL', () => {
    beforeEach(() => {
      jasmine.addMatchers(ExcaliburMatchers);
      jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    });

    it('exists', () => {
      expect(ex.Graphics.ExcaliburGraphicsContextWebGL).toBeDefined();
    });

    it('can be constructed', () => {
      const canvas = document.createElement('canvas');
      const context = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(context).toBeDefined();
    });

    it('has the same dimensions as the canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 123;
      canvas.height = 456;
      const context = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(context.width).toBe(canvas.width);
      expect(context.height).toBe(canvas.height);
    });

    it('can draw a graphic', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 20, 20);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/2d-drawgraphic.png'
      );
    });

    it('can draw debug point', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawPoint(ex.vec(50, 50), {
        size: 20,
        color: ex.Color.Blue
      });
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-drawpoint.png'
      );
    });

    it('can draw debug line', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawLine(ex.vec(0, 0), ex.vec(100, 100), {
        color: ex.Color.Blue
      });
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-drawline.png'
      );
    });

    it('can draw debug rectangle', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawRect(10, 10, 80, 80, {
        color: ex.Color.Blue
      });
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/webgl-rect.png');
    });

    it('can transform the context', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.save();
      sut.opacity = 0.5;
      sut.translate(50, 50);
      sut.rotate(Math.PI / 4);
      sut.scale(0.5, 0.5);
      sut.drawImage(rect, -25, -25);
      sut.restore();
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-transform.png'
      );
    });

    it('can snap drawings to pixel', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 1.9, 1.9);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/2d-snap-to-pixel.png'
      );
    });
  });
});
