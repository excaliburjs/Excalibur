import { CircleCollider } from './circle-collider';
import { CollisionContact } from '../detection/collision-contact';
import { PolygonCollider } from './polygon-collider';
import { EdgeCollider } from './edge-collider';
import type { SeparationInfo } from './separating-axis';
import { SeparatingAxis } from './separating-axis';
import type { SatShape } from './separating-axis';
import type { Collider } from './collider';
import { Vector } from '../../math/vector';
import { TransformComponent } from '../../entity-component-system';
import { AffineMatrix } from '../../math/affine-matrix';
import type { Transform } from '../../math/transform';
const ScratchZero = Vector.Zero; // TODO constant vector

/**
 * Direct component access, skips accessor dispatch in hot loops
 */
type UnsafeVector = { _x: number; _y: number };

/**
 * Scratch segment for contact clipping
 */
const ClipScratch = { x0: 0, y0: 0, x1: 0, y1: 0 };

/**
 * Clips the segment in {@link ClipScratch} against the half plane `dir . p - length <= 0` in place.
 *
 * Mirrors {@apilink LineSegment.clip} with an unnormalized direction, without allocating
 * @returns false when fewer than 2 points survive (no segment)
 */
function clipScratchSegment(dirX: number, dirY: number, length: number): boolean {
  const s = ClipScratch;
  const near = dirX * s.x0 + dirY * s.y0 - length;
  const far = dirX * s.x1 + dirY * s.y1 - length;
  let count = 0;
  let ax = 0;
  let ay = 0;
  let bx = 0;
  let by = 0;
  if (near <= 0) {
    ax = s.x0;
    ay = s.y0;
    count++;
  }
  if (far <= 0) {
    if (count === 0) {
      ax = s.x1;
      ay = s.y1;
    } else {
      bx = s.x1;
      by = s.y1;
    }
    count++;
  }
  if (near * far < 0) {
    const t = near / (near - far);
    const ix = s.x0 + (s.x1 - s.x0) * t;
    const iy = s.y0 + (s.y1 - s.y0) * t;
    if (count === 0) {
      ax = ix;
      ay = iy;
    } else {
      bx = ix;
      by = iy;
    }
    count++;
  }
  if (count !== 2) {
    return false;
  }
  s.x0 = ax;
  s.y0 = ay;
  s.x1 = bx;
  s.y1 = by;
  return true;
}
const ScratchNormal = Vector.Zero; // TODO constant vector
const ScratchMatrix = AffineMatrix.identity();

export const CollisionJumpTable = {
  CollideCircleCircle(circleA: CircleCollider, circleB: CircleCollider): CollisionContact[] {
    const circleAPos = circleA.worldPos;
    const circleBPos = circleB.worldPos;
    const combinedRadius = circleA.radius + circleB.radius;
    const distance = circleAPos.distance(circleBPos);

    if (distance > combinedRadius) {
      return [];
    }

    // negative means overlap
    const separation = combinedRadius - distance;

    // Normal points from A -> B
    const normal = circleBPos.sub(circleAPos).normalize();
    const tangent = normal.perpendicular();
    const mvt = normal.scale(separation);

    const point = circleA.getFurthestPoint(normal);
    const local = circleA.getFurthestLocalPoint(normal);

    const info: SeparationInfo = {
      collider: circleA,
      separation,
      axis: normal,
      point: point
    };

    return [new CollisionContact(circleA, circleB, mvt, normal, tangent, [point], [local], info)];
  },

  CollideCirclePolygon(circle: CircleCollider, polygon: PolygonCollider): CollisionContact[] {
    let minAxis = SeparatingAxis.findCirclePolygonSeparation(circle, polygon);
    if (!minAxis) {
      return [];
    }

    // make sure that the minAxis is pointing away from circle
    const sameDir = minAxis.dot(polygon.center.sub(circle.center));
    minAxis = sameDir < 0 ? minAxis.negate() : minAxis;

    const point = circle.getFurthestPoint(minAxis);
    const xf = circle.owner?.get(TransformComponent) ?? new TransformComponent();
    const local = xf.applyInverse(point);
    const normal = minAxis.normalize();

    const info: SeparationInfo = {
      collider: circle,
      separation: -minAxis.magnitude,
      axis: normal,
      point: point,
      localPoint: local,
      side: polygon.findSide(normal.negate()),
      localSide: polygon.findLocalSide(normal.negate())
    };

    return [new CollisionContact(circle, polygon, minAxis, normal, normal.perpendicular(), [point], [local], info)];
  },

  CollideCircleEdge(circle: CircleCollider, edge: EdgeCollider): CollisionContact[] {
    // TODO not sure this actually abides by local/world collisions
    // Are edge.begin and edge.end local space or world space? I think they should be local

    // center of the circle in world pos
    const cc = circle.center;
    // vector in the direction of the edge
    const edgeWorld = edge.asLine();
    const e = edgeWorld.end.sub(edgeWorld.begin);

    // amount of overlap with the circle's center along the edge direction
    const u = e.dot(edgeWorld.end.sub(cc));
    const v = e.dot(cc.sub(edgeWorld.begin));
    const side = edge.asLine();
    const localSide = edge.asLocalLine();

    // Potential region A collision (circle is on the left side of the edge, before the beginning)
    if (v <= 0) {
      const da = edgeWorld.begin.sub(cc);
      const dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
      // save some sqrts
      if (dda > circle.radius * circle.radius) {
        return []; // no collision
      }

      const normal = da.normalize();
      const separation = circle.radius - Math.sqrt(dda);

      const info: SeparationInfo = {
        collider: circle,
        separation: separation,
        axis: normal,
        point: side.begin,
        side: side,
        localSide: localSide
      };

      return [
        new CollisionContact(circle, edge, normal.scale(separation), normal, normal.perpendicular(), [side.begin], [localSide.begin], info)
      ];
    }

    // Potential region B collision (circle is on the right side of the edge, after the end)
    if (u <= 0) {
      const db = edgeWorld.end.sub(cc);
      const ddb = db.dot(db);
      if (ddb > circle.radius * circle.radius) {
        return [];
      }

      const normal = db.normalize();
      const separation = circle.radius - Math.sqrt(ddb);

      const info: SeparationInfo = {
        collider: circle,
        separation: separation,
        axis: normal,
        point: side.end,
        side: side,
        localSide: localSide
      };

      return [
        new CollisionContact(circle, edge, normal.scale(separation), normal, normal.perpendicular(), [side.end], [localSide.end], info)
      ];
    }

    // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
    const den = e.dot(e);
    const pointOnEdge = edgeWorld.begin
      .scale(u)
      .add(edgeWorld.end.scale(v))
      .scale(1 / den);
    const d = cc.sub(pointOnEdge);

    const dd = d.dot(d);
    if (dd > circle.radius * circle.radius) {
      return []; // no collision
    }

    let normal = e.perpendicular();
    // flip correct direction
    if (normal.dot(cc.sub(edgeWorld.begin)) < 0) {
      normal.x = -normal.x;
      normal.y = -normal.y;
    }

    normal = normal.normalize();
    const separation = circle.radius - Math.sqrt(dd);

    const mvt = normal.scale(separation);
    const info: SeparationInfo = {
      collider: circle,
      separation: separation,
      axis: normal,
      point: pointOnEdge,
      side: side,
      localSide: localSide
    };

    return [
      new CollisionContact(
        circle,
        edge,
        mvt,
        normal.negate(),
        normal.negate().perpendicular(),
        [pointOnEdge],
        [pointOnEdge.sub(edge.worldPos)],
        info
      )
    ];
  },

  CollideEdgeEdge(): CollisionContact[] {
    // Edge-edge collision doesn't make sense
    return [];
  },

  CollidePolygonEdge(polygon: PolygonCollider, edge: EdgeCollider): CollisionContact[] {
    // An edge is a two-sided, two point convex shape, the polygon SAT + clipping handles it directly
    return this.CollidePolygonPolygon(polygon, edge);
  },

  CollidePolygonPolygon(polyA: SatShape, polyB: SatShape): CollisionContact[] {
    const colliderA = polyA as unknown as Collider;
    const colliderB = polyB as unknown as Collider;
    // Multi contact from SAT
    // https://gamedev.stackexchange.com/questions/111390/multiple-contacts-for-sat-collision-detection
    // do a SAT test to find a min axis if it exists
    const separationA = SeparatingAxis.findPolygonPolygonSeparation(polyA, polyB);

    // If there is no overlap from boxA's perspective we can end early
    if (separationA.separation > 0) {
      return [];
    }

    const separationB = SeparatingAxis.findPolygonPolygonSeparation(polyB, polyA);
    // If there is no overlap from boxB's perspective exit now
    if (separationB.separation > 0) {
      return [];
    }

    // Separations are both negative, we want to pick the least negative (minimal movement)
    const separation = separationA.separation > separationB.separation ? separationA : separationB;

    // The incident side is the most opposite from the axes of collision on the other collider
    const other = separation.collider === colliderA ? polyB : polyA;
    const main = separation.collider === colliderA ? polyA : polyB;

    const toIncidentFrame = other.transform.inverse.multiply(main.transform.matrix, ScratchMatrix);
    const toIncidentFrameRotation = toIncidentFrame.getRotation();
    const referenceEdgeNormal = main.normals[separation!.sideId!].rotate(toIncidentFrameRotation, ScratchZero, ScratchNormal);
    let minEdge = Number.MAX_VALUE;
    let incidentEdgeIndex = 0;
    for (let i = 0; i < other.normals.length; i++) {
      const value = referenceEdgeNormal.dot(other.normals[i]);
      if (value < minEdge) {
        minEdge = value;
        incidentEdgeIndex = i;
      }
    }

    // FIXME temporary to prevent a crash, invalid separation
    if (!separation.localSide || !separation.localAxis || !separation.axis) {
      return [];
    }

    // Clip incident side by the perpendicular lines at each end of the reference side
    // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
    // Done in scalars on scratch state, this runs for every contact every substep so it must not allocate
    const m = toIncidentFrame.data;
    const localBegin = separation.localSide.begin as unknown as UnsafeVector;
    const localEnd = separation.localSide.end as unknown as UnsafeVector;
    // reference side in the incident frame
    const refBeginX = m[0] * localBegin._x + m[2] * localBegin._y + m[4];
    const refBeginY = m[1] * localBegin._x + m[3] * localBegin._y + m[5];
    const refEndX = m[0] * localEnd._x + m[2] * localEnd._y + m[4];
    const refEndY = m[1] * localEnd._x + m[3] * localEnd._y + m[5];
    // reference direction = localAxis.perpendicular().negate() = (-axis.y, axis.x), rotated into the incident frame
    const localAxis = separation.localAxis as unknown as UnsafeVector;
    const cos = Math.cos(toIncidentFrameRotation);
    const sin = Math.sin(toIncidentFrameRotation);
    const refDirX = -localAxis._y * cos - localAxis._x * sin;
    const refDirY = -localAxis._y * sin + localAxis._x * cos;

    const incidentPoints = other.points;
    const incidentBegin = incidentPoints[incidentEdgeIndex] as unknown as UnsafeVector;
    const incidentEnd = incidentPoints[(incidentEdgeIndex + 1) % incidentPoints.length] as unknown as UnsafeVector;
    const clip = ClipScratch;
    clip.x0 = incidentBegin._x;
    clip.y0 = incidentBegin._y;
    clip.x1 = incidentEnd._x;
    clip.y1 = incidentEnd._y;
    // right plane at the reference begin, then left plane at the reference end
    if (!clipScratchSegment(-refDirX, -refDirY, -(refDirX * refBeginX + refDirY * refBeginY))) {
      return [];
    }
    if (!clipScratchSegment(refDirX, refDirY, refDirX * refEndX + refDirY * refEndY)) {
      return [];
    }

    // Keep the clipped points that are below (penetrating) the reference side, same test as LineSegment.below
    const localPoints: Vector[] = [];
    const points: Vector[] = [];
    const om = other.transform.matrix.data;
    const refDX = refEndX - refBeginX;
    const refDY = refEndY - refBeginY;
    for (let i = 0; i < 2; i++) {
      const cx = i === 0 ? clip.x0 : clip.x1;
      const cy = i === 0 ? clip.y0 : clip.y1;
      if (refDX * (cy - refBeginY) - refDY * (cx - refBeginX) >= 0) {
        localPoints.push(new Vector(cx, cy));
        points.push(new Vector(om[0] * cx + om[2] * cy + om[4], om[1] * cx + om[3] * cy + om[5]));
      }
    }

    // separation.axis lives in the pooled SeparationInfo, copy it so the contact owns its normal
    let normal = separation.axis.clone();
    // Point Contact A -> B
    const centerA = polyA.center;
    const centerB = polyB.center;
    if ((centerB.x - centerA.x) * normal.x + (centerB.y - centerA.y) * normal.y < 0) {
      normal = normal.negate();
    }
    const tangent = normal.perpendicular();
    return [
      new CollisionContact(colliderA, colliderB, normal.scale(-separation.separation), normal, tangent, points, localPoints, separation)
    ];
  },

  FindContactSeparation(contact: CollisionContact, localPoint: Vector): number {
    const shapeA = contact.colliderA;
    const txA = contact.bodyA?.transform ?? new TransformComponent();
    const shapeB = contact.colliderB;
    const txB = contact.bodyB?.transform ?? new TransformComponent();

    // both are circles
    if (shapeA instanceof CircleCollider && shapeB instanceof CircleCollider) {
      const combinedRadius = shapeA.radius + shapeB.radius;
      const distance = txA.pos.distance(txB.pos);
      const separation = combinedRadius - distance;
      return -separation;
    }

    // both are polygons
    if (shapeA instanceof PolygonCollider && shapeB instanceof PolygonCollider) {
      type UnsafeTransformAccess = { _transform: Transform };
      type UnsafeVectorAccess = { _x: number; _y: number };
      if (contact.info.localSide) {
        // inlined below
        // let side;
        // let worldPoint;
        let sideMatrix;
        let sideOffset;
        let pointMatrix;
        let pointOffset;
        if (contact.info.collider === shapeA) {
          // inlined below
          // side = new LineSegment(txA.apply(contact.info.localSide.begin).add(shapeA.offset), txA.apply(contact.info.localSide.end).add(shapeA.offset));
          // worldPoint = txB.apply(localPoint).add(shapeB.offset);
          sideMatrix = (txA as unknown as UnsafeTransformAccess)._transform.matrix.data;
          sideOffset = shapeA.offset;
          pointMatrix = (txB as unknown as UnsafeTransformAccess)._transform.matrix.data;
          pointOffset = shapeB.offset;
        } else {
          // inlined below
          // side = new LineSegment(txB.apply(contact.info.localSide.begin).add(shapeB.offset), txB.apply(contact.info.localSide.end).add(shapeB.offset));
          // worldPoint = txA.apply(localPoint).add(shapeA.offset);
          sideMatrix = (txB as unknown as UnsafeTransformAccess)._transform.matrix.data;
          sideOffset = shapeB.offset;
          pointMatrix = (txA as unknown as UnsafeTransformAccess)._transform.matrix.data;
          pointOffset = shapeA.offset;
        }
        // inlined below
        // return side.distanceToPoint(worldPoint, true);
        const _localSide = contact.info.localSide;
        const _localBegin = _localSide.begin;
        const _localEnd = _localSide.end;
        const _sideBeginX =
          sideMatrix[0] * (_localBegin as unknown as UnsafeVectorAccess)._x +
          sideMatrix[2] * (_localBegin as unknown as UnsafeVectorAccess)._y +
          sideMatrix[4] +
          (sideOffset as unknown as UnsafeVectorAccess)._x;

        const _sideBeginY =
          sideMatrix[1] * (_localBegin as unknown as UnsafeVectorAccess)._x +
          sideMatrix[3] * (_localBegin as unknown as UnsafeVectorAccess)._y +
          sideMatrix[5] +
          (sideOffset as unknown as UnsafeVectorAccess)._y;

        const _sideEndX =
          sideMatrix[0] * (_localEnd as unknown as UnsafeVectorAccess)._x +
          sideMatrix[2] * (_localEnd as unknown as UnsafeVectorAccess)._y +
          sideMatrix[4] +
          (sideOffset as unknown as UnsafeVectorAccess)._x;

        const _sideEndY =
          sideMatrix[1] * (_localEnd as unknown as UnsafeVectorAccess)._x +
          sideMatrix[3] * (_localEnd as unknown as UnsafeVectorAccess)._y +
          sideMatrix[5] +
          (sideOffset as unknown as UnsafeVectorAccess)._y;

        const _worldPointX =
          pointMatrix[0] * (localPoint as unknown as UnsafeVectorAccess)._x +
          pointMatrix[2] * (localPoint as unknown as UnsafeVectorAccess)._y +
          pointMatrix[4] +
          (pointOffset as unknown as UnsafeVectorAccess)._x;

        const _worldPointY =
          pointMatrix[1] * (localPoint as unknown as UnsafeVectorAccess)._x +
          pointMatrix[3] * (localPoint as unknown as UnsafeVectorAccess)._y +
          pointMatrix[5] +
          (pointOffset as unknown as UnsafeVectorAccess)._y;

        const _dx = _sideEndX - _sideBeginX;
        const _dy = _sideEndY - _sideBeginY;
        const _l = Math.sqrt(_dx * _dx + _dy * _dy);
        return (_dy * _worldPointX - _dx * _worldPointY + _sideEndX * _sideBeginY - _sideEndY * _sideBeginX) / _l;
      }
    }

    // polygon v circle
    if (
      (shapeA instanceof PolygonCollider && shapeB instanceof CircleCollider) ||
      (shapeB instanceof PolygonCollider && shapeA instanceof CircleCollider)
    ) {
      const worldPoint = txA.apply(localPoint);
      if (contact.info.side) {
        return contact.info.side.distanceToPoint(worldPoint, true);
      }
    }

    // polygon v edge
    if (
      (shapeA instanceof EdgeCollider && shapeB instanceof PolygonCollider) ||
      (shapeB instanceof EdgeCollider && shapeA instanceof PolygonCollider)
    ) {
      let worldPoint: Vector;
      if (contact.info.collider === shapeA) {
        worldPoint = txB.apply(localPoint);
      } else {
        worldPoint = txA.apply(localPoint);
      }
      if (contact.info.side) {
        return contact.info.side.distanceToPoint(worldPoint, true);
      }
    }

    // circle v edge
    if (
      (shapeA instanceof CircleCollider && shapeB instanceof EdgeCollider) ||
      (shapeB instanceof CircleCollider && shapeA instanceof EdgeCollider)
    ) {
      // Local point is always on the edge which is always shapeB
      const worldPoint = txB.apply(localPoint);

      let circlePoint: Vector;
      if (shapeA instanceof CircleCollider) {
        circlePoint = shapeA.getFurthestPoint(contact.normal);
      }

      const dist = worldPoint.distance(circlePoint!);

      if (contact.info.side) {
        return dist > 0 ? -dist : 0;
      }
    }

    return 0;
  }
};
