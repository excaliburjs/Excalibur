import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A SpriteSheet for Graphics', () => {

  let canvasElement: HTMLCanvasElement;
  let ctx: ex.Graphics.ExcaliburGraphicsContext;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    canvasElement = document.createElement('canvas');
    canvasElement.width = 120;
    canvasElement.height = 120;
    ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement, smoothing: false });
  });

  it('exists', () => {
    expect(ex.Graphics.SpriteSheet).toBeDefined();
  });

  it('can be created with a constructor', async () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');

    await image.load();
    const ss = new ex.Graphics.SpriteSheet({
      image,
      sprites: [ex.Graphics.Sprite.from(image)]
    });

    expect(ss.sprites.length).toBe(1);
    expect(ss.sprites[0].width).toBe(258);
    expect(ss.sprites[0].height).toBe(53);
  });

  it('can be created from a grid', async () => {
    const image = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');

    await image.load();
    const ss = ex.Graphics.SpriteSheet.fromGrid({
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
    const image = new ex.Graphics.ImageSource('base/src/spec/images/SpriteSheetSpec/kenny-cards.png');

    await image.load();

    const ss = ex.Graphics.SpriteSheet.fromGrid({
      image,
      grid: {
        rows: 4,
        columns: 14,
        spriteWidth: 42,
        spriteHeight: 60
      },
      spacing: {
        originOffset: { x: 11, y: 2 },
        margin: { x: 23, y: 5}
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

  it('can be created from a legacy sprite sheet', async () => {
    const texture = new ex.Texture('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    await texture.load();

    const legacy = new ex.SpriteSheet({
      image: texture,
      rows: 3,
      columns: 16,
      spWidth: 16,
      spHeight: 16
    });

    const ss = ex.Graphics.SpriteSheet.fromLegacySpriteSheet(legacy);

    expect(ss.sprites.length).toBe(3 * 16);
    expect(ss.sprites[0].width).toBe(16);
    expect(ss.sprites[0].height).toBe(16);
  });
});
