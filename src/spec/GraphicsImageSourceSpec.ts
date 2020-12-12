import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

xdescribe('A ImageSource', () => {

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

  it('can load from an unloaded legacy texture', async () => {
    const tex = new ex.Texture('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const img = ex.Graphics.ImageSource.fromLegacyTexture(tex);
    await tex.load();
    expect(img.width).not.toBe(0);
    expect(img.height).not.toBe(0);
  });

  it('will resolve the image if alreadly loaded', async () => {
    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');
    const image = await spriteFontImage.load();

    expect(spriteFontImage.isLoaded()).toBe(true);
    const alreadyLoadedImage = await spriteFontImage.load();

    expect(image).toBe(alreadyLoadedImage);
  });

  it('will load base64 strings', async () => {
    const base64Image = new ex.Graphics.ImageSource(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==');
    await base64Image.load();

    expect(base64Image.isLoaded()).toBe(true);
    expect(base64Image.image.src).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==');
  });
});