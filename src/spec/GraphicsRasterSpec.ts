import * as ex from '@excalibur';
import { Color } from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';
import { RasterOptions } from '../engine/Graphics';


class TestRaster extends ex.Graphics.Raster {
  constructor(options?: RasterOptions) {
    super(options);
    this.width = 50;
    this.height = 50;
  }
  execute(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 50, 50);
    ctx.strokeStyle = 'red';
    ctx.strokeRect(0, 0, 50, 50);
  }

  clone(): ex.Graphics.Graphic {
    return null;
  }

}

xdescribe('A Raster', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.Graphics.ExcaliburGraphicsContext;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);

    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});
  });

  it('exists', () => {
    expect(ex.Graphics.Raster).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new TestRaster();
    expect(sut).toBeDefined();
  });

  it('creates a backing bitmap', () => {
    const sut = new TestRaster();
    expect(sut._bitmap.width).toBe(50);
    expect(sut._bitmap.height).toBe(50);
    expect(sut.width).toBe(50);
    expect(sut.height).toBe(50);
  });

  it('flags dirty when color is changed', () => {
    const sut = new TestRaster();
    sut.draw(ctx, 0, 0);

    expect(sut.dirty).toBeFalse();
    sut.color = new ex.Color(125, 0, 0);
    sut.color.b = 125;

    expect(sut.color.r).toBe(125);
    expect(sut.color.b).toBe(125);
    expect(sut.dirty).toBeTrue();

    sut.draw(ctx, 0, 0);

    expect(sut.dirty).toBeFalse();

    sut.strokeColor = new ex.Color(1, 1, 1);
    sut.strokeColor.r = 12;

    expect(sut.dirty).toBeTrue();
  });;

  it('can clone RasterOptions', () => {
    const originalRasterOptions = {
      color: new Color(1, 2, 3, 0.5),
      strokeColor: new Color(5, 6, 7, 0.8),
      smoothing: false,
      lineWidth: 2,
      lineDash: [2, 2],
      padding: 2
    };
    const sut = new TestRaster(originalRasterOptions);
    expect(sut.cloneRasterOptions()).toEqual(originalRasterOptions);
  });

  it('can be drawn', async () => {
    const sut = new TestRaster();
    spyOn(sut, 'rasterize').and.callThrough();
    spyOn(sut, 'execute').and.callThrough();
    sut.draw(ctx, 0, 0);
    expect(sut.execute).toHaveBeenCalledTimes(1);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsRasterSpec/raster.png');
    expect(actual).toEqualImage(image);
  });

  it('knows when it must be re-rastered', () => {
    const sut = new TestRaster();
    expect(sut.dirty).toBe(true);
    sut.draw(ctx, 0, 0);
    expect(sut.dirty).toBe(false);
    sut.smoothing = false;
    expect(sut.dirty).toBe(true);
  });

});