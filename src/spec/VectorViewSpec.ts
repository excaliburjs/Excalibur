import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A VectorView', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('exists', () => {
    expect(ex.VectorView).toBeDefined();
  });

  it('can be built', () => {
    const v = new ex.VectorView({
      data: null,
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
      data: data,
      getX: (source) => {
        return source[0];
      },
      getY: (source) => {
        return source[1];
      },
      setX: (source, x) => {
        source[0] = x;
      },
      setY: (source, y) => {
        source[1] = y;
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