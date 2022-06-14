import { Vector } from './vector';

/**
 * A 2D line segment
 */

export class LineSegment {

  /**
   * @param begin  The starting point of the line segment
   * @param end  The ending point of the line segment
   */
  constructor(public readonly begin: Vector, public readonly end: Vector) {}

  /**
   * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
   */
  public get slope() {
    return (this.end.y - this.begin.y) / (this.end.x - this.begin.x);
  }

  /**
   * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
   */
  public get intercept() {
    return this.begin.y - this.slope * this.begin.x;
  }

  private _normal: Vector;
  /**
   * Gets the normal of the line
   */
  public normal(): Vector {
    if (this._normal) {
      return this._normal;
    }
    return this._normal = this.end.sub(this.begin).normal();
  }

  private _dir: Vector;
  public dir(): Vector {
    if (this._dir) {
      return this._dir;
    }
    return this._dir = this.end.sub(this.begin);
  }

  public getPoints(): Vector[] {
    return [this.begin, this.end];
  }

  private _slope: Vector;
  /**
   * Returns the slope of the line in the form of a vector of length 1
   */
  public getSlope(): Vector {
    if (this._slope) {
      return this._slope;
    }
    const begin = this.begin;
    const end = this.end;
    const distance = begin.distance(end);
    return this._slope = end.sub(begin).scale(1 / distance);
  }

  /**
   * Returns the edge of the line as vector, the length of the vector is the length of the edge
   */
  public getEdge(): Vector {
    const begin = this.begin;
    const end = this.end;
    return end.sub(begin);
  }

  private _length: number;
  /**
   * Returns the length of the line segment in pixels
   */
  public getLength(): number {
    if (this._length) {
      return this._length;
    }
    const begin = this.begin;
    const end = this.end;
    const distance = begin.distance(end);
    return this._length = distance;
  }

  /**
   * Returns the midpoint of the edge
   */
  public get midpoint(): Vector {
    return this.begin.add(this.end).scale(0.5);
  }

  /**
   * Flips the direction of the line segment
   */
  public flip(): LineSegment {
    return new LineSegment(this.end, this.begin);
  }

  /**
   * Tests if a given point is below the line, points in the normal direction above the line are considered above.
   * @param point
   */
  public below(point: Vector): boolean {
    const above2 = (this.end.x - this.begin.x) * (point.y - this.begin.y) - (this.end.y - this.begin.y) * (point.x - this.begin.x);
    return above2 >= 0;
  }

  /**
   * Returns the clip point
   * @param sideVector Vector that traces the line
   * @param length Length to clip along side
   */
  public clip(sideVector: Vector, length: number): LineSegment {
    let dir = sideVector;
    dir = dir.normalize();

    const near = dir.dot(this.begin) - length;
    const far = dir.dot(this.end) - length;

    const results = [];
    if (near <= 0) {
      results.push(this.begin);
    }
    if (far <= 0) {
      results.push(this.end);
    }

    if (near * far < 0) {
      const clipTime = near / (near - far);
      results.push(this.begin.add(this.end.sub(this.begin).scale(clipTime)));
    }
    if (results.length !== 2) {
      return null;
    }

    return new LineSegment(results[0], results[1]);
  }

  /**
   * Find the perpendicular distance from the line to a point
   * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
   * @param point
   */
  public distanceToPoint(point: Vector, signed: boolean = false) {
    const x0 = point.x;
    const y0 = point.y;

    const l = this.getLength();

    const dy = this.end.y - this.begin.y;
    const dx = this.end.x - this.begin.x;
    const distance = (dy * x0 - dx * y0 + this.end.x * this.begin.y - this.end.y * this.begin.x) / l;
    return signed ? distance : Math.abs(distance);
  }

  /**
   * Find the perpendicular line from the line to a point
   * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
   * (a - p) - ((a - p) * n)n
   * a is a point on the line
   * p is the arbitrary point above the line
   * n is a unit vector in direction of the line
   * @param point
   */
  public findVectorToPoint(point: Vector): Vector {
    const aMinusP = this.begin.sub(point);
    const n = this.getSlope();

    return aMinusP.sub(n.scale(aMinusP.dot(n)));
  }

  /**
   * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
   * a new point with the calculated Y value and vice-versa.
   *
   * @param x The known X value of the target point
   * @param y The known Y value of the target point
   * @returns A new point with the other calculated axis value
   */
  public findPoint(x: number = null, y: number = null): Vector {
    const m = this.slope;
    const b = this.intercept;

    if (x !== null) {
      return new Vector(x, m * x + b);
    } else if (y !== null) {
      return new Vector((y - b) / m, y);
    } else {
      throw new Error('You must provide an X or a Y value');
    }
  }

  /**
   * Whether or not the given point lies on this line. This method is precise by default
   * meaning the point must lie exactly on the line. Adjust threshold to
   * loosen the strictness of the check for floating-point calculations.
   */
  public hasPoint(x: number, y: number, threshold?: number): boolean;

  /**
   * Whether or not the given point lies on this line. This method is precise by default
   * meaning the point must lie exactly on the line. Adjust threshold to
   * loosen the strictness of the check for floating-point calculations.
   */
  public hasPoint(v: Vector, threshold?: number): boolean;

  /**
   * @see http://stackoverflow.com/a/11908158/109458
   */
  public hasPoint(): boolean {
    let currPoint: Vector;
    let threshold = 0;

    if (typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
      currPoint = new Vector(arguments[0], arguments[1]);
      threshold = arguments[2] || 0;
    } else if (arguments[0] instanceof Vector) {
      currPoint = arguments[0];
      threshold = arguments[1] || 0;
    } else {
      throw 'Could not determine the arguments for Vector.hasPoint';
    }

    const dxc = currPoint.x - this.begin.x;
    const dyc = currPoint.y - this.begin.y;

    const dx1 = this.end.x - this.begin.x;
    const dy1 = this.end.y - this.begin.y;

    const cross = dxc * dy1 - dyc * dx1;

    // check whether point lines on the line
    if (Math.abs(cross) > threshold) {
      return false;
    }

    // check whether point lies in-between start and end
    if (Math.abs(dx1) >= Math.abs(dy1)) {
      return dx1 > 0 ? this.begin.x <= currPoint.x && currPoint.x <= this.end.x : this.end.x <= currPoint.x && currPoint.x <= this.begin.x;
    } else {
      return dy1 > 0 ? this.begin.y <= currPoint.y && currPoint.y <= this.end.y : this.end.y <= currPoint.y && currPoint.y <= this.begin.y;
    }
  }
}
