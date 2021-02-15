import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Rectangle Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.Graphics.ExcaliburGraphicsContext;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });
  });

  it('exists', () => {
    expect(ex.Graphics.Rectangle).toBeDefined();
  });

  it('can be constructed', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 50,
      height: 50
    });
    expect(rect).toBeDefined();
  });

  it('can be drawn', async () => {
    const rect = new ex.Graphics.Rectangle({
      width: 50,
      height: 50,
      color: ex.Color.Green
    });

    rect.draw(ctx, 25, 25);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsRectSpec/rect.png');
  });

  it('can be cloned', async () => {
    const rect = new ex.Graphics.Rectangle({
      width: 75,
      height: 50,
      lineWidth: 10,
      lineDash: [5, 5],
      color: ex.Color.Green,
      strokeColor: ex.Color.Violet
    });

    const rect2 = rect.clone();
    expect(rect2.width).toBe(75);
    expect(rect2.height).toBe(50);
    expect(rect2.lineDash).toEqual([5, 5]);
    expect(rect2.lineWidth).toBe(10);
    expect(rect2.color).toEqual(ex.Color.Green);
    expect(rect2.strokeColor).toEqual(ex.Color.Violet);

    rect2.draw(ctx, 15, 25);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsRectSpec/clone-rect.png');
  });
});
