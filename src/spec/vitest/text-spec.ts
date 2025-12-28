import * as ex from '@excalibur';
import { delay } from '../../engine/util/util';
import { inject } from 'vitest';

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

function waitForSheet(link: HTMLLinkElement) {
  return new Promise<void>((res, rej) => {
    link.addEventListener('load', () => res(), { once: true });
    link.addEventListener('error', () => rej(new Error('stylesheet failed to load')), { once: true });
  });
}

async function waitFace(desc: string, text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  const faces = await document.fonts.load(desc, text);
  if (!faces || faces.length === 0) {
    throw new Error(`No @font-face matched: ${desc}`);
  }
  if (!document.fonts.check(desc, text)) {
    throw new Error(`Font not ready after load(): ${desc}`);
  }
}

/**
 * Font rendering varies significantly between operating systems and browsers. Even for the same
 * OS, the presence of certain kinds of fonts or enabled font features can affect this. So
 * we use a low tolerance to at least ensure we don't break rendering altogether.
 *
 * Below are notes from when we only enabled font screenshot tests on Windows+Chrome.
 * It explains some specific differences that may actually be bugs.
 *
 * -------------------------------------------------------------
 *
 * for now, only run the Text tests on Windows + Chromium because
 * there are too many subtle differences in rendering text
 * across browser/os combos.
 *
 * Screenshot assertions will need to be split apart by platform + browser. They
 * currently only work on Windows + Chromium. If you add a new platform+browser combo, you
 * will need to create those screenshots. There are Linux ones left over from before but I am
 * not sure if they are the correct ones, as we had issues getting them to pass
 * on any Linux+Chrome/Chromium combo after migrating from Karma.
 *
 * Notes for if we do enable other platforms:
 *
 * Linux (Chrome):
 *  - There seems to be +1 height difference per-line in text height. This can
 *    be accounted for by asserting `expect(height).toBeCloseTo(expectedHeight, -numberOfLines)`
 *    This could be a legit bug
 *
 *  - Text rendering on Chrome between GitHub Linux vs local Linux are different somehow. Tried
 *    all kinds of flags, but text quality differs quite a bit. Can be fixed to pass
 *    some linux screenshots by setting quality of the font to 3, or in one case 10.
 */
const IMAGE_TOLERANCE = 0.91;

describe('A Text Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext2DCanvas | ex.ExcaliburGraphicsContextWebGL;

  beforeAll(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/spec/assets/images/GraphicsTextSpec/fonts.css';
    document.head.appendChild(link);
    await waitForSheet(link);

    await Promise.all([
      waitFace('400 1em "Open Sans"'),
      waitFace('700 1em "Open Sans"'),
      waitFace('italic 400 1em "Open Sans"'),
      waitFace('italic 700 1em "Open Sans"')
    ]);

    await document.fonts.ready;
  });

  beforeEach(() => {
    if (canvasElement) {
      canvasElement.remove();
    }

    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    document.body.append(canvasElement);
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
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

  describe('@visual', () => {
    // measurement tests do not screenshot but are still affected by browser rendering,
    // so we'll group them in with the visual
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

      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/text.png', IMAGE_TOLERANCE);
    });

    it('can draw multiple lines of text (font)', async () => {
      const sut = new ex.Text({
        text: 'multiple\nlines\nof text',
        color: ex.Color.Green,
        font: new ex.Font({
          family: 'Open Sans',
          size: 18,
          lineHeight: 18,
          quality: 1,
          padding: 0,
          baseAlign: ex.BaseAlign.Alphabetic
        })
      });

      sut.draw(ctx, 10, 20);

      expect(sut.width).toBeCloseTo(69.8, -1);
      expect(sut.localBounds.width).toBeCloseTo(69.8, -1);
      expect(sut.height).toBeCloseTo(18 * 3, 0);
      expect(sut.localBounds.height).toBeCloseTo(18 * 3, 0);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/multi-text-win.png', IMAGE_TOLERANCE);
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

      sut.flipHorizontal = true;
      sut.flipVertical = true;
      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/flipped.png', IMAGE_TOLERANCE);
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

      sut.draw(ctx, 10, 20);
      sut.draw(ctx, 10, 40);
      sut.draw(ctx, 10, 60);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/font-alignment.png', IMAGE_TOLERANCE);
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

      sut.rotation = Math.PI / 2;
      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/rotated.png', IMAGE_TOLERANCE);
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

      sut.origin = ex.Vector.Zero;
      sut.rotation = Math.PI / 2;
      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/rotated-left.png', IMAGE_TOLERANCE);
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

      sut.origin = ex.vec(sut.width, 0);
      sut.rotation = -Math.PI / 2;
      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/rotated-right.png', IMAGE_TOLERANCE);
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

      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/bold-win.png', IMAGE_TOLERANCE);
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

      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/italic.png', IMAGE_TOLERANCE);
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

      sut.draw(ctx, 10, 10);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/line-height-win.png', IMAGE_TOLERANCE);
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

      sut.draw(ctx, 10, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/shadow.png', IMAGE_TOLERANCE);
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

      text1.draw(ctx, 10, 20);
      text2.draw(ctx, 10, 40);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/reuse-font-win.png', IMAGE_TOLERANCE);
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
      canvasElement.remove();
      canvasElement = document.createElement('canvas');
      canvasElement.width = 1000;
      canvasElement.height = 1000;

      ctx = new ex.ExcaliburGraphicsContextWebGL({ canvasElement, snapToPixel: false });
      ctx.clear();

      sut.draw(ctx, 10, 50);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/long-text.png', IMAGE_TOLERANCE);
    });

    it('can do some simple shadowing', async () => {
      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');

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

      canvasElement.width = 200;
      ctx.clear();
      sut.draw(ctx, 0, 50);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/spritefont-shadow.png', IMAGE_TOLERANCE);
    });

    it('can rotate spritefont text around the middle', async () => {
      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
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

      canvasElement.width = 100;
      ctx.clear();

      sut.rotation = Math.PI / 2;
      sut.draw(ctx, 10, 40);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/rotated-spritefont.png', IMAGE_TOLERANCE);
    });

    it('can align fonts and reuse a spritefont', async () => {
      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
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

      canvasElement.width = 100;
      ctx.clear();

      sut.draw(ctx, 0, 20);
      sut.draw(ctx, 0, 40);
      sut.draw(ctx, 0, 60);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/spritefont-alignment.png', IMAGE_TOLERANCE);
    });

    it('can draw multiple lines of text (spritefont)', async () => {
      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
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

      canvasElement.width = 100;
      ctx.clear();

      sut.draw(ctx, 10, 20);

      expect(sut.width).toBeCloseTo(80);
      expect(sut.height).toBeCloseTo(48);
      expect(sut.localBounds.width).toBeCloseTo(80);
      expect(sut.localBounds.height).toBeCloseTo(48);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/multi-text-spritefont.png', IMAGE_TOLERANCE);
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

      canvasElement.width = 100;
      ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement, multiSampleAntialiasing: false });

      ctx.clear();
      text1.draw(ctx, 0, 18);
      ctx.flush();

      await new Promise((r) => setTimeout(r, 1000));

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/font-text-wrap-win.png', IMAGE_TOLERANCE);
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

    text.draw(ctx, 10, 50);
    text2.draw(ctx, 10, 50);
    expect(ex.FontCache.cacheSize).toBe(2);
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
    beforeEach(() => {
      if (canvasElement) {
        canvasElement.remove();
      }

      canvasElement.remove();
      canvasElement = document.createElement('canvas');
      canvasElement.width = 200;
      canvasElement.height = 100;
      document.body.append(canvasElement);
      ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
      ctx.clear();
    });

    it('can be cloned', () => {
      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');

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

    it('will log warnings when there are issues', async () => {
      const logger = ex.Logger.getInstance();
      const warnSpy = vi.spyOn(logger, 'warnOnce');

      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');

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

      sut.text = '~';
      sut.draw(ctx, 0, 0);

      expect(warnSpy.mock.calls[0]).toEqual([
        "SpriteFont - Cannot find letter '~' in configured alphabet '0123456789abcdefghijklmnopqrstuvwxyz,!'&.\"?- '."
      ]);
      expect(warnSpy.mock.calls[1]).toEqual([
        'There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.'
      ]);
      warnSpy.mockReset();
      sut.text = '?';
      sut.draw(ctx, 0, 0);
      expect(warnSpy.mock.calls[0]).toEqual(["SpriteFont - Cannot find sprite for '?' at index '42' in configured SpriteSheet"]);
      expect(warnSpy.mock.calls[1]).toEqual([
        'There maybe be more issues in the SpriteFont configuration. No additional warnings will be logged.'
      ]);
    });

    it('can measure text for a spritefont', async () => {
      const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
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

    describe('@visual', () => {
      it('can specify a spritefont', async () => {
        const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');

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

        sut.draw(ctx, 0, 50);

        await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/spritefont-text.png');
      });

      it('can scale a spritefont', async () => {
        const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');

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
          scale: ex.vec(3, 3)
        });

        const sut = new ex.Text({
          text: 'Some Sprite Text!?',
          font: spriteFont
        });

        sut.draw(ctx, 0, 50);
        expect(spriteFont.measureText('some test')).toEqual(ex.BoundingBox.fromDimension((16 - 5) * 9 * 3, 16 * 3, ex.vec(0, 0)));
        await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/spritefont-scaled.png');
      });

      it('can have a custom lineHeight', async () => {
        const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');

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

        sut.draw(ctx, 0, 0);

        await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/sprite-font-line-height.png', IMAGE_TOLERANCE);
      });

      it('can word wrap text for a spritefont', async () => {
        const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/GraphicsTextSpec/spritefont.png');
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

        canvasElement.width = 100;
        ctx.clear();

        sut.draw(ctx, 0, 0);

        await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsTextSpec/sprite-font-text-wrap.png', IMAGE_TOLERANCE);
      });
    });
  });
});
