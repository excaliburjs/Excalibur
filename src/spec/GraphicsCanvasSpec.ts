import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Canvas Graphic', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.Graphics.Canvas).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Graphics.Canvas({
      width: 100,
      height: 100
    });
    expect(sut).toBeDefined();
  });

  it('can be cloned', () => {
    const sut = new ex.Graphics.Canvas({
      width: 100,
      height: 100,
      draw: (ctx) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(25, 25, 50, 50);
      }
    });
    const clone = sut.clone();

    expect(sut.draw).toBe(clone.draw);
    expect(sut.width).toBe(clone.width);
    expect(sut.height).toBe(clone.height);
  });

  it('can be drawn using the 2d canvas api', async () => {
    const sut = new ex.Graphics.Canvas({
      width: 100,
      height: 100,
      draw: (ctx) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(25, 25, 50, 50);
      }
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    sut.draw(ctx, 0, 0);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsCanvasSpec/draw.png');
    expect(actual).toEqualImage(image);
  });

  it('can cache draws', () => {
    const sut = new ex.Graphics.Canvas({
      width: 100,
      height: 100,
      cache: true,
      draw: (ctx) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(25, 25, 50, 50);
      }
    });

    spyOn(sut, 'execute').and.callThrough();

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);

    expect(sut.execute).toHaveBeenCalledTimes(1);
  });

  it('can redraw on each draws', () => {
    const sut = new ex.Graphics.Canvas({
      width: 100,
      height: 100,
      cache: false,
      draw: (ctx) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(25, 25, 50, 50);
      }
    });

    spyOn(sut, 'execute').and.callThrough();

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);

    expect(sut.execute).toHaveBeenCalledTimes(4);
  });
});