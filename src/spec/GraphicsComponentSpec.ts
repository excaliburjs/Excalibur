import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A Graphics ECS Component', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
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
    const rect = new ex.Graphics.Rect({
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
      shareGraphics: false,
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
    const rect = new ex.Graphics.Rect({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent({
      shareGraphics: false
    });
    const shownRect = sut.show(rect);
    expect(shownRect.id).not.toEqual(rect.id);
  });

  it('can show graphics', () => {
    const rect = new ex.Graphics.Rect({
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

  it('can swap all the graphics for a graphic', () => {
    const rect = new ex.Graphics.Rect({
      width: 40,
      height: 40
    });
    const rect2 = new ex.Graphics.Rect({
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
    const rect = new ex.Graphics.Rect({
      width: 40,
      height: 40
    });
    const sut = new ex.Graphics.GraphicsComponent();

    sut.show(rect, { offset: ex.vec(1, 2), anchor: ex.vec(1, 1) });
    sut.show(rect, { offset: ex.vec(-1, -2), anchor: ex.vec(0, 0) });

    sut.hide();

    expect(sut.current).toEqual([]);
  });

  it('can have multiple layers', () => {
    const rect = new ex.Graphics.Rect({
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
});
