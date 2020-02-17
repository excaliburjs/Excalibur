import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';

describe('Some Text', () => {
  let exctx: ex.Graphics.ExcaliburGraphicsContext;
  let canvas: HTMLCanvasElement;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    exctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas(ctx);
  });

  it('exists', () => {
    expect(ex.Graphics.Text).toBeDefined();
  });

  it('can be constructed', () => {
    const text = new ex.Graphics.Text({ text: 'hello world' });
    expect(text).toBeTruthy();
  });

  it('can write text with a color', (done) => {
    const text = new ex.Graphics.Text({ text: 'hello world' });
    text.color = ex.Color.Azure;
    text.draw(exctx, 0, 10);
    ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/text.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('can write text with some padding', (done) => {
    const text = new ex.Graphics.Text({ text: 'hello world' });
    text.color = ex.Color.Azure;
    text.padding = 10;
    text.draw(exctx, 0, 10);
    ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/padding.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  describe('with a Font', () => {
    it('can write text with a new font size', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world',
        font: new ex.Graphics.Font({ size: 30 })
      });
      text.color = ex.Color.Azure;
      text.padding = 10;
      text.draw(exctx, 0, 30);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/newfont.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can write text with a bold font', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world',
        font: new ex.Graphics.Font({ size: 30 })
      });
      text.color = ex.Color.Azure;
      text.font.bold = true;
      text.draw(exctx, 0, 30);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/bold.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can write text with an italic font style', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world',
        font: new ex.Graphics.Font({ size: 30 })
      });
      text.color = ex.Color.Azure;
      text.font.style = ex.Graphics.FontStyle.Italic;
      text.draw(exctx, 0, 30);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/italic.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can write text with an right align', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world',
        font: new ex.Graphics.Font({ size: 10 })
      });
      text.showDebug = true;
      text.color = ex.Color.Azure;
      text.font.textAlign = ex.Graphics.TextAlign.Right;
      text.draw(exctx, 100, 10);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/rightaligned.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can write text with a different direction', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world?',
        font: new ex.Graphics.Font({ size: 10 })
      });
      text.showDebug = true;
      text.color = ex.Color.Azure;
      text.font.direction = ex.Graphics.Direction.RightToLeft;
      text.draw(exctx, 0, 10);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/direction.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can write text with a base align Top', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world',
        font: new ex.Graphics.Font({ size: 10 })
      });
      text.showDebug = true;
      text.color = ex.Color.Azure;
      text.font.baseAlign = ex.Graphics.BaseAlign.Top;
      text.draw(exctx, 0, 10);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/top-basealign.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can write text with a base align Bottom', (done) => {
      const text = new ex.Graphics.Text({
        text: 'hello world',
        font: new ex.Graphics.Font({ size: 10 })
      });
      text.showDebug = true;
      text.color = ex.Color.Azure;
      text.font.baseAlign = ex.Graphics.BaseAlign.Bottom;
      text.draw(exctx, 0, 10);
      ensureImagesLoaded(canvas, 'src/spec/images/TextSpec/bottom-basealign.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});
