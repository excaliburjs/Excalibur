import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A TiledSprite', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  beforeEach(() => {
    ex.TextureLoader.filtering = ex.ImageFiltering.Pixel;
    canvasElement = document.createElement('canvas');
    canvasElement.width = 400;
    canvasElement.height = 400;
    ctx = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement,
      uvPadding: 0.01,
      antialiasing: false,
      snapToPixel: false,
      pixelArtSampler: false
    });
  });

  it('exists', () => {
    expect(ex.TiledSprite).toBeDefined();
  });

  it('can be created after load', async () => {
    const image = new ex.ImageSource('src/spec/images/TiledSpriteSpec/ground.png');

    await image.load();
    const sut = new ex.TiledSprite({
      image,
      width: 400,
      height: 400,
      wrapping: {
        x: ex.ImageWrapping.Repeat,
        y: ex.ImageWrapping.Clamp
      }
    });
    await sut.ready;

    ctx.clear();
    sut.draw(ctx, 0, 20);
    ctx.flush();

    await expectAsync(canvasElement).toEqualImage('src/spec/images/TiledSpriteSpec/tiled.png');
  });

  it('can be created before load', async () => {
    const image = new ex.ImageSource('src/spec/images/TiledSpriteSpec/ground.png');

    const sut = new ex.TiledSprite({
      image,
      width: 400,
      height: 400,
      wrapping: {
        x: ex.ImageWrapping.Repeat,
        y: ex.ImageWrapping.Clamp
      }
    });
    await image.load();
    await sut.ready;

    ctx.clear();
    sut.draw(ctx, 0, 20);
    ctx.flush();

    await expectAsync(canvasElement).toEqualImage('src/spec/images/TiledSpriteSpec/tiled.png');
  });

  it('can be from a sprite', async () => {
    const image = new ex.ImageSource('src/spec/images/TiledSpriteSpec/ground.png');
    const sourceSprite = image.toSprite();
    sourceSprite.width = 400;
    sourceSprite.height = 400;
    const sut = ex.TiledSprite.fromSprite(sourceSprite, {
      wrapping: {
        x: ex.ImageWrapping.Repeat,
        y: ex.ImageWrapping.Clamp
      }
    });
    await image.load();
    await sut.ready;

    ctx.clear();
    sut.draw(ctx, 0, 20);
    ctx.flush();

    await expectAsync(canvasElement).toEqualImage('src/spec/images/TiledSpriteSpec/tiled.png');
  });
});
