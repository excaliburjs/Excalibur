import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A SpriteSheet for Graphics', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    canvasElement = document.createElement('canvas');
    canvasElement.width = 120;
    canvasElement.height = 120;
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement, smoothing: false });
  });

  it('exists', () => {
    expect(ex.SpriteSheet).toBeDefined();
  });

  it('can be created with a constructor', async () => {
    const image = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

    await image.load();
    const ss = new ex.SpriteSheet({
      sprites: [ex.Sprite.from(image)]
    });

    expect(ss.sprites.length).toBe(1);
    expect(ss.sprites[0].width).toBe(258);
    expect(ss.sprites[0].height).toBe(53);
  });

  it('can be created from a list of source views', async () => {
    const image = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    await image.load();

    const ss = ex.SpriteSheet.fromImageSourceWithSourceViews({
      image,
      sourceViews: [
        {x: 0, y: 0, width: 20, height: 30},
        {x: 20, y: 0, width: 40, height: 50}
      ]
    });

    expect(ss.sprites.length).toBe(2);
    expect(ss.sprites[0].width).toBe(20);
    expect(ss.sprites[0].height).toBe(30);
    expect(ss.sprites[1].width).toBe(40);
    expect(ss.sprites[1].height).toBe(50);
  });

  it('can be created from a grid', async () => {
    const image = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

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

  it('can be created from a grid with interesting spacing', async () => {
    const image = new ex.ImageSource('src/spec/images/SpriteSheetSpec/kenny-cards.png');

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

    await expectAsync(canvasElement).toEqualImage('src/spec/images/SpriteSheetSpec/NewSpriteSpacing.png');
  });

  it('can retrieve a sprite by x,y', async () => {
    const image = new ex.ImageSource('src/spec/images/SpriteSheetSpec/kenny-cards.png');

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
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');

    expect(ss.getSprite(0, 0)).withContext('top left sprite').toEqual(ss.sprites[0]);
    expect(ss.getSprite(13, 3)).withContext('bottom right sprite').not.toBeNull();

    expect(ss.getSprite(13, 4)).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith('No sprite exists in the SpriteSheet at (13, 4), y: 4 should be between 0 and 3');

    expect(ss.getSprite(14, 3)).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith('No sprite exists in the SpriteSheet at (14, 3), x: 14 should be between 0 and 13');

    expect(ss.getSprite(-1, 3)).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith('No sprite exists in the SpriteSheet at (-1, 3), x: -1 should be between 0 and 13');

    expect(ss.getSprite(1, -1)).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith('No sprite exists in the SpriteSheet at (1, -1), y: -1 should be between 0 and 3');
  });

  it('can be cloned', async () => {
    const image = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

    await image.load();
    const ss = new ex.SpriteSheet({
      sprites: [ex.Sprite.from(image)],
      rows: 5,
      columns: 5
    });

    const clone = ss.clone();

    expect(ss).not.toBe(clone);
    expect(ss.getSprite(0, 0)).not.toBe(clone.getSprite(0,0));
    expect(ss.sprites.length).toBe(clone.sprites.length);
    expect(ss.rows).toBe(clone.rows);
    expect(ss.columns).toBe(clone.columns);

  });
});
