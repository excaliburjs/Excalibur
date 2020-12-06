import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

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
        await document.fonts.load(font, 'some text');
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

fdescribe('A Text Graphic', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });
  beforeAll(async () => {
    const fontcdn = document.createElement('link');
    fontcdn.href = 'https://fonts.gstatic.com';
    fontcdn.rel = 'preconnect';
    const fontface = document.createElement('link');
    fontface.href =
      'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700;1,800&display=swap';
    fontface.rel = 'stylesheet';
    document.head.appendChild(fontcdn);
    document.head.appendChild(fontface);
    await waitForFontLoad('18px Open Sans');
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

  it('can write text', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });
    ctx.clear();
    sut.draw(ctx, 10, 50);

    await runOnWindows(async () => {
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/text.png');
      expect(actual).toEqualImage(image);
    });

    await runOnLinux(async () => {
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/text-linux.png');
      expect(actual).toEqualImage(image);
    });
  });

  it('can flip text vertically and horizontally', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18
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
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/flipped.png');
      expect(actual).toEqualImage(image);
    });

    await runOnLinux(async () => {
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/flipped-linux.png');
      expect(actual).toEqualImage(image);
    });
  });

  it('can rotate text around the middle', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18
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
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated.png');
      expect(actual).toEqualImage(image);
    });

    await runOnLinux(async () => {
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-linux.png');
      expect(actual).toEqualImage(image);
    });
  });

  it('can rotate text around the left', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18
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
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-left.png');
      expect(actual).toEqualImage(image);
    });

    await runOnLinux(async () => {
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-left-linux.png');
      expect(actual).toEqualImage(image);
    });
  });

  it('can rotate text around the right', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        size: 18
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
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-right.png');
      expect(actual).toEqualImage(image);
    });

    await runOnWindows(async () => {
      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-right-linux.png');
      expect(actual).toEqualImage(image);
    });
  });

  it('can be bold', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        bold: true,
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/bold.png');
    expect(actual).toEqualImage(image);
  });

  it('can be italic', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Open Sans',
        style: ex.Graphics.FontStyle.Italic,
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/italic.png');
    expect(actual).toEqualImage(image);
  });

  describe('with a SpriteFont', () => {
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

      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/spritefont-text.png');
      expect(actual).toEqualImage(image);
    });
  });
});
