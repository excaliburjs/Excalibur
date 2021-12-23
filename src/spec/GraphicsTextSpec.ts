import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { delay } from '../engine/Util/Util';

/**
 *
 */
async function runOnWindows(ctx: () => Promise<any>): Promise<boolean> {
  if (navigator.platform === 'Win32' || navigator.platform === 'Win64') {
    await ctx();
    return true;
  }
  return false;
}

/**
 *
 */
async function runOnLinux(ctx: () => Promise<any>): Promise<boolean> {
  if (navigator.platform.includes('Linux')) {
    await ctx();
    return true;
  }
  return false;
}
declare global {
  interface Document {
    fonts: FontFaceSet;
  }

  type CSSOMString = string;
  type FontFaceSetStatus = 'loading' | 'loaded';

  interface FontFaceDescriptors {
    family: CSSOMString;
  }

  interface FontFaceSet extends Iterable<FontFace> {
    readonly status: FontFaceSetStatus;
    readonly ready: Promise<FontFaceSet>;
    add(font: FontFace): void;
    check(font: string, text?: string): Boolean; // throws exception
    load(font: string, text?: string): Promise<FontFace[]>;
    delete(font: FontFace): void;
    clear(): void;
  }
}

/**
 *
 */
export async function waitForFontLoad(font: string, timeout = 2000, interval = 100) {
  return new Promise((resolve, reject) => {
    // repeatedly poll check
    const poller = setInterval(async () => {
      try {
        await document.fonts.load(font);
      } catch (err) {
        reject(err);
      }
      if (document.fonts.check(font)) {
        clearInterval(poller);
        resolve(true);
      }
    }, interval);
    setTimeout(() => clearInterval(poller), timeout);
  });
}

describe('A Text Graphic', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
  beforeAll(async () => {
    const fontface = document.createElement('link');
    fontface.href = 'src/spec/images/GraphicsTextSpec/fonts.css';
    fontface.rel = 'stylesheet';
    document.head.appendChild(fontface);
    await waitForFontLoad('18px Open Sans');
    await waitForFontLoad('bold 18px Open Sans');
    await waitForFontLoad('italic bold 18px Open Sans');
    await waitForFontLoad('italic 18px Open Sans');
  });

  it('exists', () => {
    expect(ex.Text).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Text({
      text: 'yo'
    });
    expect(sut).toBeDefined();
  });

  it('can be cloned', () => {
    const sut = new ex.Text({
      text: 'some text',
      color: ex.Color.Green,
      font: new ex.Font({ family: 'some-font-family' })
    });

    const clone = sut.clone();

    expect(clone.text).toBe('some text');
    expect(clone.color).toEqual(ex.Color.Green);
    expect((clone.font as ex.Font).family).toBe('some-font-family');
  });

  it('can write text', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/text.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/text-linux.png');
    });
  });


  it('can draw multiple lines of text (font)', async () => {
    const sut = new ex.Text({
      text: 'multiple\nlines\nof text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
    sut.draw(ctx, 10, 20);

    expect(sut.width).toBeCloseTo(69.8, -1);
    expect(sut.height).toBeCloseTo(18 * 3, 0);
    expect(sut.localBounds.width).toBeCloseTo(69.8, -1);
    expect(sut.localBounds.height).toBeCloseTo(18 * 3, 0);
    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/multi-text.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/multi-text-linux.png');
    });
  });

  it('can have width and height', () => {
    const sut = new ex.Text({
      text: 'some extra long text that we want to measure',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    expect(sut.width).toBeCloseTo(386.9, -1);
    expect(sut.height).toBeCloseTo(18, 0);
    expect(sut.localBounds.width).toBeCloseTo(386.9, -1);
    expect(sut.localBounds.height).toBeCloseTo(18, 0);
  });

  it('can measure text for a font', () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      padding: 0
    });

    const bounds = sut.measureText('some extra long text that we want to measure');
    expect(bounds.width).toBeCloseTo(386.9, -1);
    expect(bounds.height).toBeCloseTo(18, 0);
  });

  it('can flip text vertically and horizontally', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.flipHorizontal = true;
    sut.flipVertical = true;
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/flipped.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/flipped-linux.png');
    });
  });

  it('can align fonts and reuse a font', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 20);
    sut.draw(ctx, 10, 40);
    sut.draw(ctx, 10, 60);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/font-alignment.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/font-alignment-linux.png');
    });
  });

  it('can rotate text around the middle', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.rotation = Math.PI / 2;
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated-linux.png');
    });
  });


  it('can rotate text around the left', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.origin = ex.Vector.Zero;
    sut.rotation = Math.PI / 2;
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated-left.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated-left-linux.png');
    });
  });

  it('can rotate text around the right', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.origin = ex.vec(sut.width, 0);
    sut.rotation = -Math.PI / 2;
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated-right.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated-right-linux.png');
    });
  });

  it('can be bold', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        bold: true,
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/bold.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/bold-linux.png');
    });
  });

  it('can be italic', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        style: ex.FontStyle.Italic,
        size: 18,
        quality: 1,
        padding: 0
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/italic.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/italic-linux.png');
    });
  });

  it('can have a shadow', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0,
        shadow: {
          blur: 5,
          offset: ex.vec(4, 4),
          color: ex.Color.Blue
        }
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/shadow.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/shadow-linux.png');
    });
  });

  it('can force clear text bitmap cache', () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      shadow: {
        blur: 5,
        offset: ex.vec(4, 4),
        color: ex.Color.Blue
      }
    });

    const text = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: sut
    });

    const text2 = new ex.Text({
      text: 'red text',
      color: ex.Color.Green,
      font: sut
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    text.draw(ctx, 10, 50);
    text2.draw(ctx, 10, 50);

    expect(sut.cacheSize).toBe(2);
    sut.clearCache();
    expect(sut.cacheSize).toBe(0);

  });

  it('will collect text bitmap garbage', async () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      shadow: {
        blur: 5,
        offset: ex.vec(4, 4),
        color: ex.Color.Blue
      }
    });

    const text = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: sut
    });

    const text2 = new ex.Text({
      text: 'red text',
      color: ex.Color.Green,
      font: sut
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    text.draw(ctx, 10, 50);
    text2.draw(ctx, 10, 50);
    expect(sut.cacheSize).toBe(2);

    await delay(1001); // text is cached for 1 second

    sut.checkAndClearCache();
    expect(sut.cacheSize).toBe(0);
  });

  it('will collect text bitmap garbage', async () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      shadow: {
        blur: 5,
        offset: ex.vec(4, 4),
        color: ex.Color.Blue
      }
    });

    const text = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: sut
    });

    const text2 = new ex.Text({
      text: 'red text',
      color: ex.Color.Green,
      font: sut
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    text.draw(ctx, 10, 50);
    text2.draw(ctx, 10, 50);
    expect(sut.cacheSize).toBe(2);

    await delay(1001); // text is cached for 1 second

    sut.checkAndClearCache();
    expect(sut.cacheSize).toBe(0);
  });

  it('should cache based on text and raster props', () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      shadow: {
        blur: 5,
        offset: ex.vec(4, 4),
        color: ex.Color.Blue
      }
    });

    const text = new ex.Text({
      text: 'same text',
      color: ex.Color.Green,
      font: sut
    });

    const text2 = new ex.Text({
      text: 'same text',
      color: ex.Color.Red,
      font: sut
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    text.draw(ctx, 10, 50);
    text2.draw(ctx, 10, 50);
    expect(sut.cacheSize).toBe(2);
  });

  it('can get text dimension before drawing', () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      shadow: {
        blur: 5,
        offset: ex.vec(4, 4),
        color: ex.Color.Blue
      }
    });

    const text = new ex.Text({
      text: 'same text',
      color: ex.Color.Green,
      font: sut
    });

    expect(text.width).not.toBe(0);
    expect(text.height).not.toBe(0);
  });

  describe('with a SpriteFont', () => {
    it('can be cloned', () => {
      const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

      const spriteFontSheet = ex.SpriteSheet.fromImageSource({
        image: spriteFontImage,
        grid: {
          rows: 3,
          columns: 16,
          spriteWidth: 16,
          spriteHeight: 16
        }
      });

      const spriteFont = new ex.SpriteFont({
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        spacing: -5,
        spriteSheet: spriteFontSheet
      });

      const sut = new ex.Text({
        text: 'Some Sprite Text!?',
        font: spriteFont
      });

      const clone = sut.clone();

      expect(sut.font).not.toBe(clone.font);
    });

    it('can specify a spritefont', async () => {
      const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

      await spriteFontImage.load();

      const spriteFontSheet = ex.SpriteSheet.fromImageSource({
        image: spriteFontImage,
        grid: {
          rows: 3,
          columns: 16,
          spriteWidth: 16,
          spriteHeight: 16
        }
      });

      const spriteFont = new ex.SpriteFont({
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        spacing: -5,
        spriteSheet: spriteFontSheet
      });

      const sut = new ex.Text({
        text: 'Some Sprite Text!?',
        font: spriteFont
      });

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 200;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      ctx.clear();
      sut.draw(ctx, 0, 50);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/spritefont-text.png');
    });
  });

  it('will log warnings when there are issues', async () => {
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');

    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

    await spriteFontImage.load();

    const spriteFontSheet = ex.SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 1,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spacing: -5,
      spriteSheet: spriteFontSheet
    });

    const sut = new ex.Text({
      text: 'a',
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 200;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    sut.text = '~';
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    const warnSpy = logger.warn as jasmine.Spy;
    expect(warnSpy.calls.argsFor(0)).toEqual([
      'SpriteFont - Cannot find letter \'~\' in configured alphabet \'0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- \'.']);
    expect(warnSpy.calls.argsFor(1)).toEqual([
      'There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.']);
    expect(warnSpy.calls.argsFor(2)).toEqual([]); // warn only once
    sut.text = '?';
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    expect(warnSpy.calls.argsFor(2)).toEqual([
      'SpriteFont - Cannot find sprite for \'?\' at index \'42\' in configured SpriteSheet']);
    expect(warnSpy.calls.argsFor(3)).toEqual([
      'There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.']);
    expect(warnSpy.calls.argsFor(4)).toEqual([]); // warn only once
  });

  it('can do some simple shadowing', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');

    await spriteFontImage.load();

    const spriteFontSheet = ex.SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spacing: -5,
      spriteSheet: spriteFontSheet,
      shadow: {
        offset: ex.vec(3, 3)
      }
    });

    const sut = new ex.Text({
      text: 'Some Sprite Text!?',
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 200;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 0, 50);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/spritefont-shadow.png');
  });

  it('can rotate spritefont text around the middle', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    await spriteFontImage.load();
    const spriteFontSheet = ex.SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spriteSheet: spriteFontSheet,
      spacing: -6
    });
    const sut = new ex.Text({
      text: 'some text',
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.rotation = Math.PI / 2;
    sut.draw(ctx, 10, 40);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/rotated-spritefont.png');
  });

  it('can align fonts and reuse a spritefont', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    await spriteFontImage.load();
    const spriteFontSheet = ex.SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spriteSheet: spriteFontSheet,
      spacing: -6
    });
    const sut = new ex.Text({
      text: 'some text',
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 0, 20);
    sut.draw(ctx, 0, 40);
    sut.draw(ctx, 0, 60);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/spritefont-alignment.png');
  });

  it('can draw mutliple lines of text (spritefont)', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    await spriteFontImage.load();
    const spriteFontSheet = ex.SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spriteSheet: spriteFontSheet,
      spacing: -6
    });
    const sut = new ex.Text({
      text: 'multiple\nlines\nof text',
      color: ex.Color.Green,
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
    sut.draw(ctx, 10, 20);

    expect(sut.width).toBeCloseTo(80);
    expect(sut.height).toBeCloseTo(48);
    expect(sut.localBounds.width).toBeCloseTo(80);
    expect(sut.localBounds.height).toBeCloseTo(48);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/multi-text-spritefont.png');
  });

  it('can measure text for a spritefont', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    await spriteFontImage.load();
    const spriteFontSheet = ex.SpriteSheet.fromImageSource({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const sut = new ex.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spriteSheet: spriteFontSheet,
      spacing: -6
    });

    const bounds = sut.measureText('some extra long text that we want to measure');
    expect(bounds.width).toBeCloseTo(440, -1);
    expect(bounds.height).toBeCloseTo(16, 0);
  });
});
