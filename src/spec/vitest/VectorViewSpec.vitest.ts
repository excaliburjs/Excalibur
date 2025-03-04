import * as ex from '@excalibur';

describe('A VectorView', () => {
  it('exists', () => {
    expect(ex.VectorView).toBeDefined();
  });

  it('can be built', () => {
    const v = new ex.VectorView({
      getX: () => {
        return 42;
      },
      getY: () => {
        return 24;
      },
      setX: () => {
        // pass
      },
      setY: () => {
        // pass
      }
    });

    expect(v).toBeDefined();
    expect(v.x).toBe(42);
    expect(v.y).toBe(24);
  });

  it('can source data from an another place', () => {
    const data = [42, 24];
    const v = new ex.VectorView({
      getX: () => {
        return data[0];
      },
      getY: () => {
        return data[1];
      },
      setX: (x) => {
        data[0] = x;
      },
      setY: (y) => {
        data[1] = y;
      }
    });

    expect(v).toBeVector(ex.vec(42, 24));
    v.x = -1;
    v.y = 100;
    expect(v).toBeVector(ex.vec(-1, 100));
    expect(data[0]).toBe(-1);
    expect(data[1]).toBe(100);
  });
});
