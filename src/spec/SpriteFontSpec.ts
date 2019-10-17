import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A spritefont', () => {
  let engine: ex.Engine;
  let texture: ex.Texture;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = TestUtils.engine({
      width: 800,
      height: 200
    });

    texture = new ex.Texture('base/src/spec/images/SpriteFontSpec/SpriteFont.png', true);
  });
  afterEach(() => {
    engine.stop();
    engine = null;
  });

  it('should have props set by the constructor', () => {
    texture.load().then(() => {
      const sf = new ex.SpriteFont({
        image: texture,
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        columns: 16,
        rows: 3,
        spWidth: 16,
        spHeight: 16
      });

      expect(sf.image.isLoaded());
      expect(sf.columns).toBe(16);
      expect(sf.rows).toBe(3);
      expect(sf.spWidth).toBe(16);
      expect(sf.spHeight).toBe(16);
    });
  });

  it('should draw a string', (done) => {
    texture.load().then(() => {
      const sf = new ex.SpriteFont({
        image: texture,
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        columns: 16,
        rows: 3,
        spWidth: 16,
        spHeight: 16
      });

      sf.draw(engine.ctx, `This is a test string!?-&.'`, 20, 20, {
        color: ex.Color.Green,
        opacity: 1,
        fontSize: 20,
        letterSpacing: 0,
        textAlign: ex.TextAlign.Left,
        baseAlign: ex.BaseAlign.Bottom,
        maxWidth: 500
      });

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteFontSpec/ExpectedFont.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should get text sprites', (done) => {
    texture.load().then(() => {
      const sf = new ex.SpriteFont({
        image: texture,
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        columns: 16,
        rows: 3,
        spWidth: 16,
        spHeight: 16
      });

      const sprites = sf.getTextSprites();

      sprites['0'].draw(engine.ctx, 0, 0);
      sprites['4'].draw(engine.ctx, 16, 0);
      sprites['9'].draw(engine.ctx, 2 * 16, 0);
      // eslint-disable-next-line dot-notation
      sprites['a'].draw(engine.ctx, 3 * 16, 0);
      // eslint-disable-next-line dot-notation
      sprites['q'].draw(engine.ctx, 4 * 16, 0);
      // eslint-disable-next-line dot-notation
      sprites['z'].draw(engine.ctx, 5 * 16, 0);
      sprites['&'].draw(engine.ctx, 1 * 16, 16);
      sprites['.'].draw(engine.ctx, 2 * 16, 16);
      sprites['"'].draw(engine.ctx, 3 * 16, 16);
      sprites['?'].draw(engine.ctx, 4 * 16, 16);
      sprites['-'].draw(engine.ctx, 5 * 16, 16);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteFontSpec/IndividualSprites.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('should have text shadow', (done) => {
    texture.load().then(() => {
      const sf = new ex.SpriteFont({
        image: texture,
        alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
        caseInsensitive: true,
        columns: 16,
        rows: 3,
        spWidth: 16,
        spHeight: 16
      });

      sf.setTextShadow(5, 5, ex.Color.Yellow);

      sf.draw(engine.ctx, 'This should have text shadow', 20, 20, {
        color: ex.Color.Blue,
        opacity: 1,
        fontSize: 20,
        letterSpacing: 0,
        textAlign: ex.TextAlign.Left,
        baseAlign: ex.BaseAlign.Bottom,
        maxWidth: 500
      });

      ensureImagesLoaded(engine.canvas, 'src/spec/images/SpriteFontSpec/TextShadow.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});
