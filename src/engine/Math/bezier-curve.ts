import { lerpVector, remap } from './lerp';
import { Vector } from './vector';

export interface BezierCurveOptions {
  /**
   * [start, control1, control2, end]
   */
  controlPoints: [start: Vector, control1: Vector, control2: Vector, end: Vector];
  /**
   * Quality when sampling uniform points on the curve. Samples = 4 * quality;
   *
   * For bigger 'uniform' curves you may want to increase quality
   *
   * Default 4
   */
  quality?: number;
}

/**
 * BezierCurve that supports cubic Bezier curves.
 */
export class BezierCurve {
  // Thanks Freya! https://www.youtube.com/watch?v=aVwxzDHniEw
  private _distLookup: number[] = [];
  private _controlPoints: [Vector, Vector, Vector, Vector];
  private _arcLength: number;
  readonly quality: number = 4;
  constructor(options: BezierCurveOptions) {
    if (options.controlPoints.length !== 4) {
      throw new Error('Only cubic bezier curves are supported');
    }
    this._controlPoints = [...options.controlPoints];
    this.quality = options.quality ?? this.quality;

    this._calculateLookup();
  }

  public get arcLength(): number {
    return this._arcLength;
  }

  public get controlPoints(): readonly [start: Vector, control1: Vector, control2: Vector, end: Vector] {
    return this._controlPoints;
  }

  public set controlPoints(points: [start: Vector, control1: Vector, control2: Vector, end: Vector]) {
    this._controlPoints = [...points];
    this._calculateLookup();
  }

  setControlPoint(index: 0 | 1 | 2 | 3, point: Vector) {
    this._controlPoints[index] = point;
    this._calculateLookup();
  }

  private _calculateLookup() {
    let totalLength = 0;
    this._distLookup.length = 0;
    let prev = this.controlPoints[0];
    const n = this.controlPoints.length * this.quality;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const pt = this.getPoint(t);
      const diff = prev.distance(pt);
      totalLength += diff;
      this._distLookup.push(totalLength);
      prev = pt;
    }
    this._arcLength = totalLength;
  }

  private _getTimeGivenDistance(distance: number): number {
    const n = this._distLookup.length;
    const arcLength = this.arcLength;

    if (distance >= 0 && distance < arcLength) {
      for (let i = 0; i < n - 1; i++) {
        if (this._distLookup[i] <= distance && distance < this._distLookup[i + 1]) {
          return remap(this._distLookup[i], this._distLookup[i + 1], i / (n - 1), (i + 1) / (n - 1), distance);
        }
      }
    }
    return distance / arcLength;
  }

  /**
   * Get the point on the Bezier curve at a certain time
   * @param time Between 0-1
   */
  getPoint(time: number): Vector {
    const points = [...this.controlPoints];

    for (let r = 1; r < points.length; r++) {
      for (let i = 0; i < points.length - r; i++) {
        points[i] = lerpVector(points[i], points[i + 1], time);
      }
    }

    return points[0];
  }

  /**
   * Get the tangent of the Bezier curve at a certain time
   * @param time Between 0-1
   */
  getTangent(time: number): Vector {
    const timeSquared = time * time;
    const p0 = this.controlPoints[0];
    const p1 = this.controlPoints[1];
    const p2 = this.controlPoints[2];
    const p3 = this.controlPoints[3];

    // Derivative of Bernstein polynomial
    const pPrime = p0
      .scale(-3 * timeSquared + 6 * time - 3)
      .add(p1.scale(9 * timeSquared - 12 * time + 3).add(p2.scale(-9 * timeSquared + 6 * time).add(p3.scale(3 * timeSquared))));

    return pPrime.normalize();
  }

  /**
   * Get the tangent of the Bezier curve where the distance is uniformly distributed over time
   * @param time
   */
  getUniformTangent(time: number): Vector {
    const desiredDistance = time * this.arcLength;
    const uniformTime = this._getTimeGivenDistance(desiredDistance);
    return this.getTangent(uniformTime);
  }

  /**
   * Get the normal of the Bezier curve at a certain time
   * @param time Between 0-1
   */
  getNormal(time: number): Vector {
    return this.getTangent(time).normal();
  }

  /**
   * Get the normal of the Bezier curve where the distance is uniformly distributed over time
   * @param time
   */
  getUniformNormal(time: number): Vector {
    return this.getUniformTangent(time).normal();
  }

  /**
   * Points are spaced uniformly across the length of the curve over time
   * @param time
   */
  getUniformPoint(time: number): Vector {
    const desiredDistance = time * this.arcLength;
    const uniformTime = this._getTimeGivenDistance(desiredDistance);
    return this.getPoint(uniformTime);
  }

  clone(): BezierCurve {
    return new BezierCurve({
      controlPoints: [...this.controlPoints],
      quality: this.quality
    });
  }
}
