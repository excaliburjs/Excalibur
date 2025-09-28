import * as ex from '@excalibur';

describe('A Circle Graphic', () => {
  it('exists', () => {
    expect(ex.Circle).toBeDefined();
  });

  it('has default padding', () => {
    const sut = new ex.Circle({
      radius: 10
    });
    expect(sut.padding).toBe(2);
    expect(sut.width).toBe(24);
    expect(sut.height).toBe(24);
  });

  it('has default filtering', () => {
    const sut = new ex.Circle({
      radius: 10
    });
    expect(sut.filtering).toBe(ex.ImageFiltering.Blended);
  });

  it('can have a radius', () => {
    const sut = new ex.Circle({
      padding: 0,
      radius: 10
    });
    expect(sut.radius).toBe(10);
    expect(sut.width).toBe(20);
    expect(sut.height).toBe(20);
  });

  it('@visual can set a color', async () => {
    const sut = new ex.Circle({
      radius: 10,
      padding: 0,
      color: ex.Color.Green,
      strokeColor: ex.Color.Black
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 50, 50);

    await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsCircleSpec/circle.png');
  });

  it('@visual can set a lineWidth', async () => {
    const sut = new ex.Circle({
      radius: 30,
      lineWidth: 15,
      color: ex.Color.Green,
      strokeColor: ex.Color.Black
    });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

    ctx.clear();
    sut.draw(ctx, 0, 0);

    await expect(canvasElement).toEqualImage('/src/spec/assets/images/GraphicsCircleSpec/line-width.png');
  });

  it('can be cloned', () => {
    const sut = new ex.Circle({
      radius: 10,
      color: ex.Color.Green,
      strokeColor: ex.Color.Black
    });

    const clone = sut.clone();

    expect(clone.radius).toBe(10);
    expect(clone.color).toEqual(ex.Color.Green);
    expect(clone.strokeColor).toEqual(ex.Color.Black);
  });
});
