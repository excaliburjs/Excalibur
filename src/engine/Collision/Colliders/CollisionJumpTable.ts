import { CircleCollider } from './CircleCollider';
import { CollisionContact } from '../Detection/CollisionContact';
import { PolygonCollider } from './PolygonCollider';
import { EdgeCollider } from './EdgeCollider';
import { SeparatingAxis, SeparationInfo } from './SeparatingAxis';
import { LineSegment } from '../../Math/line-segment';
import { Vector } from '../../Math/vector';
import { TransformComponent } from '../../EntityComponentSystem';
import { Pair } from '../Detection/Pair';
import { AffineMatrix } from '../../Math/affine-matrix';
const ScratchZero = Vector.Zero; // TODO constant vector
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
    const pc = polygon.center;
    const ec = edge.center;
    const dir = ec.sub(pc).normalize();

    // build a temporary polygon from the edge to use SAT
    const linePoly = new PolygonCollider({
      points: [edge.begin, edge.end, edge.end.add(dir.scale(100)), edge.begin.add(dir.scale(100))],
      offset: edge.offset
    });
    linePoly.owner = edge.owner;
    const tx = edge.owner?.get(TransformComponent);
    if (tx) {
      linePoly.update(edge.owner.get(TransformComponent).get());
    }
    // Gross hack but poly-poly works well
    const contact = this.CollidePolygonPolygon(polygon, linePoly);
    if (contact.length) {
      // Fudge the contact back to edge
      contact[0].colliderB = edge;
      (contact[0].id as any) = Pair.calculatePairHash(polygon.id, edge.id);
    }
    return contact;
  },

  CollidePolygonPolygon(polyA: PolygonCollider, polyB: PolygonCollider): CollisionContact[] {
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
    const other = separation.collider === polyA ? polyB : polyA;
    const main = separation.collider === polyA ? polyA : polyB;

    const toIncidentFrame = other.transform.inverse.multiply(main.transform.matrix, ScratchMatrix);
    const toIncidentFrameRotation = toIncidentFrame.getRotation();
    const referenceEdgeNormal = main.normals[separation.sideId].rotate(toIncidentFrameRotation, ScratchZero, ScratchNormal);
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
    const referenceSide = separation.localSide.transform(toIncidentFrame);
    const referenceDirection = separation.localAxis.perpendicular().negate().rotate(toIncidentFrameRotation);

    const incidentSide = new LineSegment(other.points[incidentEdgeIndex], other.points[(incidentEdgeIndex + 1) % other.points.length]);
    const clipRight = incidentSide.clip(referenceDirection.negate(), -referenceDirection.dot(referenceSide.begin), false);
    let clipLeft: LineSegment | null = null;
    if (clipRight) {
      clipLeft = clipRight.clip(referenceDirection, referenceDirection.dot(referenceSide.end), false);
    }

    if (clipLeft) {
      const localPoints: Vector[] = [];
      const points: Vector[] = [];
      const clipPoints = clipLeft.getPoints();

      for (let i = 0; i < clipPoints.length; i++) {
        const p = clipPoints[i];
        if (referenceSide.below(p)) {
          localPoints.push(p);
          points.push(other.transform.apply(p));
        }
      }
      let normal = separation.axis;
      let tangent = normal.perpendicular();
      // Point Contact A -> B
      if (polyB.center.sub(polyA.center).dot(normal) < 0) {
        normal = normal.negate();
        tangent = normal.perpendicular();
      }
      return [new CollisionContact(polyA, polyB, normal.scale(-separation.separation), normal, tangent, points, localPoints, separation)];
    }
    return [];
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
      if (contact.info.localSide) {
        let side: LineSegment;
        let worldPoint: Vector;
        if (contact.info.collider === shapeA) {
          side = new LineSegment(
            txA.apply(contact.info.localSide.begin).add(shapeA.offset),
            txA.apply(contact.info.localSide.end).add(shapeA.offset)
          );
          worldPoint = txB.apply(localPoint).add(shapeB.offset);
        } else {
          side = new LineSegment(
            txB.apply(contact.info.localSide.begin).add(shapeB.offset),
            txB.apply(contact.info.localSide.end).add(shapeB.offset)
          );
          worldPoint = txA.apply(localPoint).add(shapeA.offset);
        }

        return side.distanceToPoint(worldPoint, true);
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

      const dist = worldPoint.distance(circlePoint);

      if (contact.info.side) {
        return dist > 0 ? -dist : 0;
      }
    }

    return 0;
  }
};
