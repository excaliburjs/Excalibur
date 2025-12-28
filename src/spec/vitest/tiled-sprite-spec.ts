import * as ex from '@excalibur';

describe('A TiledSprite', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;

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
  describe('@visual', () => {
    it('can be created after load', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/TiledSpriteSpec/ground.png');

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

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/TiledSpriteSpec/tiled.png');
    });

    it('can be created before load', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/TiledSpriteSpec/ground.png');

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

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/TiledSpriteSpec/tiled.png');
    });

    it('can be from a sprite', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/TiledSpriteSpec/ground.png');
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

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/TiledSpriteSpec/tiled.png');
    });

    it('can grab a tiled sprite from a sprite sheet', async () => {
      const cardsImage = new ex.ImageSource('/src/spec/assets/images/TiledAnimationSpec/kenny-cards.png');
      await cardsImage.load();
      const cardSpriteSheet = ex.SpriteSheet.fromImageSource({
        image: cardsImage,
        grid: {
          rows: 4,
          columns: 14,
          spriteWidth: 42,
          spriteHeight: 60
        },
        spacing: {
          originOffset: { x: 11, y: 2 },
          margin: { x: 23, y: 5 }
        }
      });

      const sut = cardSpriteSheet.getTiledSprite(0, 0, {
        width: 300,
        height: 300,
        scale: ex.vec(2, 2)
      });
      await sut.ready;

      ctx.clear();
      sut.draw(ctx, 0, 0);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/TiledSpriteSpec/from-spritesheet.png');
    });
  });
});
