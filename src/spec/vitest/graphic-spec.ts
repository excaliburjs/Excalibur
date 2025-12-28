import * as ex from '@excalibur';

class TestGraphic extends ex.Graphic {
  constructor(options?: ex.GraphicOptions) {
    super(options ?? {});
    this.width = options?.width ?? 50;
    this.height = options?.height ?? 50;
  }
  private _rect1 = new ex.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Green
  });
  private _rect2 = new ex.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Red
  });
  private _rect3 = new ex.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Yellow
  });
  private _rect4 = new ex.Rectangle({
    width: 25,
    height: 25,
    color: ex.Color.Blue
  });

  protected _drawImage(ex: ex.ExcaliburGraphicsContext, x: number, y: number): void {
    this._rect1.draw(ex, x, y);
    this._rect2.draw(ex, x, y + 25);
    this._rect3.draw(ex, x + 25, y);
    this._rect4.draw(ex, x + 25, y + 25);
  }

  getSource(): ex.HTMLImageSource {
    return null;
  }
  clone(): ex.Graphic {
    return null;
  }
}

describe('A Graphic', () => {
  let canvasElement: HTMLCanvasElement;
  let ctx: ex.ExcaliburGraphicsContext;
  beforeEach(() => {
    canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });
  });

  it('exists', () => {
    expect(ex.Graphic).toBeDefined();
  });

  it('generates a new id', () => {
    const graphic1 = new TestGraphic();
    const graphic2 = new TestGraphic();
    expect(graphic1.id).not.toBe(graphic2.id);
  });

  it('can provide all graphic options', () => {
    const options: Required<ex.GraphicOptions> = {
      width: 100,
      height: 100,
      origin: ex.vec(1, 1),
      flipHorizontal: true,
      flipVertical: true,
      rotation: Math.PI / 8,
      opacity: 0.25,
      tint: ex.Color.fromRGB(0, 0, 0),
      scale: ex.vec(1, 1)
    };

    const sut = new TestGraphic(options);

    for (const prop in options) {
      expect(sut[prop]).toEqual(options[prop]);
    }
  });

  it('can clone all graphic options', () => {
    const originalOptions: Required<ex.GraphicOptions> = {
      width: 100,
      height: 100,
      origin: ex.vec(1, 1),
      flipHorizontal: true,
      flipVertical: true,
      rotation: Math.PI / 8,
      opacity: 0.25,
      tint: ex.Color.fromRGB(0, 0, 0),
      scale: ex.vec(1, 1)
    };

    const sut = new TestGraphic(originalOptions);

    expect(sut.cloneGraphicOptions()).toEqual(originalOptions);
  });

  describe('@visual', () => {
    it('can draw a graphic implementation', async () => {
      ctx.clear();
      const sut = new TestGraphic();
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicSpec/base.png');
    });

    it('has local bounds based on the width/height', () => {
      const sut = new TestGraphic();
      expect(sut.localBounds).toEqual(new ex.BoundingBox(0, 0, sut.width, sut.height));
    });

    it('can rotate a graphic implementation', async () => {
      ctx.clear();
      const sut = new TestGraphic();
      sut.rotation = Math.PI / 4;
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicSpec/rotated.png');
    });

    it('can flip a graphic implementation', async () => {
      ctx.clear();
      const sut = new TestGraphic();
      sut.flipHorizontal = true;
      sut.flipVertical = true;
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicSpec/flipped.png');
    });

    it('can scale a graphic implementation', async () => {
      ctx.clear();
      const sut = new TestGraphic();
      sut.scale = ex.vec(2, 2);
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicSpec/scaled.png');
    });

    it('can set opacity on a graphic implementation', async () => {
      ctx.clear();
      const sut = new TestGraphic();
      sut.opacity = 0.2;
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicSpec/opacity.png');
    });

    it('can show a debug rect', async () => {
      ctx.clear();
      const sut = new TestGraphic();
      sut.showDebug = true;
      sut.draw(ctx, 25, 25);
      await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicSpec/debug.png');
    });
  });
});
