import { LineSegment } from '../../math/line-segment';
import type { Vector } from '../../math/vector';
import { vec } from '../../math/vector';
import type { Collider } from './collider';
import type { CircleCollider } from './circle-collider';
import type { PolygonCollider } from './polygon-collider';
import { AffineMatrix } from '../../math/affine-matrix';
import { ArenaPool } from '../../util/arena-pool';
import type { SatShape } from './sat-shape';
export type { SatShape } from './sat-shape';

const HASH_RANGE = 1 << 25;
/**
 * Upper bound on remembered separating axes, the cache is only an optimization so it is simply cleared when exceeded
 */
const SEPARATION_CACHE_MAX_ENTRIES = 10_000;

/**
 * Deep copies separation info out of the per frame {@apilink SeparatingAxis.SeparationPool} so it can outlive the frame
 * @param info
 */
export function cloneSeparationInfo(info: SeparationInfo): SeparationInfo {
  const copy = new SeparationInfo();
  copy.collider = info.collider;
  copy.separation = info.separation;
  copy.axis = info.axis ? info.axis.clone() : copy.axis;
  copy.localAxis = info.localAxis ? info.localAxis.clone() : undefined;
  copy.side = info.side ? new LineSegment(info.side.begin.clone(), info.side.end.clone()) : undefined;
  copy.localSide = info.localSide ? new LineSegment(info.localSide.begin.clone(), info.localSide.end.clone()) : undefined;
  copy.sideId = info.sideId;
  copy.point = info.point ? info.point.clone() : copy.point;
  copy.localPoint = info.localPoint ? info.localPoint.clone() : undefined;
  return copy;
}

function isPolygonCollider(shape: SatShape): shape is PolygonCollider {
  return typeof (shape as PolygonCollider).getLocalSides === 'function';
}

/**
 * Specific information about a contact and it's separation
 */
export class SeparationInfo {
  /**
   * Collider A
   */
  collider!: Collider;

  /**
   * Signed value (negative means overlap, positive no overlap)
   */
  separation!: number;

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
  static SeparationPool = new ArenaPool(
    () => new SeparationInfo(),
    (i) => i, // no recycle
    500
  );
  private static _ZERO = vec(0, 0);
  // inlined
  // private static _SCRATCH_POINT = vec(0, 0);
  // private static _SCRATCH_SUB_POINT = vec(0, 0);
  // private static _SCRATCH_NORMAL = vec(0, 0);

  private static _SCRATCH_MATRIX = AffineMatrix.identity();

  // warming trick to start with the last separating axis, take advantage of frame->frame coherency
  // usually the separating axis doesnt change allowing us to save work on non-colliding pairs
  private static _SEPARATION_CACHE = new Map();

  static findPolygonPolygonSeparation(polyA: SatShape, polyB: SatShape): SeparationInfo {
    const matrixA = polyA.transform.matrix;
    const matrixB = polyB.transform.matrix;

    // if polyB has 0 scale we need to hop back to degenerate separation
    if (matrixB.determinant() === 0 && isPolygonCollider(polyA) && isPolygonCollider(polyB)) {
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
    const toPolyBSpace = polyB.transform.inverse.multiply(matrixA, SeparatingAxis._SCRATCH_MATRIX);

    // inlined below
    // const toPolyBSpaceRotation = toPolyBSpace.getRotation();
    const polyBSpaceData = toPolyBSpace.data;
    const rotDiff = polyA.transform.globalRotation - polyB.transform.globalRotation;
    const _cos = Math.cos(rotDiff);
    const _sin = Math.sin(rotDiff);
    // end inline

    const normalsA = polyA.normals;
    const pointsA = polyA.points;
    const pointsB = polyB.points;

    type UnsafeVectorAccess = { _x: number; _y: number };

    // check warm separation cache first
    const _pairKey = polyA.id.value * HASH_RANGE + polyB.id.value; // power of 2 hash trick
    const _cachedAxis = SeparatingAxis._SEPARATION_CACHE.get(_pairKey);
    if (_cachedAxis !== undefined && _cachedAxis < normalsA.length) {
      const normalA = normalsA[_cachedAxis];
      const _normalX = (normalA as unknown as UnsafeVectorAccess)._x * _cos - (normalA as unknown as UnsafeVectorAccess)._y * _sin;
      const _normalY = (normalA as unknown as UnsafeVectorAccess)._x * _sin + (normalA as unknown as UnsafeVectorAccess)._y * _cos;
      const _pointA = pointsA[_cachedAxis];
      // matrix x vector -> vector
      const _pointX =
        polyBSpaceData[0] * (_pointA as unknown as UnsafeVectorAccess)._x +
        polyBSpaceData[2] * (_pointA as unknown as UnsafeVectorAccess)._y +
        polyBSpaceData[4];
      const _pointY =
        polyBSpaceData[1] * (_pointA as unknown as UnsafeVectorAccess)._x +
        polyBSpaceData[3] * (_pointA as unknown as UnsafeVectorAccess)._y +
        polyBSpaceData[5];

      let smallestPointDistance = Number.MAX_VALUE;
      for (let pointsBIndex = 0; pointsBIndex < pointsB.length; pointsBIndex++) {
        const _pointB = pointsB[pointsBIndex];
        const distance =
          _normalX * ((_pointB as unknown as UnsafeVectorAccess)._x - _pointX) +
          _normalY * ((_pointB as unknown as UnsafeVectorAccess)._y - _pointY);

        if (distance < smallestPointDistance) {
          smallestPointDistance = distance;
        }
      }
      if (smallestPointDistance > 0) {
        const separationInfo = SeparatingAxis.SeparationPool.get();
        separationInfo.collider = polyA as unknown as Collider;
        separationInfo.separation = smallestPointDistance;
        return separationInfo;
      }
    }

    // check for real separation
    for (let pointsAIndex = 0; pointsAIndex < pointsA.length; pointsAIndex++) {
      // inlined below for speed
      // const normal = normalsA[pointsAIndex].rotate(toPolyBSpaceRotation, SeparatingAxis._ZERO, SeparatingAxis._SCRATCH_NORMAL);
      // const point = toPolyBSpace.multiply(pointsA[pointsAIndex], SeparatingAxis._SCRATCH_POINT);
      const normalA = normalsA[pointsAIndex];
      const _normalX = (normalA as unknown as UnsafeVectorAccess)._x * _cos - (normalA as unknown as UnsafeVectorAccess)._y * _sin;
      const _normalY = (normalA as unknown as UnsafeVectorAccess)._x * _sin + (normalA as unknown as UnsafeVectorAccess)._y * _cos;
      const _pointA = pointsA[pointsAIndex];
      // matrix x vector -> vector
      const _pointX =
        polyBSpaceData[0] * (_pointA as unknown as UnsafeVectorAccess)._x +
        polyBSpaceData[2] * (_pointA as unknown as UnsafeVectorAccess)._y +
        polyBSpaceData[4];
      const _pointY =
        polyBSpaceData[1] * (_pointA as unknown as UnsafeVectorAccess)._x +
        polyBSpaceData[3] * (_pointA as unknown as UnsafeVectorAccess)._y +
        polyBSpaceData[5];
      // end inline

      // For every point in polyB
      // We want to see how much overlap there is on the axis provided by the normal
      // We want to find the minimum overlap among all points
      let smallestPointDistance = Number.MAX_VALUE;
      let smallestLocalPoint: Vector;
      for (let pointsBIndex = 0; pointsBIndex < pointsB.length; pointsBIndex++) {
        // inlined below for speed
        // const distance = normal.dot(pointsB[pointsBIndex].sub(point, SeparatingAxis._SCRATCH_SUB_POINT));
        const _pointB = pointsB[pointsBIndex];
        const distance =
          _normalX * ((_pointB as unknown as UnsafeVectorAccess)._x - _pointX) +
          _normalY * ((_pointB as unknown as UnsafeVectorAccess)._y - _pointY);
        // end inline

        if (distance < smallestPointDistance) {
          smallestPointDistance = distance;
          smallestLocalPoint = _pointB;
        }
      }

      // Early out there is a POSITIVE separating axis so a gap (no overlap)
      if (smallestPointDistance > 0) {
        const separationInfo = SeparatingAxis.SeparationPool.get();
        separationInfo.collider = polyA as unknown as Collider;
        separationInfo.separation = smallestPointDistance;
        return separationInfo;
      }

      // We take the maximum overlap as the separation between the
      // A negative separation means there were no gaps between the two shapes
      if (smallestPointDistance > bestSeparation) {
        bestSeparation = smallestPointDistance;
        bestSideIndex = pointsAIndex;
        localPoint = smallestLocalPoint!;
      }
    }

    // TODO can we avoid applying world space transforms?
    const bestSide2 = (bestSideIndex + 1) % pointsA.length;
    const separationInfo = SeparatingAxis.SeparationPool.get();
    separationInfo.collider = polyA as unknown as Collider;
    separationInfo.separation = bestSeparation;
    if (bestSeparation > 0) {
      // early out because if separation is > 0 then no local point
      return separationInfo;
    }
    normalsA[bestSideIndex].clone(separationInfo.localAxis);
    normalsA[bestSideIndex].rotate(polyA.transform.globalRotation, SeparatingAxis._ZERO, separationInfo.axis);
    // inlined
    // polyA.transform.matrix.multiply(pointsA[bestSideIndex], separationInfo.side!.begin);
    // polyA.transform.matrix.multiply(pointsA[bestSide2], separationInfo.side!.end);
    // polyB.transform.matrix.multiply(localPoint!, separationInfo.point);

    matrixA.multiply(pointsA[bestSideIndex], separationInfo.side!.begin);
    matrixA.multiply(pointsA[bestSide2], separationInfo.side!.end);
    matrixB.multiply(localPoint!, separationInfo.point);
    // end inline
    //
    separationInfo.sideId = bestSideIndex;
    if (SeparatingAxis._SEPARATION_CACHE.size >= SEPARATION_CACHE_MAX_ENTRIES) {
      SeparatingAxis._SEPARATION_CACHE.clear();
    }
    SeparatingAxis._SEPARATION_CACHE.set(_pairKey, bestSideIndex);
    localPoint!.clone(separationInfo.localPoint);
    pointsA[bestSideIndex].clone(separationInfo.localSide!.begin);
    pointsA[bestSide2].clone(separationInfo.localSide!.end);

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
    return minAxis!.normalize().scale(minOverlap);
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
      side: bestSide!,
      localSide: localSides[bestSideIndex],
      sideId: bestSideIndex,
      point: bestOtherPoint as Vector,
      localPoint: (bestAxis ? polyB.getFurthestLocalPoint(bestAxis!.negate()) : null) as Vector
    };
  }
}

SeparatingAxis.SeparationPool.disableWarnings = true;
