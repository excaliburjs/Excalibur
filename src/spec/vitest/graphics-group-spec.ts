import * as ex from '@excalibur';

describe('A Graphics Group', () => {
  it('exists', () => {
    expect(ex.GraphicsGroup).toBeDefined();
  });

  describe('@visual', () => {
    it('can be created and drawn', async () => {
      const rect1 = new ex.Rectangle({
        width: 25,
        height: 25,
        color: ex.Color.Blue
      });

      const rect2 = new ex.Rectangle({
        width: 25,
        height: 25,
        color: ex.Color.Yellow
      });

      const group = new ex.GraphicsGroup({
        members: [
          { offset: ex.vec(0, 0), graphic: rect1 },
          { offset: ex.vec(25, 25), graphic: rect2 }
        ]
      });

      expect(group.width).toBe(50);
      expect(group.height).toBe(50);
      expect(group.localBounds.width).toBe(50);
      expect(group.localBounds.height).toBe(50);

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      ctx.clear();
      group.draw(ctx, 25, 25);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/graphics-group-spec/graphics-group.png');
    });

    it('can be created and drawn without anchor', async () => {
      const rect1 = new ex.Rectangle({
        width: 25,
        height: 25,
        color: ex.Color.Blue
      });

      const rect2 = new ex.Rectangle({
        width: 25,
        height: 25,
        color: ex.Color.Yellow
      });

      const group = new ex.GraphicsGroup({
        useAnchor: false,
        members: [
          { offset: ex.vec(0, 0), graphic: rect1 },
          { offset: ex.vec(25, 25), graphic: rect2 }
        ]
      });

      expect(group.width).toBe(50);
      expect(group.height).toBe(50);
      expect(group.localBounds.width).toBe(50);
      expect(group.localBounds.height).toBe(50);

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      ctx.clear();
      group.draw(ctx, 100, 100);

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/graphics-group-spec/graphics-group-without-anchor.png');
    });
  });

  it('can be cloned', () => {
    const animation = new ex.Animation({
      frames: []
    });
    const group = new ex.GraphicsGroup({
      members: [{ offset: ex.vec(0, 0), graphic: animation }]
    });

    const clone = group.clone();
    expect(clone.members).toEqual(group.members);
  });

  it('will tick any graphics that need ticking in the group', () => {
    const animation = new ex.Animation({
      frames: []
    });
    vi.spyOn(animation, 'tick').mockImplementation(() => void 0);

    const group = new ex.GraphicsGroup({
      members: [{ offset: ex.vec(0, 0), graphic: animation }]
    });

    group.tick(100, 1234);
    expect(animation.tick).toHaveBeenCalledWith(100, 1234);
  });

  it('will tick any graphics that need reseting in the group', () => {
    const animation = new ex.Animation({
      frames: []
    });
    vi.spyOn(animation, 'reset').mockImplementation(() => void 0);

    const group = new ex.GraphicsGroup({
      members: [{ offset: ex.vec(0, 0), graphic: animation }]
    });

    group.reset();
    expect(animation.reset).toHaveBeenCalled();
  });
});
