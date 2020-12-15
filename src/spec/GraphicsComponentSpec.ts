import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Graphics ECS Component', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  it('exists', () => {
    expect(ex.Graphics.GraphicsComponent);
  });

  it('can be constructed', () => {
    const sut = new ex.Graphics.GraphicsComponent();
    expect(sut).toBeDefined();
    expect(sut.anchor).toBeVector(ex.vec(0.5, 0.5));
    expect(sut.offset).toBeVector(ex.vec(0, 0));
    expect(sut.opacity).toBe(1);
    expect(sut.visible).toBe(true);
    expect(sut.current).toEqual([]);
    expect(sut.graphics).toEqual({});
  });

  it('can be constructed with optional params', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent({
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
    expect(sut.getGraphicNames()).toEqual(['some-gfx']);
    expect(sut.getGraphic('some-gfx')).toEqual(rect);
  });

  it('can implicitly copy graphics', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent({
      copyGraphics: true
    });
    const shownRect = sut.show(rect);
    expect(shownRect.id).not.toEqual(rect.id);
  });

  it('can show graphics', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent();

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
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent({
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
        options: {
          offset: ex.vec(0, 0),
          anchor: ex.vec(0.5, 0.5)
        }
      }
    ]);

    const none = sut.show('made-up-name');
    expect(none).toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });

  it('can swap all the graphics for a graphic', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const rect2 = new ex.Graphics.Rectangle({
      width: 50,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent();

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

    sut.swap(rect2);

    expect(sut.current).toEqual([
      {
        graphic: rect2,
        options: {
          offset: ex.vec(0, 0),
          anchor: ex.vec(0.5, 0.5)
        }
      }
    ]);
  });

  it('can hide graphics', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent();

    sut.show(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });
    sut.show(rect, { offset: ex.vec(-1, -2), anchor: ex.vec(0, 0) });

    sut.hide();

    expect(sut.current).toEqual([]);
  });

  it('can hide graphics by reference or name', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const rect2 = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent({
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
    const rect = new ex.Graphics.Rectangle({
      width: 10,
      height: 20
    });
    const sut = new ex.Graphics.GraphicsComponent();

    sut.add('some-graphic', rect);
    expect(sut.graphics['some-graphic']).toBe(rect);

    sut.add(rect);
    expect(sut.graphics.default).toBe(rect);
  });

  it('can have multiple layers', () => {
    const rect = new ex.Graphics.Rectangle({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent();

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
    const animation = new ex.Graphics.Animation({
      frames: []
    });
    spyOn(animation, 'tick');

    const sut = new ex.Graphics.GraphicsComponent();
    sut.add(animation);

    sut.update(123, 4);

    expect(animation.tick).toHaveBeenCalledWith(123, 4);
  });
});
