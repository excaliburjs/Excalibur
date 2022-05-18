import { LineSegment } from '../../Math/line-segment';
import { Vector } from '../../Math/vector';
import { Collider } from './Collider';
import { CircleCollider } from './CircleCollider';
import { PolygonCollider } from './PolygonCollider';

/**
 * Specific information about a contact and it's separation
 */
export interface SeparationInfo {
  /**
   * Collider A
   */
  collider: Collider;

  /**
   * Signed value (negative means overlap, positive no overlap)
   */
  separation: number;

  /**
   * Axis of separation from the collider's perspective
   */
  axis: Vector;

  /**
   * Side of separation (reference) from the collider's perspective
   */

  side?: LineSegment;

  /**
   * Local side of separation (reference) from the collider's perspective
   */
  localSide?: LineSegment;

  /**
   * Index of the separation side (reference) from the collider's perspective
   */
  sideId?: number;

  /**
   * Point on collider B (incident point)
   */
  point: Vector;

  /**
   * Local point on collider B (incident point)
   */
  localPoint?: Vector;
}

export class SeparatingAxis {
  static findPolygonPolygonSeparation(polyA: PolygonCollider, polyB: PolygonCollider): SeparationInfo {
    let bestSeparation = -Number.MAX_VALUE;
    let bestSide: LineSegment | null = null;
    let bestAxis: Vector | null = null;
    let bestSideIndex: number = -1;
    let bestOtherPoint: Vector | null = null;
    const sides = polyA.getSides();
    const localSides = polyA.getLocalSides();
    for (let i = 0; i < sides.length; i++) {
      const side = sides[i];
      const axis = side.normal();
      const vertB = polyB.getFurthestPoint(axis.negate());
      // Separation on side i's axis
      // We are looking for the largest separation between poly A's sides
      const vertSeparation = side.distanceToPoint(vertB, true);
      if (vertSeparation > bestSeparation) {
        bestSeparation = vertSeparation;
        bestSide = side;
        bestAxis = axis;
        bestSideIndex = i;
        bestOtherPoint = vertB;
      }
    }

    return {
      collider: polyA,
      separation: bestAxis ? bestSeparation : 99,
      axis: bestAxis as Vector,
      side: bestSide,
      localSide: localSides[bestSideIndex],
      sideId: bestSideIndex,
      point: bestOtherPoint as Vector,
      localPoint: bestAxis ? polyB.getFurthestLocalPoint(bestAxis!.negate()) : null
    };
  }

  static findCirclePolygonSeparation(circle: CircleCollider, polygon: PolygonCollider): Vector | null {
    const axes = polygon.axes;
    const pc = polygon.center;
    // Special SAT with circles
    const polyDir = pc.sub(circle.worldPos);
    const closestPointOnPoly = polygon.getFurthestPoint(polyDir.negate());
    axes.push(closestPointOnPoly.sub(circle.worldPos).normalize());

    let minOverlap = Number.MAX_VALUE;
    let minAxis = null;
    let minIndex = -1;
    for (let i = 0; i < axes.length; i++) {
      const proj1 = polygon.project(axes[i]);
      const proj2 = circle.project(axes[i]);
      const overlap = proj1.getOverlap(proj2);
      if (overlap <= 0) {
        return null;
      } else {
        if (overlap < minOverlap) {
          minOverlap = overlap;
          minAxis = axes[i];
          minIndex = i;
        }
      }
    }
    if (minIndex < 0) {
      return null;
    }
    return minAxis.normalize().scale(minOverlap);
  }
}
