import * as ex from '@excalibur';
import { ExcaliburAsyncMatchers } from 'excalibur-jasmine';

describe('Debug draw static', () => {
  beforeAll(() => {
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  it('exists', () => {
    expect(ex.Debug).toBeDefined();
  });
  beforeEach(() => {
    ex.Debug.clear();
  });

  afterEach(() => {
    ex.Debug.clear();
  });

  it('can draw a point', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    ex.Debug.drawPoint(ex.vec(5, 5), { size: 5, color: ex.Color.ExcaliburBlue });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/point.png');
    context.dispose();
  });

  it('can draw a line', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    ex.Debug.drawLine(ex.vec(0, 0), ex.vec(10, 10), { color: ex.Color.ExcaliburBlue });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/line.png');
    context.dispose();
  });

  it('can draw lines', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    ex.Debug.drawLines([ex.vec(0, 0), ex.vec(10, 10), ex.vec(10, 0), ex.vec(0, 10)], { color: ex.Color.ExcaliburBlue });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/lines.png');
    context.dispose();
  });

  xit('can draw text', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    ex.Debug.drawText('some text', ex.vec(0, 50));

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/text.png');
  });

  it('can draw a polygon', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    ex.Debug.drawPolygon([ex.vec(2, 2), ex.vec(8, 2), ex.vec(8, 8), ex.vec(2, 8)], { color: ex.Color.ExcaliburBlue });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/polygon.png');
    context.dispose();
  });

  it('can draw a circle', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    ex.Debug.drawCircle(ex.vec(5, 5), 5, { color: ex.Color.Transparent, strokeColor: ex.Color.ExcaliburBlue, width: 1 });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/circle.png');
    context.dispose();
  });

  it('can draw bounds', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    const bounds = new ex.BoundingBox({
      left: 3,
      right: 7,
      top: 3,
      bottom: 7
    });

    ex.Debug.drawBounds(bounds, { color: ex.Color.ExcaliburBlue });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/bounds.png');
    context.dispose();
  });

  it('can draw a ray', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Black
    });
    context.clear();

    const ray = new ex.Ray(ex.vec(0, 0), ex.vec(1, 1));

    ex.Debug.drawRay(ray, { distance: 4, color: ex.Color.ExcaliburBlue });

    ex.Debug.flush(context);
    context.flush();

    await expectAsync(canvas).toEqualImage('src/spec/images/DebugSpec/ray.png');
    context.dispose();
  });
});
