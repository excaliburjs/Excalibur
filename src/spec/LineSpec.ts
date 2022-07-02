import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
describe('A Line', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });
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
      end: ex.vec(50, 70),
      color: ex.Color.Green,
      thickness: 5
    });

    expect(sut.width).toBe(50);
    expect(sut.height).toBe(70);
  });

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

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(canvasElement)).toEqualImage('src/spec/images/LineSpec/line.png');
  });

  it('can draw a line when added to a graphics component', async () => {
    const game = TestUtils.engine({
      width: 100,
      height: 100,
      backgroundColor: ex.Color.ExcaliburBlue
    });

    const testClock = game.clock as ex.TestClock;

    TestUtils.runToReady(game);

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

    await expectAsync(TestUtils.flushWebGLCanvasTo2D(game.canvas)).toEqualImage('src/spec/images/LineSpec/line.png');

  });
});