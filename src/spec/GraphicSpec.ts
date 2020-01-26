import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';

class TestGraphic extends ex.Graphics.Graphic {
  public image: ex.Graphics.RawImage;
  constructor() {
    super();
    this.image = new ex.Graphics.RawImage('base/src/spec/images/RawImageSpec/sword.png');
    this.width = 100;
    this.height = 100;
  }

  public load() {
    return this.image.load();
  }

  protected _drawImage(ex: ex.Graphics.ExcaliburGraphicsContext, x: number, y: number): void {
    ex.drawImage(this.image.image, x, y, 100, 100);
  }
}

describe('A Graphic', () => {
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
    expect(ex.Graphics.Graphic).toBeDefined();
  });

  it('can can be created', () => {
    const graphic = new TestGraphic();
    expect(graphic).toBeTruthy();
  });

  it('can draw an image', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/RawImageSpec/sword.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can draw image flipped horizontally', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.flipHorizontal = true;
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/flip-horizontal.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can draw image flipped vertically', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.flipVertical = true;
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/flip-vertical.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can draw image rotated', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.rotation = Math.PI / 4;
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/rotated.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can draw image scaled', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      canvas.width = 200;
      canvas.height = 200;
      graphic.scale = ex.vec(2, 2);
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/scaled.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can draw image with opacity', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.opacity = 0.5;
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/opacity.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can draw with a different origin other than center', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      canvas.width = 200;
      graphic.origin = ex.vec(100, 0);
      graphic.rotation = -Math.PI / 4;
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/origin.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can have bounds', () => {
    const graphic = new TestGraphic();
    graphic.width = 100;
    graphic.height = 100;
    expect(graphic.localBounds).toEqual(ex.BoundingBox.fromDimension(100, 100, ex.Vector.Zero));
  });

  it('can show debug rectangle', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.showDebug = true;
      graphic.draw(exctx, 0, 0);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/debug.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });

  it('can be drawn at another position', (done) => {
    const graphic = new TestGraphic();
    graphic.load().then(() => {
      graphic.draw(exctx, 25, 25);
      ensureImagesLoaded(canvas, 'src/spec/images/GraphicSpec/translate.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });
  });
});
