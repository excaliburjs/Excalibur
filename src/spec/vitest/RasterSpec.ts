import * as ex from '@excalibur';
import { Color } from '@excalibur';

import type { RasterOptions } from '../../engine/Graphics';

class TestRaster extends ex.Raster {
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

  clone(): ex.Graphic {
    return null;
  }
}

describe('A Raster', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeEach(() => {
    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
  });

  it('exists', () => {
    expect(ex.Raster).toBeDefined();
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

  it('correctly calculates size based on scale', () => {
    const sut = new TestRaster();
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(50, 50, ex.Vector.Zero));
    sut.scale = ex.vec(2, 2);
    expect(sut.width).toBe(100);
    expect(sut.height).toBe(100);
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(100, 100, ex.Vector.Zero));
  });

  it('correctly sets size based on scale', () => {
    const sut = new TestRaster();
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(50, 50, ex.Vector.Zero));
    sut.scale = ex.vec(2, 2);
    sut.width = 120;
    sut.height = 110;
    expect(sut.width).toBe(120);
    expect(sut.height).toBe(110);
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(120, 110, ex.Vector.Zero));
    sut.scale = ex.vec(1, 1);
    expect(sut.width).toBe(60);
    expect(sut.height).toBe(55);
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(60, 55, ex.Vector.Zero));
  });

  it('flags dirty when color is changed', () => {
    const sut = new TestRaster();
    sut.draw(ctx, 0, 0);

    expect(sut.dirty).toBe(false);
    sut.color = new ex.Color(125, 0, 0);
    sut.color.b = 125;

    expect(sut.color.r).toBe(125);
    expect(sut.color.b).toBe(125);
    expect(sut.dirty).toBe(true);

    sut.draw(ctx, 0, 0);

    expect(sut.dirty).toBe(false);

    sut.strokeColor = new ex.Color(1, 1, 1);
    sut.strokeColor.r = 12;

    expect(sut.dirty).toBe(true);
  });

  it('can clone RasterOptions', () => {
    const originalRasterOptions: ex.RasterOptions = {
      color: new Color(1, 2, 3, 0.5),
      strokeColor: new Color(5, 6, 7, 0.8),
      smoothing: false,
      lineWidth: 2,
      lineDash: [2, 2],
      lineCap: 'butt',
      quality: 1,
      padding: 2
    };
    const sut = new TestRaster(originalRasterOptions);
    expect(sut.cloneRasterOptions()).toEqual(originalRasterOptions);
  });

  describe('@visual', () => {
    it('can be drawn', async () => {
      const sut = new TestRaster();
      vi.spyOn(sut, 'rasterize');
      vi.spyOn(sut, 'execute');
      sut.draw(ctx, 0, 0);
      expect(sut.execute).toHaveBeenCalledTimes(1);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsRasterSpec/raster.png');
    });

    it('can have the quality increased', async () => {
      const sut = new TestRaster({
        quality: 4
      });
      sut.quality = 4;
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsRasterSpec/raster-quality.png');
    });
  });

  it('knows when it must be re-rastered', () => {
    const sut = new TestRaster();
    expect(sut.dirty).toBe(true);
    sut.draw(ctx, 0, 0);
    expect(sut.dirty).toBe(false);
    sut.smoothing = false;
    expect(sut.dirty).toBe(true);
  });

  it('can have padding and maintain correct size and not grow after each draw', () => {
    const sut = new TestRaster();
    expect(sut.localBounds.width).toBe(50);
    expect(sut.localBounds.height).toBe(50);
    sut.padding = 4;
    expect(sut.localBounds.width).toBe(58);
    expect(sut.width).toBe(58);
    expect(sut.localBounds.height).toBe(58);
    expect(sut.height).toBe(58);

    sut.flagDirty();
    sut.draw(ctx, 0, 0);
    expect(sut._bitmap.width).toBe(58);
    expect(sut._bitmap.height).toBe(58);

    sut.flagDirty();
    sut.draw(ctx, 0, 0);
    expect(sut._bitmap.width).toBe(58);
    expect(sut._bitmap.height).toBe(58);

    sut.flagDirty();
    sut.draw(ctx, 0, 0);
    expect(sut._bitmap.width).toBe(58);
    expect(sut._bitmap.height).toBe(58);
  });
});
