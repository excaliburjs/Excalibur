import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Sprite Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.Graphics.ExcaliburGraphicsContext;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement, smoothing: false });
  });

  it('exists', () => {
    expect(ex.Graphics.Sprite).toBeDefined();
  });

  it('can be constructed', () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Graphics.Sprite({
      image
    });
    expect(sut).toBeDefined();
  });

  it('can be cloned', () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Graphics.Sprite({
      image,
      sourceView: {
        x: 0,
        y: 0,
        width: 16,
        height: 16
      },
      destSize: {
        width: 100,
        height: 100
      }
    });

    const clone = sut.clone();

    expect(clone.sourceView).toEqual(sut.sourceView);
    expect(clone.destSize).toEqual(sut.destSize);
    expect(clone.image).toEqual(sut.image);
  });

  it('can specify a source/dest viewof an image with default width and height', async () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Graphics.Sprite({
      image,
      width: 16,
      height: 16
    });

    expect(sut.width).withContext('Graphic width should be 16').toBe(16);
    expect(sut.height).withContext('Graphic height should be 16').toBe(16);
    expect(sut.sourceView.x).toBe(0);
    expect(sut.sourceView.y).toBe(0);
    expect(sut.sourceView.width).withContext('Graphic sourceView width should be 16').toBe(16);
    expect(sut.sourceView.height).withContext('Graphic sourceView height should be 16').toBe(16);
    expect(sut.destSize.width).withContext('Graphic destSize width should be 16').toBe(16);
    expect(sut.destSize.height).withContext('Graphic destSize height should be 16').toBe(16);
    expect(sut.localBounds.width).withContext('Graphic local bounds width should be 16').toBe(16);
    expect(sut.localBounds.height).withContext('Graphic local bounds height should be 16').toBe(16);

    await image.load();
    await image.ready;

    ctx.clear();
    sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsSpriteSpec/source-view.png');
  });

  it('can specify a source view of an image by default is same dimension as the source', async () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Graphics.Sprite({
      image,
      sourceView: {
        x: 0,
        y: 0,
        width: 16,
        height: 16
      }
    });

    expect(sut.width).toBe(16, 'Graphic width should be 16');
    expect(sut.height).toBe(16, 'Graphic height should be 16');
    expect(sut.sourceView.x).toBe(0);
    expect(sut.sourceView.y).toBe(0);
    expect(sut.sourceView.width).toBe(16, 'Graphic sourceView width should be 16');
    expect(sut.sourceView.height).toBe(16, 'Graphic sourceView height should be 16');
    expect(sut.destSize.width).toBe(16, 'Graphic destSize width should be 16');
    expect(sut.destSize.height).toBe(16, 'Graphic destSize height should be 16');
    expect(sut.localBounds.width).toBe(16, 'Graphic local bounds width should be 16');
    expect(sut.localBounds.height).toBe(16, 'Graphic local bounds height should be 16');

    await image.load();
    await image.ready;

    ctx.clear();
    sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsSpriteSpec/source-view.png');
  });

  it('can specify a source view of an image and a dest view dimension is destination', async () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Graphics.Sprite({
      image,
      sourceView: {
        x: 0,
        y: 0,
        width: 16,
        height: 16
      },
      destSize: {
        width: 50,
        height: 50
      }
    });

    expect(sut.width).toBe(50, 'Graphic width should be 50');
    expect(sut.height).toBe(50, 'Graphic height should be 50');
    expect(sut.sourceView.x).toBe(0);
    expect(sut.sourceView.y).toBe(0);
    expect(sut.sourceView.width).toBe(16, 'Graphic sourceView width should be 50');
    expect(sut.sourceView.height).toBe(16, 'Graphic sourceView height should be 50');
    expect(sut.destSize.width).toBe(50, 'Graphic destSize width should be 50');
    expect(sut.destSize.height).toBe(50, 'Graphic destSize height should be 50');
    expect(sut.localBounds.width).toBe(50, 'Graphic local bounds width should be 50');
    expect(sut.localBounds.height).toBe(50, 'Graphic local bounds height should be 50');

    await image.load();
    await image.ready;

    ctx.clear();
    sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsSpriteSpec/dest-size.png');
  });

  it('can specify only a dest view dimension, infers native size for source view', async () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Graphics.Sprite({
      image,
      destSize: {
        width: 100,
        height: 100
      }
    });

    expect(sut.width).toBe(100, 'Graphic width should be 100');
    expect(sut.height).toBe(100, 'Graphic height should be 100');
    expect(sut.sourceView.x).toBe(0);
    expect(sut.sourceView.y).toBe(0);
    expect(sut.sourceView.width).toBe(0, 'Graphic sourceView width should be 0 before image load');
    expect(sut.sourceView.height).toBe(0, 'Graphic sourceView height should be 0 before image load');
    expect(sut.destSize.width).toBe(100, 'Graphic destSize width should be 100');
    expect(sut.destSize.height).toBe(100, 'Graphic destSize height should be 100');
    expect(sut.localBounds.width).toBe(100, 'Graphic local bounds width should be 100');
    expect(sut.localBounds.height).toBe(100, 'Graphic local bounds height should be 100');

    await image.load();
    await image.ready;

    expect(sut.sourceView.width).not.toBe(0);
    expect(sut.sourceView.height).not.toBe(0);

    ctx.clear();
    sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsSpriteSpec/dest-view.png');
  });
});
