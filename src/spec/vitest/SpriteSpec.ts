import * as ex from '@excalibur';
import { Logger, TextureLoader } from '@excalibur';

describe('A Sprite Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;

  beforeEach(() => {
    TextureLoader.filtering = ex.ImageFiltering.Pixel;
    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement,
      uvPadding: 0.01,
      antialiasing: false,
      snapToPixel: false,
      pixelArtSampler: false
    });
  });

  it('exists', () => {
    expect(ex.Sprite).toBeDefined();
  });

  it('can be constructed', () => {
    const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Sprite({
      image
    });
    expect(sut).toBeDefined();
  });

  it('can be cloned', () => {
    const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Sprite({
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

  it('correctly calculates size based on scale', () => {
    const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Sprite({
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
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(100, 100, ex.Vector.Zero));
    sut.scale = ex.vec(2, 2);
    expect(sut.width).toBe(200);
    expect(sut.height).toBe(200);
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(200, 200, ex.Vector.Zero));
  });

  it('correctly sets size based on scale', () => {
    const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
    const sut = new ex.Sprite({
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
    expect(sut.localBounds).toEqual(ex.BoundingBox.fromDimension(100, 100, ex.Vector.Zero));
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
    expect(sut.destSize.width).toBe(60);
    expect(sut.destSize.height).toBe(55);
  });

  describe('@visual', () => {
    it('can specify a source/dest view of an image with default width and height', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
      const sut = new ex.Sprite({
        image,
        width: 16,
        height: 16
      });

      expect(sut.width, 'Graphic width should be 16').toBe(16);
      expect(sut.height, 'Graphic height should be 16').toBe(16);
      expect(sut.sourceView.x).toBe(0);
      expect(sut.sourceView.y).toBe(0);
      expect(sut.sourceView.width, 'Graphic sourceView width should be 16').toBe(16);
      expect(sut.sourceView.height, 'Graphic sourceView height should be 16').toBe(16);
      expect(sut.destSize.width, 'Graphic destSize width should be 16').toBe(16);
      expect(sut.destSize.height, 'Graphic destSize height should be 16').toBe(16);
      expect(sut.localBounds.width, 'Graphic local bounds width should be 16').toBe(16);
      expect(sut.localBounds.height, 'Graphic local bounds height should be 16').toBe(16);

      await image.load();
      await image.ready;

      ctx.clear();
      sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/source-view.png');
    });

    it('can draw an sprite image with a tint', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsSpriteSpec/icon.png');
      const sut = image.toSprite();
      sut.tint = ex.Color.Green;

      await image.load();
      await image.ready;

      ctx.clear();
      sut.draw(ctx, 0, 0);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/icon-tint.png');
    });

    it('can specify the width and height of a sprite after construction', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png', false, ex.ImageFiltering.Pixel);
      const sut = new ex.Sprite({
        image,
        sourceView: {
          x: 0,
          y: 0,
          width: 16,
          height: 16
        }
      });

      sut.width = 64;
      sut.height = 64;

      await image.load();
      await image.ready;

      ctx.clear();
      sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/change-size.png');
    });

    it('can specify the width and height and scale', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png', false, ex.ImageFiltering.Pixel);
      const sut = new ex.Sprite({
        image,
        sourceView: {
          x: 0,
          y: 0,
          width: 16,
          height: 16
        }
      });

      sut.width = 64;
      sut.height = 64;

      sut.scale = ex.vec(2, 2);

      await image.load();
      await image.ready;

      ctx.clear();
      sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);
      ctx.flush();
      expect(sut.width).toBe(128);
      expect(sut.height).toBe(128);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/change-size-and-scale.png');
    });

    it('can specify a source view of an image by default is same dimension as the source', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
      const sut = new ex.Sprite({
        image,
        sourceView: {
          x: 0,
          y: 0,
          width: 16,
          height: 16
        }
      });

      expect(sut.width, 'Graphic width should be 16').toBe(16);
      expect(sut.height, 'Graphic height should be 16').toBe(16);
      expect(sut.sourceView.x).toBe(0);
      expect(sut.sourceView.y).toBe(0);
      expect(sut.sourceView.width, 'Graphic sourceView width should be 16').toBe(16);
      expect(sut.sourceView.height, 'Graphic sourceView height should be 16').toBe(16);
      expect(sut.destSize.width, 'Graphic destSize width should be 16').toBe(16);
      expect(sut.destSize.height, 'Graphic destSize height should be 16').toBe(16);
      expect(sut.localBounds.width, 'Graphic local bounds width should be 16').toBe(16);
      expect(sut.localBounds.height, 'Graphic local bounds height should be 16').toBe(16);

      await image.load();
      await image.ready;

      ctx.clear();
      sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/source-view.png');
    });

    it('can specify a source view of an image and a dest view dimension is destination', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png', false, ex.ImageFiltering.Pixel);
      const sut = new ex.Sprite({
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

      expect(sut.width, 'Graphic width should be 50').toBe(50);
      expect(sut.height, 'Graphic height should be 50').toBe(50);
      expect(sut.sourceView.x).toBe(0);
      expect(sut.sourceView.y).toBe(0);
      expect(sut.sourceView.width, 'Graphic sourceView width should be 50').toBe(16);
      expect(sut.sourceView.height, 'Graphic sourceView height should be 50').toBe(16);
      expect(sut.destSize.width, 'Graphic destSize width should be 50').toBe(50);
      expect(sut.destSize.height, 'Graphic destSize height should be 50').toBe(50);
      expect(sut.localBounds.width, 'Graphic local bounds width should be 50').toBe(50);
      expect(sut.localBounds.height, 'Graphic local bounds height should be 50').toBe(50);

      await image.load();
      await image.ready;

      ctx.clear();
      sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/dest-size.png');
    });

    it('can specify only a dest view dimension, infers native size for source view', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
      const sut = new ex.Sprite({
        image,
        destSize: {
          width: 100,
          height: 100
        }
      });

      expect(sut.width, 'Graphic width should be 100').toBe(100);
      expect(sut.height, 'Graphic height should be 100').toBe(100);
      expect(sut.sourceView.x).toBe(0);
      expect(sut.sourceView.y).toBe(0);
      expect(sut.sourceView.width, 'Graphic sourceView width should be 0 before image load').toBe(0);
      expect(sut.sourceView.height, 'Graphic sourceView height should be 0 before image load').toBe(0);
      expect(sut.destSize.width, 'Graphic destSize width should be 100').toBe(100);
      expect(sut.destSize.height, 'Graphic destSize height should be 100').toBe(100);
      expect(sut.localBounds.width, 'Graphic local bounds width should be 100').toBe(100);
      expect(sut.localBounds.height, 'Graphic local bounds height should be 100').toBe(100);

      await image.load();
      await image.ready;

      expect(sut.sourceView.width).not.toBe(0);
      expect(sut.sourceView.height).not.toBe(0);

      ctx.clear();
      sut.draw(ctx, 50 - sut.width / 2, 50 - sut.width / 2);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsSpriteSpec/dest-view.png');
    });
  });

  it('will log one warning if the imagesource is not loaded', () => {
    const logger = Logger.getInstance();
    vi.spyOn(logger, 'warnOnce');
    const image = new ex.ImageSource('path/to/non/existing/image');

    const sut = image.toSprite();

    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);

    expect(logger.warnOnce).toHaveBeenCalledWith(
      `ImageSource path/to/non/existing/image is not yet loaded and won't be drawn. Please call .load() or include in a Loader.\n\n` +
        'Read https://excaliburjs.com/docs/imagesource for more information.'
    );
  });
});
