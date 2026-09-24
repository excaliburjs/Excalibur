import * as ex from '@excalibur';

describe('A BezierCurve', () => {
  it('exists', () => {
    expect(ex.BezierCurve).toBeDefined();
  });

  it('can be constructed with 4 control points', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });
    expect(curve).toBeDefined();
    expect(curve.controlPoints).toEqual([ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]);
  });

  it('throws if not given exactly 4 control points', () => {
    expect(() => {
      new ex.BezierCurve({
        controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100)] as any
      });
    }).toThrowError('Only cubic bezier curves are supported');
  });

  it('defaults quality to 4', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });
    expect(curve.quality).toBe(4);
  });

  it('can specify a quality', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)],
      quality: 10
    });
    expect(curve.quality).toBe(10);
  });

  it('returns the start point at time 0 and the end point at time 1', () => {
    const start = ex.vec(0, 0);
    const end = ex.vec(100, 0);
    const curve = new ex.BezierCurve({
      controlPoints: [start, ex.vec(0, 100), ex.vec(100, 100), end]
    });

    expect(curve.getPoint(0)).toBeVector(start);
    expect(curve.getPoint(1)).toBeVector(end);
  });

  it('has a positive arc length for a non-degenerate curve', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });

    expect(curve.arcLength).toBeGreaterThan(0);
  });

  it('has zero arc length when all control points are the same', () => {
    const same = ex.vec(50, 50);
    const curve = new ex.BezierCurve({
      controlPoints: [same, same, same, same]
    });

    expect(curve.arcLength).toBeCloseTo(0, 10);
  });

  it('can set an individual control point', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });
    const originalArcLength = curve.arcLength;

    curve.setControlPoint(3, ex.vec(1000, 1000));

    expect(curve.controlPoints[3]).toBeVector(ex.vec(1000, 1000));
    expect(curve.arcLength).not.toBe(originalArcLength);
  });

  it('recalculates when control points are reassigned', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });
    const originalArcLength = curve.arcLength;

    curve.controlPoints = [ex.vec(0, 0), ex.vec(0, 1000), ex.vec(1000, 1000), ex.vec(1000, 0)];

    expect(curve.arcLength).not.toBe(originalArcLength);
  });

  it('can get the tangent along the curve', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });

    const tangent = curve.getTangent(0.5);
    expect(tangent.magnitude).toBeCloseTo(1, 5);
  });

  it('can get the normal along the curve, perpendicular to the tangent', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });

    const tangent = curve.getTangent(0.5);
    const normal = curve.getNormal(0.5);
    expect(tangent.dot(normal)).toBeCloseTo(0, 5);
  });

  it('can get a uniformly distributed point, tangent, and normal along the curve', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)]
    });

    expect(curve.getUniformPoint(0)).toBeVector(curve.getPoint(0));
    expect(curve.getUniformPoint(1)).toBeVector(curve.getPoint(1));

    const uniformTangent = curve.getUniformTangent(0.5);
    expect(uniformTangent.magnitude).toBeCloseTo(1, 5);

    const uniformNormal = curve.getUniformNormal(0.5);
    expect(uniformTangent.dot(uniformNormal)).toBeCloseTo(0, 5);
  });

  it('can be cloned', () => {
    const curve = new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(0, 100), ex.vec(100, 100), ex.vec(100, 0)],
      quality: 8
    });

    const clone = curve.clone();

    expect(clone).not.toBe(curve);
    expect(clone.controlPoints).toEqual(curve.controlPoints);
    expect(clone.quality).toBe(curve.quality);
    expect(clone.arcLength).toBeCloseTo(curve.arcLength, 5);
  });
});
