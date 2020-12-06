import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A ImageSource', () => {

  it('exists', () => {
    expect(ex.Graphics.ImageSource).toBeDefined();
  });

  it('can be constructed', () => {
    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    expect(spriteFontImage).toBeDefined();
  });

  it('gets a new id', () => {
    const img1 = new ex.Graphics.ImageSource('');
    const img2 = new ex.Graphics.ImageSource('');
    expect(img1.id).not.toBe(img2.id);
  });

  it('can load images', async () => {
    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.whenLoaded.then(whenLoaded);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
  });

  it('can convert to a Sprite', async () => {
    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const sprite = spriteFontImage.toSprite();

    // Sprites have no width/height until the underlying image is loaded
    expect(sprite.width).toBe(0);
    expect(sprite.height).toBe(0);

    const image = await spriteFontImage.load();
    await spriteFontImage.whenLoaded;
    expect(sprite.width).toBe(image.width);
    expect(sprite.height).toBe(image.height);
  });

  it('can unload from memory', async () => {
    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    await spriteFontImage.load();
    expect(spriteFontImage.image.src).not.toBeNull();
    spriteFontImage.unload();
    expect(spriteFontImage.image.src).toBe('');
  });

  it('can load from a legacy texture', async () => {
    const tex = new ex.Texture('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    await tex.load();
    const img = ex.Graphics.ImageSource.fromLegacyTexture(tex);
    expect(img.width).not.toBe(0);
    expect(img.height).not.toBe(0);
  });
});