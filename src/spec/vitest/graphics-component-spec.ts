import * as ex from '@excalibur';

describe('A Graphics ECS Component', () => {
  it('exists', () => {
    expect(ex.GraphicsComponent);
  });

  it('can be constructed', () => {
    const sut = new ex.GraphicsComponent();
    expect(sut).toBeDefined();
    expect(sut.anchor).toBeVector(ex.vec(0.5, 0.5));
    expect(sut.offset).toBeVector(ex.vec(0, 0));
    expect(sut.opacity).toBe(1);
    expect(sut.isVisible).toBe(true);
    expect(sut.current).toBeUndefined();
    expect(sut.graphics).toEqual({});
  });

  it('can be cloned', () => {
    const graphics = new ex.GraphicsComponent();
    const owner = new ex.Entity([graphics]);
    const rect = new ex.Rectangle({
      width: 40,
      height: 40,
      color: ex.Color.Red
    });
    const rect2 = new ex.Rectangle({
      width: 40,
      height: 40,
      color: ex.Color.Blue
    });
    graphics.anchor = ex.vec(0, 0);
    graphics.offset = ex.vec(1, 1);
    graphics.opacity = 0.2;
    graphics.isVisible = false;
    graphics.copyGraphics = true;
    graphics.onPreDraw = () => {
      /* do nothing */
    };
    graphics.onPostDraw = () => {
      /* do nothing */
    };
    graphics.use(rect);

    const clone = owner.clone();

    const sut = clone.get(ex.GraphicsComponent);

    // Should be same value
    expect(sut.anchor).toBeVector(graphics.anchor);
    expect(sut.offset).toBeVector(graphics.offset);
    expect(sut.opacity).toEqual(graphics.opacity);
    expect(sut.isVisible).toEqual(graphics.isVisible);
    expect(sut.copyGraphics).toEqual(graphics.copyGraphics);
    expect(sut.onPreDraw).toBe(sut.onPreDraw);
    expect(sut.onPostDraw).toBe(sut.onPostDraw);

    // Should be new refs
    expect(sut).not.toBe(graphics);
    expect(sut.offset).not.toBe(graphics.offset);
    expect(sut.anchor).not.toBe(graphics.anchor);

    // Should have a new owner
    expect(sut.owner).toBe(clone);
  });

  it('can be constructed with optional params', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent({
      graphics: {
        'some-gfx': rect
      },
      current: 'some-gfx',
      visible: false,
      opacity: 0.5,
      copyGraphics: true,
      offset: ex.vec(10, 11),
      anchor: ex.vec(0, 0)
    });

    expect(sut.anchor).toBeVector(ex.vec(0, 0));
    expect(sut.offset).toBeVector(ex.vec(10, 11));
    expect(sut.opacity).toBe(0.5);
    expect(sut.isVisible).toBe(false);
    expect(sut.current).not.toBeNull();
    expect(sut.graphics).toEqual({
      'some-gfx': rect
    });
    expect(sut.getNames()).toEqual(['some-gfx']);
    expect(sut.getGraphic('some-gfx')).toEqual(rect);
  });

  it('can implicitly copy graphics', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent({
      copyGraphics: true
    });
    const shownRect = sut.use(rect);
    expect(shownRect.id).not.toEqual(rect.id);
  });

  it('can show graphics', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.use(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });

    expect(sut.current).toEqual(rect);
    expect(sut.currentOptions).toEqual({
      offset: ex.vec(1, 2),
      anchor: ex.vec(1, 1)
    });

    sut.use(rect, { offset: ex.vec(-1, -2), anchor: ex.vec(0, 0) });

    expect(sut.current).toEqual(rect);
    expect(sut.currentOptions).toEqual({
      offset: ex.vec(-1, -2),
      anchor: ex.vec(0, 0)
    });
  });

  it('can remove graphics', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.add('rect', rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });
    expect(sut.current).toBe(undefined);
    expect(sut.currentOptions).toBe(undefined);

    expect(sut.getNames()).toEqual(['rect']);

    sut.use('rect');
    expect(sut.current).toEqual(rect);
    expect(sut.currentOptions).toEqual(undefined);

    sut.remove('rect');

    expect(sut.current).toBe(undefined);
    expect(sut.currentOptions).toBe(undefined);
    expect(sut.getNames()).toEqual([]);
  });

  it('can show graphics by name if it exists', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent({
      graphics: {
        'some-gfx-2': rect
      }
    });

    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');

    expect(sut.current).toBeUndefined();
    sut.use('some-gfx-2');
    expect(sut.current).toEqual(rect);
    expect(sut.currentOptions).toBeUndefined();

    const none = sut.use('made-up-name');
    expect(none).toBeUndefined();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('can swap all the graphics for a graphic', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const rect2 = new ex.Rectangle({
      width: 50,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.use(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });

    expect(sut.current).toEqual(rect);
    expect(sut.currentOptions).toEqual({
      offset: ex.vec(1, 2),
      anchor: ex.vec(1, 1)
    });

    sut.use(rect2);

    expect(sut.current).toEqual(rect2);
    expect(sut.currentOptions).toBeUndefined();
  });

  it('can hide graphics', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.use(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });

    sut.hide();

    expect(sut.current).toBeUndefined();
  });

  it('can hide graphics by reference or name', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const rect2 = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent({
      graphics: {
        'gfx-1': rect,
        'gfx-2': rect2
      }
    });

    const shown = sut.use('gfx-1');
    expect(shown).not.toBeNull();
    const shown2 = sut.use('gfx-2');
    expect(shown2).not.toBeNull();

    sut.hide();
    expect(sut.current).toBeUndefined();
  });

  it('can have graphics added to it', () => {
    const rect = new ex.Rectangle({
      width: 10,
      height: 20
    });
    const sut = new ex.GraphicsComponent();

    sut.add('some-graphic', rect);
    expect(sut.graphics['some-graphic']).toBe(rect);

    sut.add(rect);
    expect(sut.graphics.default).toBe(rect);
  });

  it('ticks graphics that need ticking', () => {
    const animation = new ex.Animation({
      frames: []
    });
    vi.spyOn(animation, 'tick');

    const sut = new ex.GraphicsComponent();
    sut.add(animation);

    sut.update(123, 4);

    expect(animation.tick).toHaveBeenCalledWith(123, 4);
  });

  it('correctly calculates graphics bounds (rasters)', () => {
    const sut = new ex.GraphicsComponent();
    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2);
    sut.add(rec2);

    expect(sut.localBounds).toEqual(
      new ex.BoundingBox({
        left: -200,
        right: 200,
        top: -10,
        bottom: 10
      })
    );
  });

  it('correctly calculates graphics world bounds (rasters)', () => {
    const tx = new ex.TransformComponent();
    tx.pos = ex.vec(500, 900);
    const sut = new ex.GraphicsComponent();
    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2);
    sut.add(rec2);

    const entity = new ex.Entity([tx, sut]);

    expect(sut.bounds).toEqual(
      new ex.BoundingBox({
        left: 300,
        right: 700,
        top: 890,
        bottom: 910
      })
    );
  });

  it('correctly calculates graphics bounds (rasters + offset)', () => {
    const sut = new ex.GraphicsComponent();
    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2); // width 400, height 20
    sut.use(rec2, { offset: ex.vec(100, 0) }); // offset 100 to the right

    expect(sut.localBounds).toEqual(
      new ex.BoundingBox({
        left: -100,
        right: 300,
        top: -10,
        bottom: 10
      })
    );
  });

  it('correctly calculates graphics bounds (rasters + anchor)', () => {
    const sut = new ex.GraphicsComponent();
    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2); // width 400, height 20
    sut.use(rec2, { anchor: ex.vec(1, 1) }); // anchor at the bottom right

    expect(sut.localBounds).toEqual(
      new ex.BoundingBox({
        left: -400,
        right: 0,
        top: -20,
        bottom: 0
      })
    );
  });

  it('correctly calculates graphics bounds (sprite)', () => {
    const sut = new ex.GraphicsComponent();
    const image = new ex.ImageSource('src/spec/images/graphics-text-spec/spritefont.png');
    const sprite = new ex.Sprite({
      image,
      sourceView: {
        x: 0,
        y: 0,
        width: 16,
        height: 16
      },
      destSize: {
        width: 100,
        height: 100
      }
    });
    sprite.scale = ex.vec(4, 4);
    sut.add(sprite);

    expect(sut.localBounds).toEqual(
      new ex.BoundingBox({
        left: -200,
        right: 200,
        top: -200,
        bottom: 200
      })
    );
  });

  it('correctly calculates graphics bounds (animation)', () => {
    const sut = new ex.GraphicsComponent();
    const sourceImage = new ex.ImageSource('some/image.png');
    const ss = ex.SpriteSheet.fromImageSource({
      image: sourceImage,
      grid: {
        spriteWidth: 10,
        spriteHeight: 10,
        rows: 10,
        columns: 10
      }
    });
    const anim = ex.Animation.fromSpriteSheet(ss, [0, 1, 2, 3], 100, ex.AnimationStrategy.Freeze);

    anim.scale = ex.vec(4, 4);
    sut.add(anim);

    expect(sut.localBounds).toEqual(
      new ex.BoundingBox({
        left: -20,
        right: 20,
        top: -20,
        bottom: 20
      })
    );
  });
});
