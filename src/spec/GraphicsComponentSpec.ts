import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Graphics ECS Component', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  it('exists', () => {
    expect(ex.GraphicsComponent);
  });

  it('can be constructed', () => {
    const sut = new ex.GraphicsComponent();
    expect(sut).toBeDefined();
    expect(sut.anchor).toBeVector(ex.vec(0.5, 0.5));
    expect(sut.offset).toBeVector(ex.vec(0, 0));
    expect(sut.opacity).toBe(1);
    expect(sut.visible).toBe(true);
    expect(sut.current).toEqual([]);
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
    graphics.opacity = .2;
    graphics.visible = false;
    graphics.copyGraphics = true;
    graphics.onPreDraw = () => { /* do nothing */ };
    graphics.onPostDraw = () => { /* do nothing */};
    graphics.use(rect);
    graphics.layers.create({name: 'background', order: -1}).use(rect2);

    const clone = owner.clone();

    const sut = clone.get(ex.GraphicsComponent);

    // Should be same value
    expect(sut.anchor).toBeVector(graphics.anchor);
    expect(sut.offset).toBeVector(graphics.offset);
    expect(sut.opacity).toEqual(graphics.opacity);
    expect(sut.visible).toEqual(graphics.visible);
    expect(sut.copyGraphics).toEqual(graphics.copyGraphics);
    expect(sut.onPreDraw).toBe(sut.onPreDraw);
    expect(sut.onPostDraw).toBe(sut.onPostDraw);
    expect(sut.layers.get().length).toEqual(graphics.layers.get().length);
    expect((sut.layers.get('background').graphics[0].graphic as ex.Rectangle).color)
      .toEqual((graphics.layers.get('background').graphics[0].graphic as ex.Rectangle).color);
    expect((sut.layers.get('background').graphics[0].graphic as ex.Rectangle).width)
      .toEqual((graphics.layers.get('background').graphics[0].graphic as ex.Rectangle).width);
    expect((sut.layers.get('background').graphics[0].graphic as ex.Rectangle).height)
      .toEqual((graphics.layers.get('background').graphics[0].graphic as ex.Rectangle).height);
    expect(sut.layers.get('background').graphics[0].options).toEqual(graphics.layers.get('background').graphics[0].options);

    // Should be new refs
    expect(sut).not.toBe(graphics);
    expect(sut.offset).not.toBe(graphics.offset);
    expect(sut.anchor).not.toBe(graphics.anchor);
    expect(sut.layers.get()).not.toBe(graphics.layers.get());
    expect(sut.layers.get('background').graphics).not.toBe(graphics.layers.get('background').graphics);

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
    expect(sut.visible).toBe(false);
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
    const shownRect = sut.show(rect);
    expect(shownRect.id).not.toEqual(rect.id);
  });

  it('can show graphics', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.show(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });
    sut.show(rect, { offset: ex.vec(-1, -2), anchor: ex.vec(0, 0) });

    expect(sut.current).toEqual([
      {
        graphic: rect,
        options: {
          offset: ex.vec(1, 2),
          anchor: ex.vec(1, 1)
        }
      },
      {
        graphic: rect,
        options: {
          offset: ex.vec(-1, -2),
          anchor: ex.vec(0, 0)
        }
      }
    ]);
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
    spyOn(logger, 'error');

    expect(sut.current).toEqual([]);
    sut.show('some-gfx-2');
    expect(sut.current).toEqual([
      {
        graphic: rect,
        options: {}
      }
    ]);

    const none = sut.show('made-up-name');
    expect(none).toBeNull();
    expect(logger.error).toHaveBeenCalled();
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

    sut.show(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });

    expect(sut.current).toEqual([
      {
        graphic: rect,
        options: {
          offset: ex.vec(1, 2),
          anchor: ex.vec(1, 1)
        }
      }
    ]);

    sut.use(rect2);

    expect(sut.current).toEqual([
      {
        graphic: rect2,
        options: {}
      }
    ]);
  });

  it('can hide graphics', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.show(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });
    sut.show(rect, { offset: ex.vec(-1, -2), anchor: ex.vec(0, 0) });

    sut.hide();

    expect(sut.current).toEqual([]);
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

    const shown = sut.show('gfx-1');
    expect(shown).not.toBeNull();
    const shown2 = sut.show('gfx-2');
    expect(shown2).not.toBeNull();

    sut.hide(shown);
    expect(sut.current.length).toBe(1);

    sut.hide('gfx-2');
    expect(sut.current.length).toBe(0);
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

  it('can have multiple layers', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();

    sut.show(rect);
    sut.layers.create({ name: 'background', order: -1 }).show(rect);

    const layers = sut.layers.get();

    expect(sut.layers.has('background')).toBeTrue();
    expect(sut.layers.has('default')).toBeTrue();
    expect(layers.length).toBe(2);
    expect(layers[0].name).toBe('background');
    expect(layers[0].order).toBe(-1);
    expect(layers[1].name).toBe('default');
    expect(layers[1].order).toBe(0);
  });

  it('ticks graphics that need ticking', () => {
    const animation = new ex.Animation({
      frames: []
    });
    spyOn(animation, 'tick');

    const sut = new ex.GraphicsComponent();
    sut.add(animation);

    sut.update(123, 4);

    expect(animation.tick).toHaveBeenCalledWith(123, 4);
  });

  it('currentKeys should return names of graphics show in all layers', () => {
    const rect = new ex.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.GraphicsComponent();
    sut.layers.create({ name: 'background', order: -1 }).show(rect);
    const layers = sut.layers.currentKeys();
    expect(typeof layers).toBe('object');
    expect(layers.length).toBe(2);
  });

  it('correctly calculates graphics bounds (rasters)', () => {
    const sut = new ex.GraphicsComponent();
    const rec = new ex.Rectangle({
      width: 40,
      height: 40
    });
    rec.scale = ex.vec(3, 3);
    sut.add(rec);

    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2);
    sut.add(rec2);

    expect(sut.localBounds).toEqual(new ex.BoundingBox({
      left: -200,
      right: 200,
      top: -60,
      bottom: 60
    }));
  });

  it('correctly calculates graphics bounds (rasters + offset)', () => {
    const sut = new ex.GraphicsComponent();
    const rec = new ex.Rectangle({
      width: 40,
      height: 40
    });
    rec.scale = ex.vec(3, 3);
    sut.add(rec);

    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2);
    sut.show(rec2, { offset: ex.vec(100, 0)});

    expect(sut.localBounds).toEqual(new ex.BoundingBox({
      left: -100,
      right: 300,
      top: -60,
      bottom: 60
    }));
  });

  it('correctly calculates graphics bounds (rasters + anchor)', () => {
    const sut = new ex.GraphicsComponent();
    const rec = new ex.Rectangle({
      width: 40,
      height: 40
    });
    rec.scale = ex.vec(3, 3);
    sut.add(rec);

    const rec2 = new ex.Rectangle({
      width: 200,
      height: 10
    });
    rec2.scale = ex.vec(2, 2);
    sut.show(rec2, { anchor: ex.vec(1, 1)});

    expect(sut.localBounds).toEqual(new ex.BoundingBox({
      left: -400,
      right: 60,
      top: -60,
      bottom: 60
    }));
  });

  it('correctly calculates graphics bounds (sprite)', () => {
    const sut = new ex.GraphicsComponent();
    const image = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
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

    expect(sut.localBounds).toEqual(new ex.BoundingBox({
      left: -200,
      right: 200,
      top: -200,
      bottom: 200
    }));
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

    expect(sut.localBounds).toEqual(new ex.BoundingBox({
      left: -20,
      right: 20,
      top: -20,
      bottom: 20
    }));
  });
});
