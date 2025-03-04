import * as ex from '@excalibur';

describe('A BezierCurve', () => {
  it('exists', () => {
    expect(ex.BezierCurve).toBeDefined();
  });

  it('only supports cubic', () => {
    const throws = () => {
      const curve = new ex.BezierCurve({ controlPoints: [] as any });
    };
    expect(throws).toThrowError('Only cubic bezier curves are supported');
  });

  it('can build a cubic bezier curve', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(100, 100), ex.vec(0, 200), ex.vec(0, -200), ex.vec(800, 0)]
    });

    expect(curve.getPoint(0)).toBeVector(ex.vec(100, 100));
    expect(curve.getPoint(0.5)).toBeVector(ex.vec(112.5, 12.5));
    expect(curve.getNormal(0.5)).toBeVector(ex.vec(-0.5812, -0.8137));
    expect(curve.getTangent(0.5)).toBeVector(ex.vec(0.8137, -0.5812));
    expect(curve.getPoint(1)).toBeVector(ex.vec(800, 0));

    expect(curve.getUniformPoint(0)).toBeVector(ex.vec(100, 100));
    expect(curve.getUniformPoint(0.5)).toBeVector(ex.vec(366.77, -56.17));
    expect(curve.getUniformNormal(0.5)).toBeVector(ex.vec(-0.0375, -0.9992));
    expect(curve.getUniformTangent(0.5)).toBeVector(ex.vec(0.9992, -0.0375));
    expect(curve.getUniformPoint(1)).toBeVector(ex.vec(800, 0));
  });

  it('can get and set control points', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(100, 100), ex.vec(0, 200), ex.vec(0, -200), ex.vec(800, 0)]
    });

    expect(curve.controlPoints).toEqual([ex.vec(100, 100), ex.vec(0, 200), ex.vec(0, -200), ex.vec(800, 0)]);

    curve.setControlPoint(2, ex.vec(99, 99));

    expect(curve.controlPoints).toEqual([ex.vec(100, 100), ex.vec(0, 200), ex.vec(99, 99), ex.vec(800, 0)]);

    curve.controlPoints = [ex.vec(0, 100), ex.vec(0, 200), ex.vec(0, -200), ex.vec(0, 0)];

    expect(curve.controlPoints).toEqual([ex.vec(0, 100), ex.vec(0, 200), ex.vec(0, -200), ex.vec(0, 0)]);
  });

  it('can be cloned', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(100, 100), ex.vec(0, 200), ex.vec(0, -200), ex.vec(800, 0)],
      quality: 12
    });

    const clone = curve.clone();

    expect(clone).toEqual(curve);
  });
});
