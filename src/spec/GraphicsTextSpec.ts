import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Text Graphic', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
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
        family: 'Georgia',
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});
    ctx.clear();
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/text.png');
    expect(actual).toEqualImage(image);
  });

  it('can flip text vertically and horizontally', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Georgia',
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    ctx.clear();
    sut.flipHorizontal = true;
    sut.flipVertical = true;
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/flipped.png');
    expect(actual).toEqualImage(image);
  });

  it('can rotate text around the middle', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Georgia',
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    ctx.clear();
    sut.rotation = Math.PI / 2;
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated.png');
    expect(actual).toEqualImage(image);
  });

  it('can rotate text around the left', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Georgia',
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    ctx.clear();
    sut.origin = ex.Vector.Zero;
    sut.rotation = Math.PI / 2;
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-left.png');
    expect(actual).toEqualImage(image);
  });

  it('can rotate text around the right', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Georgia',
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    ctx.clear();
    sut.origin = ex.vec(sut.width, 0);
    sut.rotation = -Math.PI / 2;
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/rotated-right.png');
    expect(actual).toEqualImage(image);
  });

  it('can be bold', async () => {
    const sut = new ex.Graphics.Text({
      text: 'green text',
      color: ex.Color.Green,
      font: new ex.Graphics.Font({
        family: 'Georgia',
        bold: true,
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

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
        family: 'Georgia',
        style: ex.Graphics.FontStyle.Italic,
        size: 18
      })
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

    ctx.clear();
    sut.draw(ctx, 10, 50);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/italic.png');
    expect(actual).toEqualImage(image);
  });

  describe('with a SpriteFont', () => {
    it('can specify a spritefont', async () => {
      const spriteFontImage = new ex.Graphics.RawImage('base/src/spec/images/GraphicsTextSpec/spritefont.png');

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
      const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({canvasElement});

      ctx.clear();
      sut.draw(ctx, 0, 50);

      const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsTextSpec/spritefont-text.png');
      expect(actual).toEqualImage(image);
    });
  });

});