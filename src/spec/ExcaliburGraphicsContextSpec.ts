import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

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

fdescribe('The ExcaliburGraphicsContext', () => {

  describe('2D', () => {
    beforeEach(() => {
      jasmine.addMatchers(ExcaliburMatchers);
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

    it('can draw a graphic', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rect({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 20, 20);

      ensureImagesLoaded(canvas, 'src/spec/images/ExcaliburGraphicsContextSpec/2d-drawgraphic.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can draw debug point', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawPoint(ex.vec(50, 50), {
        size: 20,
        color: ex.Color.Blue
      });

      ensureImagesLoaded(canvas, 'src/spec/images/ExcaliburGraphicsContextSpec/2d-drawpoint.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can draw debug line', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawLine(ex.vec(0, 0), ex.vec(100, 100), {
        color: ex.Color.Blue
      });

      ensureImagesLoaded(canvas, 'src/spec/images/ExcaliburGraphicsContextSpec/2d-drawline.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can transform the context', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rect({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.save();
      sut.opacity = .5;
      sut.translate(50, 50);
      sut.rotate(Math.PI / 4);
      sut.scale(.5, .5);
      sut.drawImage(rect, -25, -25);
      sut.restore();

      ensureImagesLoaded(canvas, 'src/spec/images/ExcaliburGraphicsContextSpec/2d-transform.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can snap drawings to pixel', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({
        canvasElement: canvas,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rect({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 1.9, 1.9);

      ensureImagesLoaded(canvas, 'src/spec/images/ExcaliburGraphicsContextSpec/2d-snap-to-pixel.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  describe('WebGL', () => {
    beforeEach(() => {
      jasmine.addMatchers(ExcaliburMatchers);
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

    it('can draw a graphic', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rect({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 20, 20);
      sut.flush();

      ensureImagesLoaded(flushWebGLCanvasTo2D(canvas),
        'src/spec/images/ExcaliburGraphicsContextSpec/2d-drawgraphic.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can draw debug point', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawPoint(ex.vec(50, 50), {
        size: 20,
        color: ex.Color.Blue
      });
      sut.flush();

      ensureImagesLoaded(flushWebGLCanvasTo2D(canvas),
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-drawpoint.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can draw debug line', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      sut.clear();
      sut.debug.drawLine(ex.vec(0, 0), ex.vec(100, 100), {
        color: ex.Color.Blue
      });
      sut.flush();

      ensureImagesLoaded(flushWebGLCanvasTo2D(canvas),
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-drawline.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can transform the context', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        enableTransparency: false,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rect({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.save();
      sut.opacity = .5;
      sut.translate(50, 50);
      sut.rotate(Math.PI / 4);
      sut.scale(.5, .5);
      sut.drawImage(rect, -25, -25);
      sut.restore();
      sut.flush();

      ensureImagesLoaded(flushWebGLCanvasTo2D(canvas),
        'src/spec/images/ExcaliburGraphicsContextSpec/webgl-transform.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can snap drawings to pixel', (done) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const sut = new ex.Graphics.ExcaliburGraphicsContextWebGL({
        canvasElement: canvas,
        enableTransparency: false,
        snapToPixel: true,
        backgroundColor: ex.Color.White
      });

      const rect = new ex.Graphics.Rect({
        width: 50,
        height: 50,
        color: ex.Color.Blue
      });

      sut.clear();
      sut.drawImage(rect, 1.9, 1.9);
      sut.flush();

      ensureImagesLoaded(flushWebGLCanvasTo2D(canvas),
        'src/spec/images/ExcaliburGraphicsContextSpec/2d-snap-to-pixel.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});