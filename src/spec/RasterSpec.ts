import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';

class TestRaster extends ex.Graphics.Raster {
  constructor() {
    super();
    this.width = 20;
    this.height = 20;
    this.color = ex.Color.Red;
  }
  execute(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(10, 10, 10, 0, Math.PI * 2);

    if (this.color) {
      ctx.fill();
    }
  }
}

describe('A Raster', () => {
  let exctx: ex.Graphics.ExcaliburGraphicsContext;
  let canvas: HTMLCanvasElement;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    exctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas(ctx);
  });

  it('should exist', () => {
    expect(ex.Graphics.Raster).toBeDefined();
  });

  it('can by constructed', () => {
    const raster = new TestRaster();
    expect(raster).toBeTruthy();
  });

  it('can be drawn', (done) => {
    const raster = new TestRaster();
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);
    expect(raster.dirty).toBeFalse();
    ensureImagesLoaded(canvas, 'src/spec/images/RasterSpec/raster.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('can be flagged dirty', () => {
    const raster = new TestRaster();
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);
    expect(raster.dirty).toBeFalse();
    raster.flagDirty();
    expect(raster.dirty).toBeTrue();
  });

  it('has execute called once before the first draw', () => {
    const raster = new TestRaster();
    spyOn(raster, 'execute');
    raster.draw(exctx, 0, 0);
    raster.draw(exctx, 0, 0);
    expect(raster.execute).toHaveBeenCalledTimes(1);
  });

  it('can have its color changed', (done) => {
    const raster = new TestRaster();
    raster.color = ex.Color.Azure;
    raster.draw(exctx, 0, 0);
    ensureImagesLoaded(canvas, 'src/spec/images/RasterSpec/color.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('can detect when properties change its dirty status', () => {
    const raster = new TestRaster();
    raster.draw(exctx, 0, 0);

    expect(raster.dirty).toBeFalse();
    raster.color.r = 1;
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);

    expect(raster.dirty).toBeFalse();
    raster.width = 1;
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);

    expect(raster.dirty).toBeFalse();
    raster.height = 1;
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);

    expect(raster.dirty).toBeFalse();
    raster.smoothing = false;
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);

    expect(raster.dirty).toBeFalse();
    raster.strokeColor = ex.Color.Azure;
    expect(raster.dirty).toBeTrue();
    raster.draw(exctx, 0, 0);
  });
});
