import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Polygon Graphic', () => {
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
    expect(ex.Graphics.Polygon).toBeDefined();
  });

  it('can be constructed', () => {
    const poly = new ex.Graphics.Polygon({
      points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
      color: ex.Color.Green
    });
    expect(poly).toBeDefined();
  });

  it('can be drawn', async () => {
    const poly = new ex.Graphics.Polygon({
      points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
      color: ex.Color.Green
    });

    poly.draw(ctx, 0, 0);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsPolygonSpec/poly.png');
    expect(actual).toEqualImage(image);
  });

});