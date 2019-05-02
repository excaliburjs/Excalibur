import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

xdescribe('A label', () => {
  let label: ex.Label;
  let engine: ex.Engine;
  let scene: ex.Scene;

  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    engine = new ex.Engine({
      width: 500,
      height: 500,
      suppressConsoleBootMessage: true,
      suppressMinimumBrowserFeatureDetection: true
    });

    label = new ex.Label('Test string', 100, 100);
    label.fontFamily = 'Verdana';
    scene = new ex.Scene(engine);
    engine.currentScene = scene;

    scene.add(label);

    //console.log('============================\n OS:' + platform.os.family);
  });

  it('should have props set by constructor', () => {
    const label = new ex.Label({
      text: 'test text',
      bold: true,
      pos: new ex.Vector(1, 2),
      spriteFont: null,
      fontFamily: 'Verdana',
      fontSize: 12,
      fontStyle: ex.FontStyle.Normal,
      fontUnit: ex.FontUnit.Px,
      textAlign: ex.TextAlign.Left,
      maxWidth: 200
    });

    expect(label.text).toBe('test text');
    expect(label.bold).toBe(true);
    expect(label.pos.x).toBe(1);
    expect(label.pos.y).toBe(2);
    expect(label.spriteFont).toBe(null);
    expect(label.fontFamily).toBe('Verdana');
    expect(label.fontSize).toBe(12);
    expect(label.fontStyle).toBe(ex.FontStyle.Normal);
    expect(label.fontUnit).toBe(ex.FontUnit.Px);
    expect(label.textAlign).toBe(ex.TextAlign.Left);
    expect(label.maxWidth).toBe(200);
  });

  it('should be loaded', () => {
    expect(ex.Label).toBeTruthy();
  });

  it('should be loaded', () => {
    expect(ex.Label).toBeTruthy();
  });

  it('should have text', () => {
    expect(label.text).toBe('Test string');
  });

  it('should default to black', () => {
    expect(label.color.toString()).toBe(ex.Color.Black.toString());
  });

  it('can change color', (done) => {
    label.text = 'some blue text';
    label.fontSize = 30;
    label.color = ex.Color.Blue.clone();

    expect(label.color.toString()).toBe(ex.Color.Blue.toString());

    label.update(engine, 100);
    label.draw(engine.ctx, 100);
    expect(label.color.toString()).toBe(ex.Color.Blue.toString());

    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/bluetext.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 1);
      done();
    });
  });

  it('to enable italic fontStyle', (done) => {
    label.text = 'some italic text';
    label.fontSize = 30;
    label.color = ex.Color.Black;
    label.fontStyle = ex.FontStyle.Italic;
    label.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/italictext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  it('to enable oblique fontStyle', (done) => {
    label.text = 'some oblique text';
    label.fontSize = 30;
    label.color = ex.Color.Black;
    label.fontStyle = ex.FontStyle.Oblique;
    label.draw(engine.ctx, 100);
    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/obliquetext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  it('to enable normal fontStyle', (done) => {
    label.text = 'some normal text';
    label.fontFamily = 'Arial';
    label.fontSize = 30;
    label.color = ex.Color.Black;
    label.bold = false;
    label.fontStyle = ex.FontStyle.Normal;

    label.draw(engine.ctx, 100);
    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/normaltext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  it('to enable bold text', (done) => {
    label.text = 'some bold text';
    label.fontFamily = 'Arial';
    label.fontSize = 30;
    label.color = ex.Color.Black;
    label.bold = true;

    label.draw(engine.ctx, 100);
    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/boldtext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  it('to enable right aligned text', (done) => {
    label.x = 200;
    label.text = 'some right aligned text';
    label.fontSize = 30;
    label.color = ex.Color.Blue;
    label.textAlign = ex.TextAlign.Right;
    label.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/righttext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  it('to enable left aligned text', (done) => {
    label.x = 200;
    label.text = 'some left aligned text';
    label.fontSize = 30;
    label.color = ex.Color.Blue;
    label.textAlign = ex.TextAlign.Left;
    label.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/lefttext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  it('to enable center aligned text', (done) => {
    label.x = 200;
    label.text = 'some center aligned text';
    label.fontSize = 30;
    label.color = ex.Color.Blue;
    label.textAlign = ex.TextAlign.Center;
    label.draw(engine.ctx, 100);

    ensureImagesLoaded(engine.canvas, 'src/spec/images/LabelSpec/centertext-linux.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image, 0.98);
      done();
    });
  });

  xit('can measure text width', () => {
    label.x = 200;
    label.text = 'some text to measure';
    label.fontSize = 30;
    label.color = ex.Color.Blue;
    label.textAlign = ex.TextAlign.Center;
    label.draw(engine.ctx, 100);
    // if (isLinux()) {
    //   expect(label.getTextWidth(engine.ctx)).toBeCloseTo(327.90625, 0.01);
    // } else {
    //   expect(label.getTextWidth(engine.ctx)).toBe(335);
    // }
  });
});
