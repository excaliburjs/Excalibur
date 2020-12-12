import * as ex from '@excalibur';
import { ensureImagesLoaded, ExcaliburMatchers } from 'excalibur-jasmine';

xdescribe('A Graphics Group', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.Graphics.GraphicsGroup).toBeDefined();
  });

  it('can be created and drawn', async () => {
    const rect1 = new ex.Graphics.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Blue
    });

    const rect2 = new ex.Graphics.Rectangle({
      width: 25,
      height: 25,
      color: ex.Color.Yellow
    });

    const group = new ex.Graphics.GraphicsGroup({
      members: [
        { pos: ex.vec(0, 0), graphic: rect1 },
        { pos: ex.vec(25, 25), graphic: rect2 }
      ]
    });

    expect(group.width).toBe(50);
    expect(group.height).toBe(50);
    expect(group.localBounds.width).toBe(50);
    expect(group.localBounds.height).toBe(50);

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.Graphics.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    group.draw(ctx, 25, 25);

    const [actual, image] = await ensureImagesLoaded(canvasElement, 'src/spec/images/GraphicsGroupSpec/graphics-group.png');

    expect(actual).toEqualImage(image);
  });

  it('can be cloned', () => {
    const animation = new ex.Graphics.Animation({
      frames: []
    });
    const group = new ex.Graphics.GraphicsGroup({
      members: [{ pos: ex.vec(0, 0), graphic: animation }]
    });

    const clone = group.clone();
    expect(clone.members).toEqual(group.members);
  });

  it('will tick any graphics that need ticking in the group', () => {
    const animation = new ex.Graphics.Animation({
      frames: []
    });
    spyOn(animation, 'tick').and.callFake((elapsed, idempot) => {
      // fake
    });

    const group = new ex.Graphics.GraphicsGroup({
      members: [{ pos: ex.vec(0, 0), graphic: animation }]
    });

    group.tick(100, 1234);
    expect(animation.tick).toHaveBeenCalledWith(100, 1234);
  });

  it('will tick any graphics that need reseting in the group', () => {
    const animation = new ex.Graphics.Animation({
      frames: []
    });
    spyOn(animation, 'reset').and.callFake(() => {
      // fake
    });

    const group = new ex.Graphics.GraphicsGroup({
      members: [{ pos: ex.vec(0, 0), graphic: animation }]
    });

    group.reset();
    expect(animation.reset).toHaveBeenCalled();
  });

  it('does not have a source', () => {
    const animation = new ex.Graphics.Animation({
      frames: []
    });
    const group = new ex.Graphics.GraphicsGroup({
      members: [{ pos: ex.vec(0, 0), graphic: animation }]
    });
    expect(group.getSourceId()).toBe(-1);
    expect(group.getSource()).toBe(null);
  });
});
