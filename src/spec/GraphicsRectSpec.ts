import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Rect Graphic', () => {
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
    expect(ex.Graphics.Rect).toBeDefined();
  });

  it('can be constructed', () => {
    const rect = new ex.Graphics.Rect({
      width: 50,
      height: 50
    });
    expect(rect).toBeDefined();
  });

  it('can be drawn', async () => {
    const rect = new ex.Graphics.Rect({
      width: 50,
      height: 50,
      color: ex.Color.Green
    });

    rect.draw(ctx, 25, 25);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsRectSpec/rect.png');
    expect(actual).toEqualImage(image);

  });
});