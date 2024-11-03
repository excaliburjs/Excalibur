import { LineSegment } from '../../Math/line-segment';
import { Vector, vec } from '../../Math/vector';
import { Collider } from './Collider';
import { CircleCollider } from './CircleCollider';
import { PolygonCollider } from './PolygonCollider';
import { AffineMatrix } from '../../Math/affine-matrix';
import { Pool } from '../../Util/Pool';

/**
 * Specific information about a contact and it's separation
 */
export class SeparationInfo {
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
  axis: Vector = vec(0, 0);

  /**
   * Local axis of separation from the collider's perspective
   */
  localAxis?: Vector = vec(0, 0);

  /**
   * Side of separation (reference) from the collider's perspective
   */

  side?: LineSegment = new LineSegment(vec(0, 0), vec(0, 0));

  /**
   * Local side of separation (reference) from the collider's perspective
   */
  localSide?: LineSegment = new LineSegment(vec(0, 0), vec(0, 0));

  /**
   * Index of the separation side (reference) from the collider's perspective
   */
  sideId?: number;

  /**
   * Point on collider B (incident point)
   */
  point: Vector = vec(0, 0);

  /**
   * Local point on collider B (incident point)
   */
  localPoint?: Vector = vec(0, 0);
}

export class SeparatingAxis {
  static SeparationPool = new Pool(
    () => new SeparationInfo(),
    (i) => i, // no recycle
    500
  );
  private static _ZERO = vec(0, 0);
  private static _SCRATCH_POINT = vec(0, 0);
  private static _SCRATCH_SUB_POINT = vec(0, 0);
  private static _SCRATCH_NORMAL = vec(0, 0);
  private static _SCRATCH_MATRIX = AffineMatrix.identity();
  static findPolygonPolygonSeparation(polyA: PolygonCollider, polyB: PolygonCollider): SeparationInfo {
    // if polyB has 0 scale we need to hop back to degenerate separation
    if (polyB.transform.matrix.determinant() === 0) {
      return SeparatingAxis.findPolygonPolygonSeparationDegenerate(polyA, polyB);
    }

    // Multi contact from SAT
    // https://gamedev.stackexchange.com/questions/111390/multiple-contacts-for-sat-collision-detection
    // do a SAT test to find a min axis if it exists

    let bestSeparation = -Number.MAX_VALUE;
    let bestSideIndex: number = -1;
    let localPoint: Vector;
    // Work inside polyB reference frame
    // inv polyB converts to local space from polyA world space
    const toPolyBSpace = polyB.transform.inverse.multiply(polyA.transform.matrix, SeparatingAxis._SCRATCH_MATRIX);
    const toPolyBSpaceRotation = toPolyBSpace.getRotation();

    const normalsA = polyA.normals;
    const pointsA = polyA.points;
    const pointsB = polyB.points;
    for (let pointsAIndex = 0; pointsAIndex < pointsA.length; pointsAIndex++) {
      const normal = normalsA[pointsAIndex].rotate(toPolyBSpaceRotation, SeparatingAxis._ZERO, SeparatingAxis._SCRATCH_NORMAL);
      const point = toPolyBSpace.multiply(pointsA[pointsAIndex], SeparatingAxis._SCRATCH_POINT);

      // For every point in polyB
      // We want to see how much overlap there is on the axis provided by the normal
      // We want to find the minimum overlap among all points
      let smallestPointDistance = Number.MAX_VALUE;
      let smallestLocalPoint: Vector;
      for (let pointsBIndex = 0; pointsBIndex < pointsB.length; pointsBIndex++) {
        const distance = normal.dot(pointsB[pointsBIndex].sub(point, SeparatingAxis._SCRATCH_SUB_POINT));
        if (distance < smallestPointDistance) {
          smallestPointDistance = distance;
          smallestLocalPoint = pointsB[pointsBIndex];
        }
      }

      // We take the maximum overlap as the separation between the
      // A negative separation means there were no gaps between the two shapes
      if (smallestPointDistance > bestSeparation) {
        bestSeparation = smallestPointDistance;
        bestSideIndex = pointsAIndex;
        localPoint = smallestLocalPoint;
      }
    }

    // TODO can we avoid applying world space transforms?
    const bestSide2 = (bestSideIndex + 1) % pointsA.length;
    const separationInfo = SeparatingAxis.SeparationPool.get();
    separationInfo.collider = polyA;
    separationInfo.separation = bestSeparation;
    if (bestSeparation > 0) {
      // early out because if separation is > 0 then no local point
      return separationInfo;
    }
    normalsA[bestSideIndex].clone(separationInfo.localAxis);
    normalsA[bestSideIndex].rotate(polyA.transform.rotation, SeparatingAxis._ZERO, separationInfo.axis);
    polyA.transform.matrix.multiply(pointsA[bestSideIndex], separationInfo.side.begin);
    polyA.transform.matrix.multiply(pointsA[bestSide2], separationInfo.side.end);
    polyB.transform.matrix.multiply(localPoint, separationInfo.point);
    separationInfo.sideId = bestSideIndex;
    localPoint.clone(separationInfo.localPoint);
    pointsA[bestSideIndex].clone(separationInfo.localSide.begin);
    pointsA[bestSide2].clone(separationInfo.localSide.end);
    return separationInfo;
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

  static findPolygonPolygonSeparationDegenerate(polyA: PolygonCollider, polyB: PolygonCollider): SeparationInfo {
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
}

SeparatingAxis.SeparationPool.disableWarnings = true;
