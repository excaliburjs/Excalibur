import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

class TestGraphic extends ex.Graphics.Graphic {
  constructor(options?: ex.Graphics.GraphicOptions) {
    super(options ?? {});
    this.width = 50;
    this.height = 50;
  }
  private _rect1 = new ex.Graphics.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Green
  });
  private _rect2 = new ex.Graphics.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Red
  });
  private _rect3 = new ex.Graphics.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Yellow
  });
  private _rect4 = new ex.Graphics.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Blue
  });

  protected _drawImage(ex: ex.Graphics.ExcaliburGraphicsContext, x: number, y: number): void {
    this._rect1.draw(ex, x, y);
    this._rect2.draw(ex, x, y + 25);
    this._rect3.draw(ex, x + 25, y);
    this._rect4.draw(ex, x + 25, y + 25);
  }

  getSource(): ex.Graphics.HTMLImageSource {
    return null;
  }
  clone(): ex.Graphics.Graphic {
    return null;
  }
}

describe('A Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.Graphics.ExcaliburGraphicsContext;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);

    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });
  });

  it('exists', () => {
    expect(ex.Graphics.Graphic).toBeDefined();
  });

  it('generates a new id', () => {
    const graphic1 = new TestGraphic();
    const graphic2 = new TestGraphic();
    expect(graphic1.id).not.toBe(graphic2.id);
  });

  it('can clone all graphic options', () => {
    const originalOptions: ex.Graphics.GraphicOptions = {
      origin: ex.vec(1, 1),
      flipHorizontal: true,
      flipVertical: true,
      rotation: Math.PI / 8,
      opacity: 0.25,
      scale: ex.vec(0.5, 0.75)
    };

    const sut = new TestGraphic(originalOptions);

    expect(sut.cloneGraphicOptions()).toEqual(originalOptions);
  });

  it('can draw a graphic implementation', async () => {
    ctx.clear();
    const sut = new TestGraphic();
    sut.draw(ctx, 25, 25);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicSpec/base.png');
  });

  it('has local bounds based on the width/height', () => {
    const sut = new TestGraphic();
    expect(sut.localBounds).toEqual(new ex.BoundingBox(0, 0, sut.width, sut.height));
  });

  it('will return -1 if now texture info associated', () => {
    const sut = new TestGraphic();
    expect(sut.getSourceId()).toBe(-1);
  });

  it('will return the texture id if it has one', () => {
    const sut = new TestGraphic();
    sut.__textureInfo = { id: 99, texture: null };
    expect(sut.getSourceId()).toBe(99);
  });

  it('can rotate a graphic implementation', async () => {
    ctx.clear();
    const sut = new TestGraphic();
    sut.rotation = Math.PI / 4;
    sut.draw(ctx, 25, 25);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicSpec/rotated.png');
  });

  it('can flip a graphic implementation', async () => {
    ctx.clear();
    const sut = new TestGraphic();
    sut.flipHorizontal = true;
    sut.flipVertical = true;
    sut.draw(ctx, 25, 25);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicSpec/flipped.png');
  });

  it('can scale a graphic implementation', async () => {
    ctx.clear();
    const sut = new TestGraphic();
    sut.scale = ex.vec(2, 2);
    sut.draw(ctx, 25, 25);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicSpec/scaled.png');
  });

  it('can set opacity on a graphic implementation', async () => {
    ctx.clear();
    const sut = new TestGraphic();
    sut.opacity = 0.2;
    sut.draw(ctx, 25, 25);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicSpec/opacity.png');
  });

  it('can show a debug rect', async () => {
    ctx.clear();
    const sut = new TestGraphic();
    sut.showDebug = true;
    sut.draw(ctx, 25, 25);
    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicSpec/debug.png');
  });
});
