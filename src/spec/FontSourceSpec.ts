import * as ex from '@excalibur';

describe('A FontSource', () => {
  it('exists', () => {
    expect(ex.FontSource).toBeDefined();
  });

  it('can be constructed', () => {
    const fontSource = new ex.FontSource('src/spec/fonts/Gorgeous Pixel.ttf', 'Gorgeous Pixel');
    expect(fontSource).toBeDefined();
  });

  it('can load fonts', async () => {
    const fontSource = new ex.FontSource('src/spec/fonts/Gorgeous Pixel.ttf', 'Gorgeous Pixel');
    
    await fontSource.load()

    expect(fontSource.data).not.toBeUndefined();
  });

  it('can convert to a Font', async () => {
    const fontSource = new ex.FontSource('src/spec/fonts/Gorgeous Pixel.ttf', 'Gorgeous Pixel');
    
    await fontSource.load()
    const font = fontSource.toFont()
    
    expect(font).toBeInstanceOf(ex.Font)
  });

  it('will use options from FontSource', async () => {
    const fontSource = new ex.FontSource('src/spec/fonts/Gorgeous Pixel.ttf', 'Gorgeous Pixel', { 
      size: 50
    });
    
    await fontSource.load()
    const font = fontSource.toFont()

    expect(font.size).toBe(50)
  });

  it('will override options when converting to a Font', async () => {
    const fontSource = new ex.FontSource('src/spec/fonts/Gorgeous Pixel.ttf', 'Gorgeous Pixel', { 
      size: 50,
      opacity: 0.5
    });
    
    await fontSource.load()
    const font = fontSource.toFont({
      size: 100
    })

    expect(font.size).toBe(100)
    expect(font.opacity).toBe(0.5)
  });

  it('will resolve the font if already loaded', async () => {
    const fontSource = new ex.FontSource('src/spec/fonts/Gorgeous Pixel.ttf', 'Gorgeous Pixel');
    
    const font = await fontSource.load()

    expect(fontSource.isLoaded()).toBe(true);
    const alreadyLoadedFont = await fontSource.load();

    expect(font).toBe(alreadyLoadedFont);
  });

  it('will return error if font doesn\'t exist', async () => {
    const fontSource = new ex.FontSource('42.ttf', '42');

    await expectAsync(fontSource.load()).toBeRejectedWith(
      'Error loading FontSource from path \'42.ttf\' with error [Not Found]'
    );
  });
});
