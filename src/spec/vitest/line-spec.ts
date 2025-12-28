import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A Line', () => {
  it('exists', () => {
    expect(ex.Line).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Line({
      start: ex.vec(0, 0),
      end: ex.vec(50, 70)
    });

    expect(sut.start).toBeVector(ex.vec(0, 0));
    expect(sut.end).toBeVector(ex.vec(50, 70));
    expect(sut.color).toEqual(ex.Color.Black);
    expect(sut.thickness).toBe(1);
  });

  it('can be cloned', () => {
    const sut = new ex.Line({
      start: ex.vec(0, 0),
      end: ex.vec(50, 70),
      color: ex.Color.Green,
      thickness: 5
    });

    const clone = sut.clone();

    expect(clone.start).toBeVector(ex.vec(0, 0));
    expect(clone.end).toBeVector(ex.vec(50, 70));
    expect(clone.color).toEqual(ex.Color.Green);
    expect(clone.thickness).toBe(5);
  });

  it('has correct local bounds', () => {
    const sut = new ex.Line({
      start: ex.vec(0, 0),
      end: ex.vec(50, 50),
      color: ex.Color.Green,
      thickness: 5
    });

    expect(sut.localBounds.left).toBeCloseTo(-1.767, 2);
    expect(sut.localBounds.top).toBeCloseTo(-1.767, 2);
    expect(sut.localBounds.bottom).toBeCloseTo(51.767, 2);
    expect(sut.localBounds.right).toBeCloseTo(51.767, 2);

    expect(sut.width).toBeCloseTo(53.535, 2);
    expect(sut.height).toBeCloseTo(53.535, 2);
  });

  it('has correct bounds when horizontal', () => {
    const sut = new ex.Line({
      start: ex.vec(0, 0),
      end: ex.vec(1000, 0),
      thickness: 4
    });

    expect(sut.localBounds.left).toBe(0);
    expect(sut.localBounds.top).toBe(-2);
    expect(sut.localBounds.bottom).toBe(2);
    expect(sut.localBounds.right).toBe(1000);

    expect(sut.width).toBe(1000);
    expect(sut.height).toBe(4);
  });

  describe('@visual', () => {
    it('can draw a line', async () => {
      const sut = new ex.Line({
        start: ex.vec(0, 0),
        end: ex.vec(50, 50),
        color: ex.Color.Green,
        thickness: 5
      });

      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContextWebGL({ canvasElement, snapToPixel: false });

      ctx.clear();
      sut.draw(ctx, 0, 0);
      ctx.flush();

      await expect(canvasElement).toEqualImage('/src/spec/assets/images/LineSpec/line.png');
    });

    it('can draw a line when added to a graphics component', async () => {
      const game = TestUtils.engine({
        width: 100,
        height: 100,
        backgroundColor: ex.Color.ExcaliburBlue
      });

      const testClock = game.clock as ex.TestClock;

      await TestUtils.runToReady(game);

      const sut = new ex.Line({
        start: ex.vec(0, 0),
        end: ex.vec(50, 50),
        color: ex.Color.Green,
        thickness: 5
      });

      const actor = new ex.Actor({
        pos: ex.vec(0, 0)
      });
      actor.graphics.anchor = ex.Vector.Zero;
      actor.graphics.use(sut);
      game.add(actor);

      testClock.step(16);

      await expect(game.canvas).toEqualImage('/src/spec/assets/images/LineSpec/line.png');

      game.dispose();
    });
  });
});
