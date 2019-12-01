import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('Vectors', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('should exists', () => {
    expect(ex.Vector).toBeDefined();
  });

  it('can be instantiated', () => {
    const v = new ex.Vector(20, 200);
    expect(v).not.toBeNull();
  });

  it('can have values set', () => {
    const v = new ex.Vector(20, 200);

    expect(v).toBeVector(new ex.Vector(20, 200));
    expect(v.x).toEqual(20);
    expect(v.y).toEqual(200);

    v.x = 200;
    v.y = 20;

    expect(v.x).toEqual(200);
    expect(v.y).toEqual(20);

    v.setTo(0, 0);

    expect(v.x).toEqual(0);
    expect(v.y).toEqual(0);
  });

  it('has a Zero constant', () => {
    expect(ex.Vector.Zero.x).toEqual(0);
    expect(ex.Vector.Zero.y).toEqual(0);
  });

  it('can test against equality within tolerance', () => {
    const v = new ex.Vector(20, 20);

    expect(v.equals(v.add(new ex.Vector(0.0005, 0.0005)))).toBeTruthy();
    expect(v.equals(ex.Vector.Zero)).not.toBeTruthy();
  });

  it('can be created from an angle', () => {
    const v = ex.Vector.fromAngle(Math.PI / 2);

    expect(v.equals(new ex.Vector(0, 1))).toBeTruthy();
  });

  it('can be transformed to an angle', () => {
    const target = Math.PI / 4;
    const v = ex.Vector.fromAngle(target);
    expect(v.toAngle()).toBeCloseTo(target, 4);
  });

  it('can calculate distance to origin', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(0, -20);

    expect(v.distance()).toBe(20);
    expect(v2.distance()).toBe(20);
  });

  // @obsolete v0.25.0
  it('can have a magnitude', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(0, -20);

    expect(v.magnitude()).toBe(20);
    expect(v2.magnitude()).toBe(20);
  });

  it('can have a size', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(0, -20);

    expect(v.size).toBe(20);
    expect(v2.size).toBe(20);
  });

  it('can have size set', () => {
    const v = new ex.Vector(20, 0);
    const v2 = new ex.Vector(3, 4);

    v.size = 10;
    v2.size = 13;

    expect(v.equals(new ex.Vector(10, 0))).toBeTruthy();
    expect(v2.equals(new ex.Vector(7.8, 10.4))).toBeTruthy();
  });

  it('can calculate the distance to another vector', () => {
    const v = new ex.Vector(-10, 0);
    const v2 = new ex.Vector(10, 0);
    expect(v.distance(v2)).toBe(20);
  });

  it('can calculate the distance between two vectors', () => {
    const v1 = new ex.Vector(-10, 0);
    const v2 = new ex.Vector(10, 0);
    expect(ex.Vector.distance(v1, v2)).toBe(20);
  });

  it('can be normalized to a length of 1', () => {
    const v = new ex.Vector(10, 0);

    expect(v.distance()).toBe(10);
    expect(v.normalize().distance()).toBe(1);
  });

  it('can be scaled', () => {
    const v = new ex.Vector(10, 0);

    expect(v.distance()).toBe(10);
    expect(v.scale(10).distance()).toBe(100);
  });

  it('can be added to another', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    expect(v.add(v2).equals(new ex.Vector(10, 10))).toBeTruthy();
  });

  it('can be subtracted from another', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    expect(v.sub(v2).equals(new ex.Vector(10, -10))).toBeTruthy();
  });

  it('can be added and set at the same time', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    v.addEqual(v2);

    expect(v.x).toBe(10);
    expect(v.y).toBe(10);
  });

  it('can be subtracted and set at the same time', () => {
    const v = new ex.Vector(10, 0);
    const v2 = new ex.Vector(0, 10);

    v.subEqual(v2);

    expect(v.x).toBe(10);
    expect(v.y).toBe(-10);
  });

  it('can be scaled and set at the same time', () => {
    const v = new ex.Vector(10, 0);

    v.scaleEqual(10);

    expect(v.x).toBe(100);
  });

  it('can be negated', () => {
    const v = new ex.Vector(10, 0);
    expect(v.negate().x).toBe(-10);
  });

  it('can be dotted with another 2d vector', () => {
    const v = new ex.Vector(1, 0);
    const v2 = new ex.Vector(-1, 0);

    // vectors in opposite directions are negative
    expect(v.dot(v2)).toBeLessThan(0);
    // vectors in the same direction are positive
    expect(v.dot(v2.negate())).toBeGreaterThan(0);
    // vectors that are perpendicular are zero
    expect(v.dot(v.perpendicular())).toBe(0);
    // dot product measures how close two vectors are to being parallel
    // the dot product of two vectors, where the second vector is at a
    // 45 degree angle to the first, should be cos(45) in the same direction.
    expect(v.dot(ex.Vector.fromAngle(Math.PI / 4))).toBe(Math.cos(Math.PI / 4));
  });

  it('can be rotated by an angle about the origin', () => {
    const v = new ex.Vector(1, 0);
    const rotated = v.rotate(Math.PI);
    expect(rotated.equals(new ex.Vector(-1, 0))).toBeTruthy();
  });

  it('can be rotated by an angle about a point', () => {
    const v = new ex.Vector(1, 0);
    const rotate = v.rotate(Math.PI, new ex.Vector(2, 0));
    expect(rotate.equals(new ex.Vector(3, 0))).toBeTruthy();
  });

  it('can be checked for validity on infinity vectors', () => {
    const invalidTest1 = new ex.Vector(Infinity, Infinity);
    const invalidTest2 = new ex.Vector(-Infinity, -Infinity);
    const invalidTest3 = new ex.Vector(Infinity, -Infinity);
    const invalidTest4 = new ex.Vector(-Infinity, Infinity);
    const oneComponentInvalidTest1 = new ex.Vector(Infinity, -2);
    const oneComponentInvalidTest2 = new ex.Vector(-Infinity, 2);
    const oneComponentInvalidTest3 = new ex.Vector(1, Infinity);
    const oneComponentInvalidTest4 = new ex.Vector(1, -Infinity);

    expect(ex.Vector.isValid(invalidTest1)).toBe(false, 'Infinity vectors should be invalid');
    expect(ex.Vector.isValid(invalidTest2)).toBe(false, 'Infinity vectors should be invalid');
    expect(ex.Vector.isValid(invalidTest3)).toBe(false, 'Infinity vectors should be invalid');
    expect(ex.Vector.isValid(invalidTest4)).toBe(false, 'Infinity vectors should be invalid');
    expect(ex.Vector.isValid(oneComponentInvalidTest1)).toBe(false, 'Infinity vectors with one component at +/-Infinity should be invalid');
    expect(ex.Vector.isValid(oneComponentInvalidTest2)).toBe(false, 'Infinity vectors with one component at +/-Infinity should be invalid');
    expect(ex.Vector.isValid(oneComponentInvalidTest3)).toBe(false, 'Infinity vectors with one component at +/-Infinity should be invalid');
    expect(ex.Vector.isValid(oneComponentInvalidTest4)).toBe(false, 'Infinity vectors with one component at +/-Infinity should be invalid');
  });

  it('can be checked for validity on NaN vectors', () => {
    const invalid = new ex.Vector(NaN, NaN);
    const oneComponentInvalid = new ex.Vector(NaN, 2);

    expect(ex.Vector.isValid(invalid)).toBe(false, 'NaN vectors should be invalid');
    expect(ex.Vector.isValid(oneComponentInvalid)).toBe(false, 'NaN vectors with one component should be invalid');
  });

  it('can be checked for validity on null or undefined vectors', () => {
    const invalidNull: ex.Vector = null;
    const invalidUndef: ex.Vector = undefined;

    expect(ex.Vector.isValid(invalidNull)).toBe(false, 'Null vectors should be invalid');
    expect(ex.Vector.isValid(invalidUndef)).toBe(false, 'undefined vectors should be invalid');
  });

  it('can be cloned', () => {
    const v = new ex.Vector(1, 0);
    const c = v.clone();

    expect(c.x).toBe(v.x);
    expect(c.y).toBe(v.y);

    v.setTo(20, 20);

    expect(c.x).not.toBe(v.x);
    expect(c.y).not.toBe(v.y);
  });
});

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
    const line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
    const intersection = ray.intersect(line);

    expect(intersection).toBeGreaterThan(0);

    const point = ray.getPoint(intersection);

    expect(point.equals(new ex.Vector(1, 0))).toBeTruthy();
  });
});

describe('Lines', () => {
  it('exist', () => {
    expect(ex.Line).toBeDefined();
  });

  it('can be constructed', () => {
    const line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
    expect(line).toBeTruthy();
  });

  it('can have a slope Vector', () => {
    const line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
    const slope = line.getSlope();

    expect(slope.equals(new ex.Vector(0, 1))).toBeTruthy();
  });

  it('can have a slope value of infinity', () => {
    const line = new ex.Line(new ex.Vector(1, 0), new ex.Vector(1, 1));
    const slope = line.slope;

    expect(line.slope).toBe(Infinity);
  });

  it('can have a slope value of 0', () => {
    const line = new ex.Line(new ex.Vector(1, 1), new ex.Vector(2, 1));
    const slope = line.slope;

    expect(line.slope).toBe(0);
  });

  it('can have a positive slope value', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(1, 1));

    expect(line.slope).toBe(1);
  });

  it('can have a negative slope value', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(-1, 1));

    expect(line.slope).toBe(-1);
  });

  it('can have a y intercept of infinity', () => {
    const line = new ex.Line(new ex.Vector(1, 0), new ex.Vector(1, 1));

    expect(line.intercept).toBe(-Infinity);
  });

  it('can have a positive y intercept', () => {
    const line = new ex.Line(new ex.Vector(1, 2), new ex.Vector(2, 2));

    expect(line.intercept).toBe(2);
  });

  it('can have a negative y intercept', () => {
    const line = new ex.Line(new ex.Vector(1, 1), new ex.Vector(2, 2));

    expect(line.intercept).toBe(0);
  });

  it('can have a normal', () => {
    const line = new ex.Line(new ex.Vector(1, 1), new ex.Vector(2, 1));

    const normal = line.normal();
    expect(normal.x).toBe(0);
    expect(normal.y).toBe(-1);
  });

  it('can have a length', () => {
    const line = new ex.Line(new ex.Vector(1, -1), new ex.Vector(1, 1));
    expect(line.getLength()).toBe(2);
  });

  it('can find a point by X value', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.findPoint(1);

    expect(t.y).toBe(1);
  });

  it('can find a point by Y value', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.findPoint(null, 1);

    expect(t.x).toBe(1);
  });

  it('can calculate the perpendicular distance from a point', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(200, 0));
    const point = new ex.Vector(100, 100);
    expect(line.distanceToPoint(point)).toBe(100);
  });

  it('can calculate the perpendicular distance from a point not above the line', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(200, 0));
    const point = new ex.Vector(-100, 100);
    expect(line.distanceToPoint(point)).toBe(100);
  });

  it('can determine if point lies on the line by x and y', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(1, 1);

    expect(t).toBe(true);
  });

  it('can determine if point lies on the line by Vector', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(new ex.Vector(1, 1));

    expect(t).toBe(true);
  });

  it('can determine if point lies on the line by x and y with absolute precision', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(1.005, 1);

    expect(t).toBe(false);
  });

  it('can determine if point lies on the line by Vector with absolute precision', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(new ex.Vector(1.005, 1));

    expect(t).toBe(false);
  });

  it('can determine if point lies on the line by x and y at a certain threshold', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(1.005, 1, 0.1);

    expect(t).toBe(true);
  });

  it('can determine if point lies on the line by Vector at a certain threshold', () => {
    const line = new ex.Line(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(new ex.Vector(1.005, 1), 0.1);

    expect(t).toBe(true);
  });
});

describe('Projections', () => {
  it('exists', () => {
    expect(ex.Projection).toBeDefined();
  });

  it('can be constructed', () => {
    const proj = new ex.Projection(5, 10);
    expect(proj).toBeTruthy();
  });

  it('can detect overlap between projections', () => {
    const proj = new ex.Projection(5, 10);
    const proj2 = new ex.Projection(7, 12);
    expect(proj.getOverlap(proj2)).toBe(3);
  });

  it('can detect overlap between projections across zero', () => {
    const proj = new ex.Projection(-5, 2);
    const proj2 = new ex.Projection(-2, 5);
    expect(proj.getOverlap(proj2)).toBe(4);
  });

  it('can detect no overlap between projections', () => {
    const proj = new ex.Projection(5, 10);
    const proj2 = new ex.Projection(10, 12);
    expect(proj.getOverlap(proj2)).toBe(0);
  });

  it('can detect no overlap between projections with separation', () => {
    const proj = new ex.Projection(5, 10);
    const proj2 = new ex.Projection(11, 12);
    expect(proj.getOverlap(proj2)).toBe(0);
  });
});

describe('helpers', () => {
  describe('vec', () => {
    it('returns a new Vector instance on each call', () => {
      const vector1 = ex.vec(1, 0);
      const vector2 = ex.vec(1, 0);
      const vector3 = ex.vec(NaN, Number.NEGATIVE_INFINITY);
      expect(vector1 instanceof ex.Vector).toBe(true);
      expect(vector2 instanceof ex.Vector).toBe(true);
      expect(vector3 instanceof ex.Vector).toBe(true);
      expect(vector1).not.toBe(vector2);
    });

    it('returns a Vector instance with the specified properties', () => {
      const [x, y] = [Date.now(), Math.random()];
      const vector = ex.vec(x, y);
      expect(vector.x).toBe(x);
      expect(vector.y).toBe(y);
    });
  });
});
