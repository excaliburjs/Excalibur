import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A SpriteSheet for Graphics', () => {
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
