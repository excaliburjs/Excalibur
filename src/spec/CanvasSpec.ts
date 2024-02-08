import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('A Canvas Graphic', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  it('exists', () => {
    expect(ex.Canvas).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Canvas({
      width: 100,
      height: 100
    });
    expect(sut).toBeDefined();
  });

  it('can be cloned', () => {
    const sut = new ex.Canvas({
      width: 100,
      height: 100,
      draw: (ctx) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(25, 25, 50, 50);
      }
    });
    const clone = sut.clone();

    expect(sut.draw).toBe(clone.draw);
    expect(sut.width).toBe(clone.width);
    expect(sut.height).toBe(clone.height);
  });

  it('can be drawn using the 2d canvas api', async () => {
    const sut = new ex.Canvas({
      width: 100,
      height: 100,
      draw: (ctx) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(25, 25, 50, 50);
      }
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    sut.draw(ctx, 0, 0);

    await expectAsync(canvasElement).toEqualImage('src/spec/images/GraphicsCanvasSpec/draw.png');
  });

  it('can cache draws', () => {
    const sut = new ex.Canvas({
      width: 100,
      height: 100,
      cache: true,
      draw: (ctx) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(25, 25, 50, 50);
      }
    });

    spyOn(sut, 'execute').and.callThrough();

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);

    expect(sut.execute).toHaveBeenCalledTimes(1);
  });

  it('can redraw on each draws', () => {
    const sut = new ex.Canvas({
      width: 100,
      height: 100,
      cache: false,
      draw: (ctx) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(25, 25, 50, 50);
      }
    });

    spyOn(sut, 'execute').and.callThrough();

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);
    sut.draw(ctx, 0, 0);

    expect(sut.execute).toHaveBeenCalledTimes(4);
  });

  it('can be centered with the specified dimensions in an actor', async () => {
    const engine = TestUtils.engine({width: 100, height: 100});
    const clock = engine.clock as ex.TestClock;
    await TestUtils.runToReady(engine);
    const sut = new ex.Canvas({
      width: 50,
      height: 50,
      cache: true,
      draw: (ctx) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 50, 50);
      }
    });

    const actor = new ex.Actor({
      x: 50,
      y: 50
    });

    actor.graphics.use(sut);

    engine.add(actor);

    clock.step(1);

    expect(sut.width).toBe(50);
    expect(sut.height).toBe(50);
    await expectAsync(engine.canvas).toEqualImage('src/spec/images/GraphicsCanvasSpec/centered.png');

  });
});
