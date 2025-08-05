import * as ex from '@excalibur';

describe('Rays', () => {
  it('exists', () => {
    expect(ex.Ray).toBeDefined();
  });

  it('can be constructed', () => {
    const ray = new ex.Ray(ex.Vector.Zero.clone(), new ex.Vector(1, 0));
    expect(ray).toBeTruthy();
    expect(ray.dir.equals(new ex.Vector(1, 0)));
  });

  it('can intersect with lines', () => {
    const ray = new ex.Ray(ex.Vector.Zero.clone(), new ex.Vector(1, 0));
    const line = new ex.LineSegment(new ex.Vector(1, -1), new ex.Vector(1, 1));
    const intersection = ray.intersect(line);

    expect(intersection).toBeGreaterThan(0);

    const point = ray.getPoint(intersection);

    expect(point.equals(new ex.Vector(1, 0))).toBeTruthy();
  });
});
