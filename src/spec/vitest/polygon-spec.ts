import * as ex from '@excalibur';

describe('A Polygon Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeEach(() => {
    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
  });

  it('exists', () => {
    expect(ex.Polygon).toBeDefined();
  });

  it('can be constructed', () => {
    const poly = new ex.Polygon({
      points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
      color: ex.Color.Green
    });
    expect(poly).toBeDefined();
  });

  it('has default filtering', () => {
    const sut = new ex.Polygon({
      points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
      color: ex.Color.Green
    });
    expect(sut.filtering).toBe(ex.ImageFiltering.Blended);
  });

  it('can be cloned', () => {
    const poly = new ex.Polygon({
      points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
      color: ex.Color.Green,
      strokeColor: ex.Color.Violet
    });

    const clone = poly.clone();

    expect(clone.points).toEqual(poly.points);
    expect(clone.color).toEqual(poly.color);
    expect(clone.strokeColor).toEqual(poly.strokeColor);
  });

  describe('@visual', () => {
    it('can be drawn', async () => {
      const poly = new ex.Polygon({
        points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
        color: ex.Color.Green,
        strokeColor: ex.Color.Violet
      });

      poly.draw(ctx, 0, 0);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsPolygonSpec/poly.png', 0.993);
    });
  });
});
