import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A label', () => {
  let label: ex.Label;
  let engine: ex.Engine;
  let scene: ex.Scene;

  beforeEach(() => {
    engine = TestUtils.engine({
      width: 500,
      height: 500
    });
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.Label).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Label({ text: 'some text' });
    expect(sut).not.toBeNull();
  });

  it('can construct with empty text', () => {
    expect(() => {
      const sut = new ex.Label();
    }).not.toThrow();
  });

  it('can be constructed with a font', () => {
    const sut = new ex.Label({
      text: 'some text',
      color: ex.Color.Red,
      font: new ex.Font({
        color: ex.Color.Blue,
        family: 'Open Sans',
        size: 18,
        quality: 1,
        padding: 0
      })
    });
    expect(sut.text).toBe('some text');
    expect(sut.font.family).toBe('Open Sans');
    expect(sut.font.color).toEqual(ex.Color.Blue);
    expect(sut.color).toEqual(ex.Color.Red);
    expect(sut.font.size).toBe(18);
    expect(sut.font.quality).toBe(1);
    expect(sut.font.padding).toBe(0);
  });

  it('can be constructed with a spritefont', async () => {
    const spriteFontImage = new ex.ImageSource('/src/spec/assets/images/graphics-text-spec/spritefont.png');

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

    const sut = new ex.Label({
      text: 'some text',
      spriteFont: spriteFont
    });
    expect(sut.text).toBe('some text');
    expect((sut as any)._spriteFont).toBe(spriteFont);
    // expect(sut.spriteFont).toBe(spriteFont);
  });

  it('can have opacity set on the label and its the same as the graphics', () => {
    const label = new ex.Label({
      text: 'some text',
      opacity: 0.75
    });

    expect(label.opacity).toEqual(label.graphics.opacity);
    label.opacity = 0.25;
    expect(label.opacity).toEqual(label.graphics.opacity);
  });
});
