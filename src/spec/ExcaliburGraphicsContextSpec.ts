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
      expect(ex.ExcaliburGraphicsContext2DCanvas).toBeDefined();
    });

    it('can be constructed', () => {
      const canvas = document.createElement('canvas');
      const context = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(context).toBeDefined();
    });

    it('has the same dimensions as the canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 123;
      canvas.height = 456;
      const context = new ex.ExcaliburGraphicsContext2DCanvas({
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
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect._bitmap, 20, 20);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-drawgraphic.png');
    });

    it('can draw debug point', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
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
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
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
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Rectangle({
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
      sut.drawImage(rect._bitmap, -25, -25);
      sut.restore();

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-transform.png');
    });

    it('can draw rectangle', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.drawRectangle(ex.vec(10, 10), 80, 80, ex.Color.Blue);
      sut.flush();

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/webgl-solid-rect.png');
    });

    it('can draw circle', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Blue);
      sut.flush();

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-circle.png');
    });

    it('can draw a line', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.drawLine(ex.vec(0, 0), ex.vec(100, 100), ex.Color.Blue, 5);
      sut.flush();

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-line.png');
    });

    it('can snap drawings to pixel', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvasElement,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect._bitmap, 1.9, 1.9);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/2d-snap-to-pixel.png');
    });

    it('can handle drawing a zero dimension image', () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvasElement,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });
      const rect = new ex.Rectangle({
        width: 0,
        height: 0,
        color: ex.Color.Blue
      });
      sut.clear();

      expect(() => {
        sut.drawImage(rect._bitmap, 0, 0);
      }).not.toThrow();

      expect(() => {
        sut.drawImage(rect._bitmap, 0, 0, 0, 0);
      }).not.toThrow();

      expect(() => {
        sut.drawImage(rect._bitmap, 0, 0, 10, 10, 0, 0, 0, 0);
      }).not.toThrow();
    });
  });

  describe('WebGL', () => {
    beforeEach(() => {
      jasmine.addMatchers(ExcaliburMatchers);
      jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    });

    it('exists', () => {
      expect(ex.ExcaliburGraphicsContextWebGL).toBeDefined();
    });

    it('can be constructed', () => {
      const canvas = document.createElement('canvas');
      const context = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(context).toBeDefined();
    });
    it('will throw if an invalid renderer is specified', () => {
      const canvas = document.createElement('canvas');
      const context = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        backgroundColor: ex.Color.Red
      });
      expect(() => {
        context.draw('ex.doesnotexist', 1, 2, 3);
      }).toThrowError('No renderer with name ex.doesnotexist has been registered');
    });

    it('has the same dimensions as the canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 123;
      canvas.height = 456;
      const context = new ex.ExcaliburGraphicsContextWebGL({
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
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect._bitmap, 20, 20);
      // sut.opacity = .5;
      // sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Green);
      // sut.drawLine(ex.vec(10, 10), ex.vec(90, 90), ex.Color.Red, 5);
      // sut.drawLine(ex.vec(90, 10), ex.vec(10, 90), ex.Color.Red, 5);
      // sut.drawRectangle(ex.vec(10, 10), 80, 80, ex.Color.Blue);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/2d-drawgraphic.png'
      );
    });

    it('can draw debug point', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
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

    it('will log a warning if you attempt to draw outside the lifecycle', () => {
      const logger = ex.Logger.getInstance();
      spyOn(logger, 'warn').and.callThrough();

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;

      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.drawCircle(ex.vec(0, 0), 10, ex.Color.Blue);
      expect(logger.warn).toHaveBeenCalledWith(
        `Attempting to draw outside the the drawing lifecycle (preDraw/postDraw) is not supported and is a source of bugs/errors.\n`+
        `If you want to do custom drawing, use Actor.graphics, or any onPreDraw or onPostDraw handler.`);
    });

    it('will not log a warning inside the lifecycle', () => {
      const logger = ex.Logger.getInstance();
      spyOn(logger, 'warn').and.callThrough();

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;

      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });
      sut.beginDrawLifecycle();
      sut.drawCircle(ex.vec(0, 0), 10, ex.Color.Blue);
      expect(logger.warn).not.toHaveBeenCalled();
      sut.endDrawLifecycle();
    });

    it('will preserve the painter order when switching renderer', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const tex = new ex.ImageSource('src/spec/images/ExcaliburGraphicsContextSpec/sword.png');
      await tex.load();

      const circleRenderer = sut.get('ex.circle');
      spyOn(circleRenderer, 'flush').and.callThrough();
      const imageRenderer = sut.get('ex.image');
      spyOn(imageRenderer, 'flush').and.callThrough();
      const rectangleRenderer = sut.get('ex.rectangle');
      spyOn(rectangleRenderer, 'flush').and.callThrough();

      sut.drawCircle(ex.Vector.Zero, 100, ex.Color.Red, ex.Color.Black, 2);
      expect(circleRenderer.flush).withContext('circle is batched not flushed yet').not.toHaveBeenCalled();

      sut.drawImage(tex.image, 0, 0, tex.width, tex.height, 20, 20);
      expect(circleRenderer.flush).withContext('circle renderer switched, flush required').toHaveBeenCalled();
      expect(imageRenderer.flush).withContext('image batched not yet flushed').not.toHaveBeenCalled();

      sut.drawRectangle(ex.Vector.Zero, 50, 50, ex.Color.Blue, ex.Color.Green, 2);
      expect(imageRenderer.flush).toHaveBeenCalled();
      expect(rectangleRenderer.flush).withContext('rectangle batched').not.toHaveBeenCalled();

      sut.flush();
      expect(rectangleRenderer.flush).toHaveBeenCalled();

      expect(rectangleRenderer.flush).toHaveBeenCalledTimes(1);
      expect(circleRenderer.flush).toHaveBeenCalledTimes(1);
      expect(imageRenderer.flush).toHaveBeenCalledTimes(1);

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/painter-order-circle-image-rect.png'
      );
    });

    it('can draw debug line', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
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
      const sut = new ex.ExcaliburGraphicsContextWebGL({
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

    it('can draw rectangle', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.drawRectangle(ex.vec(10, 10), 80, 80, ex.Color.Blue);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-solid-rect.png'
      );
    });

    it('can draw circle', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Blue);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/webgl-circle.png');
    });

    it('can draw circle with opacity', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.opacity = 0.05;
      sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Blue);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-circle-with-opacity.png');
    });

    it('can draw circles in batches', () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();

      const circleRenderer = sut.get('ex.circle');
      spyOn(circleRenderer, 'flush').and.callThrough();
      for (let i = 0; i < 10922; i++) {
        sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Blue);
      }
      expect(circleRenderer.flush).toHaveBeenCalledTimes(0);

      sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Blue);
      expect(circleRenderer.flush).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 10922; i++) {
        sut.drawCircle(ex.vec(50, 50), 50, ex.Color.Blue);
      }
      expect(circleRenderer.flush).toHaveBeenCalledTimes(2);
    });

    it('can draw rectangles in batches', () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();

      const rectangleRenderer = sut.get('ex.rectangle');
      spyOn(rectangleRenderer, 'flush').and.callThrough();
      for (let i = 0; i < 10922; i++) {
        sut.drawRectangle(ex.vec(50, 50), 50, 50, ex.Color.Blue);
      }
      expect(rectangleRenderer.flush).toHaveBeenCalledTimes(0);

      sut.drawRectangle(ex.vec(50, 50), 50, 50, ex.Color.Blue);
      expect(rectangleRenderer.flush).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 10922; i++) {
        sut.drawRectangle(ex.vec(50, 50), 50, 50, ex.Color.Blue);
      }
      expect(rectangleRenderer.flush).toHaveBeenCalledTimes(2);
    });

    it('can draw images in batches', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();

      const tex = new ex.ImageSource('src/spec/images/ExcaliburGraphicsContextSpec/sword.png');
      await tex.load();

      const imageRenderer = sut.get('ex.image');
      spyOn(imageRenderer, 'flush').and.callThrough();
      for (let i = 0; i < 10922; i++) {
        sut.drawImage(tex.image, 0, 0);
      }
      expect(imageRenderer.flush).toHaveBeenCalledTimes(0);

      sut.drawImage(tex.image, 0, 0);
      expect(imageRenderer.flush).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 10922; i++) {
        sut.drawImage(tex.image, 0, 0);
      }
      expect(imageRenderer.flush).toHaveBeenCalledTimes(2);
    });

    it('can draw a line', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.drawLine(ex.vec(0, 0), ex.vec(100, 100), ex.Color.Blue, 5);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage('src/spec/images/ExcaliburGraphicsContextSpec/webgl-line.png');
    });

    it('can transform the context', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Rectangle({
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
      sut.drawImage(rect._bitmap, -25, -25);
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
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Rectangle({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect._bitmap, 1.9, 1.9);
      sut.flush();

      await expectAsync(flushWebGLCanvasTo2D(canvasElement)).toEqualImage(
        'src/spec/images/ExcaliburGraphicsContextSpec/2d-snap-to-pixel.png'
      );
    });

    it('can handle drawing a zero dimension image', () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const sut = new ex.ExcaliburGraphicsContextWebGL({
        canvasElement: canvasElement,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });
      const rect = new ex.Rectangle({
        width: 0,
        height: 0,
        color: ex.Color.Blue
      });
      sut.clear();

      expect(() => {
        sut.drawImage(rect._bitmap, 0, 0);
      }).not.toThrow();

      expect(() => {
        sut.drawImage(rect._bitmap, 0, 0, 0, 0);
        sut.flush();
      }).not.toThrow();

      expect(() => {
        sut.drawImage(rect._bitmap, 0, 0, 10, 10, 0, 0, 0, 0);
        sut.flush();
      }).not.toThrow();
    });
  });
});
