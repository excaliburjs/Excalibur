import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

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
  const FontFace: FontFace;

  interface Document {
    fonts: FontFaceSet;
  }

  type CSSOMString = string;
  type FontFaceLoadStatus = 'unloaded' | 'loading' | 'loaded' | 'error';
  type FontFaceSetStatus = 'loading' | 'loaded';

  interface FontFace extends FontFaceDescriptors {
    new (family: string, source: string | ArrayBuffer, descriptors?: FontFaceDescriptors): FontFace;
    readonly status: FontFaceLoadStatus;
    readonly loaded: Promise<FontFace>;
    variationSettings: CSSOMString;
    display: CSSOMString;
    load(): Promise<FontFace>;
  }

  interface FontFaceDescriptors {
    family: CSSOMString;
    style: CSSOMString;
    weight: CSSOMString;
    stretch: CSSOMString;
    unicodeRange: CSSOMString;
    variant: CSSOMString;
    featureSettings: CSSOMString;
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
    fontface.href = 'base/src/spec/images/GraphicsTextSpec/fonts.css';
    fontface.rel = 'stylesheet';
    document.head.appendChild(fontface);
    await waitForFontLoad('18px Open Sans');
    await waitForFontLoad('bold 18px Open Sans');
    await waitForFontLoad('italic bold 18px Open Sans');
    await waitForFontLoad('italic 18px Open Sans');
  });

  it('exists', () => {
    expect(ex.Graphics.Text).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Graphics.Text({
      text: 'yo'
    });
    expect(sut).toBeDefined();
  });

  it('can be cloned', () => {
    const sut = new ex.Graphics.Text({
      text: 'some text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({ family: 'some-font-family' })
    });

    const clone = sut.clone();

    expect(clone.text).toBe('some text');
    expect(clone.color).toEqual(ex.Color.Green);
    expect((clone.font as ex.Graphics.Font).family).toBe('some-font-family');
  });

  it('can write text', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/text.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/text-linux.png');
    });
  });

  it('can have width and height', () => {
    const sut = new ex.Graphics.Text({
      text: 'some extra long text that we want to measure',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1
      })
    });

    expect(sut.width).toBeCloseTo(386.9, -1);
    expect(sut.height).toBeCloseTo(18, 0);
    expect(sut.localBounds.width).toBeCloseTo(386.9, -1);
    expect(sut.localBounds.height).toBeCloseTo(18, 0);
  });

  it('can flip text vertically and horizontally', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

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

  it('can rotate text around the middle', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

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
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

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
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

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
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        bold: true,
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

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
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        style: ex.Graphics.FontStyle.Italic,
        size: 18,
        quality: 1
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

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
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18,
        quality: 1,
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
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/shadow.png');
    });

    await runOnLinux(async () => {
      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/shadow-linux.png');
    });
  });

  describe('with a SpriteFont', () => {
    it('can be cloned', () => {
      const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');

      const spriteFontSheet = ex.Graphics.SpriteSheet.fromGrid({
        image: spriteFontImage,
        grid: {
          rows: 3,
          columns: 16,
          spriteWidth: 16,
          spriteHeight: 16
        }
      });

      const spriteFont = new ex.Graphics.SpriteFont({
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        spacing: -5,
        spriteSheet: spriteFontSheet
      });

      const sut = new ex.Graphics.Text({
        text: 'Some Sprite Text!?',
        font: spriteFont
      });

      const clone = sut.clone();

      expect(sut.font).not.toBe(clone.font);
    });

    it('can specify a spritefont', async () => {
      const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');

      await spriteFontImage.load();

      const spriteFontSheet = ex.Graphics.SpriteSheet.fromGrid({
        image: spriteFontImage,
        grid: {
          rows: 3,
          columns: 16,
          spriteWidth: 16,
          spriteHeight: 16
        }
      });

      const spriteFont = new ex.Graphics.SpriteFont({
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        spacing: -5,
        spriteSheet: spriteFontSheet
      });

      const sut = new ex.Graphics.Text({
        text: 'Some Sprite Text!?',
        font: spriteFont
      });

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 200;
      canvasElement.height = 100;
      const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      ctx.clear();
      sut.draw(ctx, 0, 50);

      await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/spritefont-text.png');
    });
  });

  it('will log warnings when there are issues', async () => {
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');

    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');

    await spriteFontImage.load();

    const spriteFontSheet = ex.Graphics.SpriteSheet.fromGrid({
      image: spriteFontImage,
      grid: {
        rows: 1,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.Graphics.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spacing: -5,
      spriteSheet: spriteFontSheet
    });

    const sut = new ex.Graphics.Text({
      text: 'a',
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 200;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    sut.text = '~';
    sut.draw(ctx, 0, 0);
    expect(logger.warn).toHaveBeenCalledWith(
      'SpriteFont - Cannot find letter \'~\' in configured alphabet \'0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- \''
    );

    sut.text = '?';
    sut.draw(ctx, 0, 0);
    expect(logger.warn).toHaveBeenCalledWith('SpriteFont - Cannot find sprite for \'?\' at index \'42\' in configured SpriteSheet');
  });

  it('can do some simple shadowing', async () => {
    const spriteFontImage = new ex.Graphics.ImageSource('base/src/spec/images/GraphicsTextSpec/spritefont.png');

    await spriteFontImage.load();

    const spriteFontSheet = ex.Graphics.SpriteSheet.fromGrid({
      image: spriteFontImage,
      grid: {
        rows: 3,
        columns: 16,
        spriteWidth: 16,
        spriteHeight: 16
      }
    });

    const spriteFont = new ex.Graphics.SpriteFont({
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
      caseInsensitive: true,
      spacing: -5,
      spriteSheet: spriteFontSheet,
      shadow: {
        offset: ex.vec(3, 3)
      }
    });

    const sut = new ex.Graphics.Text({
      text: 'Some Sprite Text!?',
      font: spriteFont
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 200;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 0, 50);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsTextSpec/spritefont-shadow.png');
  });
});
