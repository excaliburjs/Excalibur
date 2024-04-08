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
export function waitForFontLoad(font: string, timeout = 2000, interval = 100): Promise<boolean> {
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

  it('defaults to blended', () => {
    const sut = new ex.Text({
      text: 'yo'
    });
    const font = sut.font as ex.Font;
    expect(font.filtering).toBe(ex.ImageFiltering.Blended);
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

  it('correctly calculates size based on scale', () => {
    const sut = new ex.Text({ text: 'some text' });
    const currentBounds = sut.localBounds;
    sut.scale = ex.vec(2, 2);
    expect(sut.width).toBe(currentBounds.width * 2);
    expect(sut.height).toBe(currentBounds.height * 2);
    expect(sut.localBounds).toEqual(currentBounds.scale(ex.vec(2, 2)));
  });

  it('can write text', async () => {
    const sut = new ex.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
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

  it('can have line height', async () => {
    const sut = new ex.Text({
      text: 'green text\nthat has multiple\nlines to it.',
      color: ex.Color.Green,
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
        lineHeight: 36,
        baseAlign: ex.BaseAlign.Alphabetic
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 10);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/line-height.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/line-height-linux.png');
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
        baseAlign: ex.BaseAlign.Alphabetic,
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
    ex.FontCache.clearCache();
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

    expect(ex.FontCache.cacheSize).toBe(2);
    ex.FontCache.clearCache();
    expect(ex.FontCache.cacheSize).toBe(0);
  });

  it('will collect text bitmap garbage', async () => {
    ex.FontCache.clearCache();
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
    expect(ex.FontCache.cacheSize).toBe(2);

    await delay(1001); // text is cached for 1 second

    ex.FontCache.checkAndClearCache();
    expect(ex.FontCache.cacheSize).toBe(0);
  });

  it('will collect text bitmap garbage', async () => {
    ex.FontCache.clearCache();
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
    expect(ex.FontCache.cacheSize).toBe(2);

    await delay(1001); // text is cached for 1 second

    ex.FontCache.checkAndClearCache();
    expect(ex.FontCache.cacheSize).toBe(0);
  });

  it('should cache based on text and raster props', () => {
    ex.FontCache.clearCache();
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
    expect(ex.FontCache.cacheSize).toBe(2);
  });

  it('can reuse a font', async () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      baseAlign: ex.BaseAlign.Alphabetic
    });

    const text1 = new ex.Text({
      text: 'text111',
      font: sut
    });

    const text2 = new ex.Text({
      text: 'text222',
      font: sut
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    text1.draw(ctx, 10, 20);
    text2.draw(ctx, 10, 40);
    ctx.flush();

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/reuse-font.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/reuse-font-linux.png');
    });
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

  it('can draw large pieces of text', async () => {
    const sut = new ex.Text({
      text:
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n' +
        'A long piece of text that is multiple lines needs to be broken into multiple pieces ' +
        'so it can be drawn on mobile devices correctly otherwise it will draw black rectangles on the screen\n',
      font: new ex.Font({
        family: 'Open Sans',
        size: 18,
        quality: 4,
        padding: 0,
        baseAlign: ex.BaseAlign.Alphabetic
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 1000;
    canvasElement.height = 1000;
    const ctx = new ex.ExcaliburGraphicsContextWebGL({ canvasElement, snapToPixel: false });
    ctx.clear();
    sut.draw(ctx, 10, 50);
    ctx.flush();

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/long-text.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/long-text-linux.png');
    });
  });

  it('can create lots of text without crash', () => {
    expect(() => {
      const text: ex.Text[] = [];
      for (let i = 0; i < 1000; i++) {
        text.push(
          new ex.Text({
            text: 'text that is long' + i
          })
        );
      }
    }).not.toThrow();
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

    it('can have a custom lineHeight', async () => {
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
        lineHeight: 32
      });

      const sut = new ex.Text({
        text: '111\n222\n333\n444',
        font: spriteFont
      });

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 200;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      ctx.clear();
      sut.draw(ctx, 0, 0);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/sprite-font-line-height.png');
    });
  });

  it('will log warnings when there are issues', async () => {
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warnOnce');

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
    const warnSpy = logger.warnOnce as jasmine.Spy;
    expect(warnSpy.calls.argsFor(0)).toEqual([
      "SpriteFont - Cannot find letter '~' in configured alphabet '0123456789abcdefghijklmnopqrstuvwxyz,!'&.\"?- '."
    ]);
    expect(warnSpy.calls.argsFor(1)).toEqual([
      'There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.'
    ]);
    warnSpy.calls.reset();
    sut.text = '?';
    sut.draw(ctx, 0, 0);
    expect(warnSpy.calls.argsFor(0)).toEqual(["SpriteFont - Cannot find sprite for '?' at index '42' in configured SpriteSheet"]);
    expect(warnSpy.calls.argsFor(1)).toEqual([
      'There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.'
    ]);
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

  it('can draw multiple lines of text (spritefont)', async () => {
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

  it('can word wrap text for a spritefont', async () => {
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
      spacing: -4
    });

    const sut = new ex.Text({
      text: 'some super long text that should wrap after 100 pixels',
      color: ex.Color.Green,
      font: spriteFont,
      maxWidth: 100
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
    sut.draw(ctx, 0, 0);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/sprite-font-text-wrap.png');
  });

  it('can word wrap text for a normal font', async () => {
    const sut = new ex.Font({
      family: 'Open Sans',
      size: 18,
      quality: 1,
      baseAlign: ex.BaseAlign.Alphabetic
    });

    const text1 = new ex.Text({
      text: 'some super long text that should wrap after 100 pixels',
      font: sut,
      maxWidth: 100
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    text1.draw(ctx, 0, 18);
    ctx.flush();

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/font-text-wrap.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/font-text-wrap-linux.png');
    });
  });
});
