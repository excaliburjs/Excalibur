import * as ex from '@excalibur';

describe('Lines', () => {
  it('exist', () => {
    expect(ex.LineSegment).toBeDefined();
  });

  it('can be constructed', () => {
    const line = new ex.LineSegment(new ex.Vector(1, -1), new ex.Vector(1, 1));
    expect(line).toBeTruthy();
  });

  it('can have a slope Vector', () => {
    const line = new ex.LineSegment(new ex.Vector(1, -1), new ex.Vector(1, 1));
    const slope = line.getSlope();

    expect(slope.equals(new ex.Vector(0, 1))).toBeTruthy();
  });

  it('can have a slope value of infinity', () => {
    const line = new ex.LineSegment(new ex.Vector(1, 0), new ex.Vector(1, 1));
    const slope = line.slope;

    expect(line.slope).toBe(Infinity);
  });

  it('can have a slope value of 0', () => {
    const line = new ex.LineSegment(new ex.Vector(1, 1), new ex.Vector(2, 1));
    const slope = line.slope;

    expect(line.slope).toBe(0);
  });

  it('can have a positive slope value', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(1, 1));

    expect(line.slope).toBe(1);
  });

  it('can have a negative slope value', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(-1, 1));

    expect(line.slope).toBe(-1);
  });

  it('can have a y intercept of infinity', () => {
    const line = new ex.LineSegment(new ex.Vector(1, 0), new ex.Vector(1, 1));

    expect(line.intercept).toBe(-Infinity);
  });

  it('can have a positive y intercept', () => {
    const line = new ex.LineSegment(new ex.Vector(1, 2), new ex.Vector(2, 2));

    expect(line.intercept).toBe(2);
  });

  it('can have a negative y intercept', () => {
    const line = new ex.LineSegment(new ex.Vector(1, 1), new ex.Vector(2, 2));

    expect(line.intercept).toBe(0);
  });

  it('can have a normal', () => {
    const line = new ex.LineSegment(new ex.Vector(1, 1), new ex.Vector(2, 1));

    const normal = line.normal();
    expect(normal.x).toBe(0);
    expect(normal.y).toBe(-1);
  });

  it('can have a length', () => {
    const line = new ex.LineSegment(new ex.Vector(1, -1), new ex.Vector(1, 1));
    expect(line.getLength()).toBe(2);
  });

  it('can find a point by X value', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.findPoint(1);

    expect(t.y).toBe(1);
  });

  it('can find a point by Y value', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.findPoint(null, 1);

    expect(t.x).toBe(1);
  });

  it('can calculate the perpendicular distance from a point', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(200, 0));
    const point = new ex.Vector(100, 100);
    expect(line.distanceToPoint(point)).toBe(100);
  });

  it('can calculate the perpendicular distance from a point not above the line', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(200, 0));
    const point = new ex.Vector(-100, 100);
    expect(line.distanceToPoint(point)).toBe(100);
  });

  it('can determine if point lies on the line by x and y', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(1, 1);

    expect(t).toBe(true);
  });

  it('can determine if point lies on the line by Vector', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(new ex.Vector(1, 1));

    expect(t).toBe(true);
  });

  it('can determine if point lies on the line by x and y with absolute precision', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(1.005, 1);

    expect(t).toBe(false);
  });

  it('can determine if point lies on the line by Vector with absolute precision', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(new ex.Vector(1.005, 1));

    expect(t).toBe(false);
  });

  it('can determine if point lies on the line by x and y at a certain threshold', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(1.005, 1, 0.1);

    expect(t).toBe(true);
  });

  it('can determine if point lies on the line by Vector at a certain threshold', () => {
    const line = new ex.LineSegment(new ex.Vector(0, 0), new ex.Vector(2, 2));
    const t = line.hasPoint(new ex.Vector(1.005, 1), 0.1);

    expect(t).toBe(true);
  });
});
