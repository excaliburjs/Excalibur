import * as ex from '@excalibur';

describe('A SpriteSheet for Graphics', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeEach(() => {
    canvasElement = document.createElement('canvas');
    canvasElement.width = 120;
    canvasElement.height = 120;
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement, antialiasing: false });
  });

  it('exists', () => {
    expect(ex.SpriteSheet).toBeDefined();
  });

  it('can be created with a constructor', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png');

    await image.load();
    const ss = new ex.SpriteSheet({
      sprites: [ex.Sprite.from(image)]
    });

    expect(ss.sprites.length).toBe(1);
    expect(ss.sprites[0].width).toBe(258);
    expect(ss.sprites[0].height).toBe(53);
  });

  it('can be created from a list of source views', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png');
    await image.load();

    const ss = ex.SpriteSheet.fromImageSourceWithSourceViews({
      image,
      sourceViews: [
        { x: 0, y: 0, width: 20, height: 30 },
        { x: 20, y: 0, width: 40, height: 50 }
      ]
    });

    expect(ss.sprites.length).toBe(2);
    expect(ss.sprites[0].width).toBe(20);
    expect(ss.sprites[0].height).toBe(30);
    expect(ss.sprites[1].width).toBe(40);
    expect(ss.sprites[1].height).toBe(50);
  });

  it('can be created from a grid', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png');

    await image.load();
    const ss = ex.SpriteSheet.fromImageSource({
      image,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    expect(ss.sprites.length).toBe(3 * 16);
    expect(ss.sprites[0].width).toBe(16);
    expect(ss.sprites[0].height).toBe(16);
  });

  describe('@visual', () => {
    it('can be created from a grid with interesting spacing', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/sprite-sheet-spec/kenny-cards.png');

      await image.load();

      const ss = ex.SpriteSheet.fromImageSource({
        image,
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

      ctx.clear();

      ss.sprites[12].draw(ctx, 0, 0);
      ss.sprites[24].draw(ctx, 60, 0);
      ss.sprites[36].draw(ctx, 0, 60);
      ss.sprites[48].draw(ctx, 60, 60);

      expect(ss.sprites.length).toBe(4 * 14);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/sprite-sheet-spec/NewSpriteSpacing.png');
    });

    it('can be created from with spacing using vectors', async () => {
      const image = new ex.ImageSource('/src/spec/assets/images/sprite-sheet-spec/kenny-cards.png');

      await image.load();

      const ss = ex.SpriteSheet.fromImageSource({
        image,
        grid: {
          rows: 4,
          columns: 14,
          spriteWidth: 42,
          spriteHeight: 60
        },
        spacing: {
          originOffset: ex.vec(11, 2),
          margin: ex.vec(23, 5)
        }
      });

      ctx.clear();

      ss.sprites[12].draw(ctx, 0, 0);
      ss.sprites[24].draw(ctx, 60, 0);
      ss.sprites[36].draw(ctx, 0, 60);
      ss.sprites[48].draw(ctx, 60, 60);

      expect(ss.sprites.length).toBe(4 * 14);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/sprite-sheet-spec/NewSpriteSpacing.png');
    });
  });

  it('can retrieve a sprite by x,y', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/sprite-sheet-spec/kenny-cards.png');

    await image.load();

    const ss = ex.SpriteSheet.fromImageSource({
      image,
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

    expect(ss.getSprite(0, 0), 'top left sprite').toEqual(ss.sprites[0]);
    expect(ss.getSprite(13, 3), 'bottom right sprite').not.toBeNull();

    expect(() => ss.getSprite(13, 4)).toThrowError('No sprite exists in the SpriteSheet at (13, 4), y: 4 should be between 0 and 3 rows');

    expect(() => ss.getSprite(14, 3)).toThrowError(
      'No sprite exists in the SpriteSheet at (14, 3), x: 14 should be between 0 and 13 columns'
    );

    expect(() => ss.getSprite(-1, 3)).toThrowError(
      'No sprite exists in the SpriteSheet at (-1, 3), x: -1 should be between 0 and 13 columns'
    );

    expect(() => ss.getSprite(1, -1)).toThrowError('No sprite exists in the SpriteSheet at (1, -1), y: -1 should be between 0 and 3 rows');
  });

  it('can retrieve a sprite by x,y, with options', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/sprite-sheet-spec/kenny-cards.png');

    await image.load();

    const ss = ex.SpriteSheet.fromImageSource({
      image,
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

    const sprite = ss.getSprite(0, 0, {
      flipHorizontal: true,
      flipVertical: true,
      width: 200,
      height: 201,
      opacity: 0.5,
      scale: ex.vec(2, 2),
      origin: ex.vec(0, 1),
      tint: ex.Color.Red,
      rotation: 4
    });

    const spriteNoOptions = ss.getSprite(0, 0);

    expect(sprite).not.toBe(spriteNoOptions);

    expect(sprite.flipHorizontal).toBe(true);
    expect(sprite.flipVertical).toBe(true);
    expect(sprite.width).toBe(400);
    expect(sprite.height).toBe(402);
    expect(sprite.opacity).toBe(0.5);
    expect(sprite.scale).toBeVector(ex.vec(2, 2));
    expect(sprite.origin).toBeVector(ex.vec(0, 1));
    expect(sprite.origin).toBeVector(ex.vec(0, 1));
    expect(sprite.tint).toEqual(ex.Color.Red);
    expect(sprite.rotation).toBe(4);
  });

  it('can be cloned', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png');

    await image.load();
    const ss = new ex.SpriteSheet({
      sprites: [ex.Sprite.from(image)],
      rows: 5,
      columns: 5
    });

    const clone = ss.clone();

    expect(ss).not.toBe(clone);
    expect(ss.getSprite(0, 0)).not.toBe(clone.getSprite(0, 0));
    expect(ss.sprites.length).toBe(clone.sprites.length);
    expect(ss.rows).toBe(clone.rows);
    expect(ss.columns).toBe(clone.columns);
  });

  it('can produce a unique image element by x,y', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/sprite-sheet-spec/kenny-cards.png');

    await image.load();
    const ss = ex.SpriteSheet.fromImageSource({
      image,
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

    const newImage = await ss.getSpriteAsImage(0, 0);
    expect(newImage.width).toBe(42);
    expect(newImage.height).toBe(60);
    expect(newImage).toBeInstanceOf(Image);
  });

  it('can produce a unique Sprite Object by x,y', async () => {
    const image = new ex.ImageSource('/src/spec/assets/images/sprite-sheet-spec/kenny-cards.png');

    await image.load();
    const ss = ex.SpriteSheet.fromImageSource({
      image,
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

    const newSprite = await ss.getSpriteAsStandalone(0, 0);
    expect(newSprite.width).toBe(42);
    expect(newSprite.height).toBe(60);
    expect(newSprite).toBeInstanceOf(ex.Sprite);
  });
});
