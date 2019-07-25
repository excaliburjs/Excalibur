import { Circle } from './Circle';
import { CollisionContact } from './CollisionContact';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';

import { Vector } from '../Algebra';

export const CollisionJumpTable = {
  CollideCircleCircle(circleA: Circle, circleB: Circle): CollisionContact {
    const radius = circleA.radius + circleB.radius;
    const circleAPos = circleA.worldPos;
    const circleBPos = circleB.worldPos;
    if (circleAPos.distance(circleBPos) > radius) {
      return null;
    }

    const axisOfCollision = circleBPos.sub(circleAPos).normalize();
    const mvt = axisOfCollision.scale(radius - circleBPos.distance(circleAPos));

    const pointOfCollision = circleA.getFurthestPoint(axisOfCollision);

    return new CollisionContact(circleA.collider, circleB.collider, mvt, pointOfCollision, axisOfCollision);
  },

  CollideCirclePolygon(circle: Circle, polygon: ConvexPolygon): CollisionContact {
    let minAxis = circle.testSeparatingAxisTheorem(polygon);
    if (!minAxis) {
      return null;
    }

    // make sure that the minAxis is pointing away from circle
    const samedir = minAxis.dot(polygon.center.sub(circle.center));
    minAxis = samedir < 0 ? minAxis.negate() : minAxis;

    const verts: Vector[] = [];

    const point1 = polygon.getFurthestPoint(minAxis.negate());
    const point2 = circle.getFurthestPoint(minAxis); //.add(cc);
    if (circle.contains(point1)) {
      verts.push(point1);
    }
    if (polygon.contains(point2)) {
      verts.push(point2);
    }
    if (verts.length === 0) {
      return null;
    }

    return new CollisionContact(
      circle.collider,
      polygon.collider,
      minAxis,
      verts.length === 2 ? verts[0].average(verts[1]) : verts[0],
      minAxis.normalize()
    );
  },

  CollideCircleEdge(circle: Circle, edge: Edge): CollisionContact {
    // center of the circle
    const cc = circle.center;
    // vector in the direction of the edge
    const e = edge.end.sub(edge.begin);

    // amount of overlap with the circle's center along the edge direction
    const u = e.dot(edge.end.sub(cc));
    const v = e.dot(cc.sub(edge.begin));

    // Potential region A collision (circle is on the left side of the edge, before the beginning)
    if (v <= 0) {
      const da = edge.begin.sub(cc);
      const dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
      // save some sqrts
      if (dda > circle.radius * circle.radius) {
        return null; // no collision
      }
      return new CollisionContact(
        circle.collider,
        edge.collider,
        da.normalize().scale(circle.radius - Math.sqrt(dda)),
        edge.begin,
        da.normalize()
      );
    }

    // Potential region B collision (circle is on the right side of the edge, after the end)
    if (u <= 0) {
      const db = edge.end.sub(cc);
      const ddb = db.dot(db);
      if (ddb > circle.radius * circle.radius) {
        return null;
      }
      return new CollisionContact(
        circle.collider,
        edge.collider,
        db.normalize().scale(circle.radius - Math.sqrt(ddb)),
        edge.end,
        db.normalize()
      );
    }

    // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
    const den = e.dot(e);
    const pointOnEdge = edge.begin
      .scale(u)
      .add(edge.end.scale(v))
      .scale(1 / den);
    const d = cc.sub(pointOnEdge);

    const dd = d.dot(d);
    if (dd > circle.radius * circle.radius) {
      return null; // no collision
    }

    let n = e.perpendicular();
    // flip correct direction
    if (n.dot(cc.sub(edge.begin)) < 0) {
      n.x = -n.x;
      n.y = -n.y;
    }

    n = n.normalize();

    const mvt = n.scale(Math.abs(circle.radius - Math.sqrt(dd)));
    return new CollisionContact(circle.collider, edge.collider, mvt.negate(), pointOnEdge, n.negate());
  },

  CollideEdgeEdge(): CollisionContact {
    // Edge-edge collision doesn't make sense
    return null;
  },

  CollidePolygonEdge(polygon: ConvexPolygon, edge: Edge): CollisionContact {
    // 3 cases:
    // (1) Polygon lands on the full face
    // (2) Polygon lands on the right point
    // (3) Polygon lands on the left point

    const e = edge.end.sub(edge.begin);
    let edgeNormal = e.normal();

    if (polygon.contains(edge.begin)) {
      const { distance: mtv, face } = polygon.getClosestFace(edge.begin);
      if (mtv) {
        return new CollisionContact(polygon.collider, edge.collider, mtv.negate(), edge.begin.add(mtv.negate()), face.normal().negate());
      }
    }

    if (polygon.contains(edge.end)) {
      const { distance: mtv, face } = polygon.getClosestFace(edge.end);
      if (mtv) {
        return new CollisionContact(polygon.collider, edge.collider, mtv.negate(), edge.end.add(mtv.negate()), face.normal().negate());
      }
    }

    const pc = polygon.center;
    const ec = edge.center;
    const dir = ec.sub(pc).normalize();

    // build a temporary polygon from the edge to use SAT
    const linePoly = new ConvexPolygon({
      collider: edge.collider,
      points: [edge.begin, edge.end, edge.end.add(dir.scale(30)), edge.begin.add(dir.scale(30))]
    });

    let minAxis = polygon.testSeparatingAxisTheorem(linePoly);

    // no minAxis, no overlap, no collision
    if (!minAxis) {
      return null;
    }

    // flip the normal and axis to always have positive collisions
    edgeNormal = edgeNormal.dot(dir) < 0 ? edgeNormal.negate() : edgeNormal;
    minAxis = minAxis.dot(dir) < 0 ? minAxis.negate() : minAxis;

    return new CollisionContact(polygon.collider, edge.collider, minAxis, polygon.getFurthestPoint(edgeNormal), edgeNormal);
  },

  CollidePolygonPolygon(polyA: ConvexPolygon, polyB: ConvexPolygon): CollisionContact {
    // do a SAT test to find a min axis if it exists
    let minAxis = polyA.testSeparatingAxisTheorem(polyB);

    // no overlap, no collision return null
    if (!minAxis) {
      return null;
    }

    // make sure that minAxis is pointing from A -> B
    const sameDir = minAxis.dot(polyB.center.sub(polyA.center));
    minAxis = sameDir < 0 ? minAxis.negate() : minAxis;

    // find rough point of collision
    // todo this could be better
    const verts: Vector[] = [];
    const pointA = polyA.getFurthestPoint(minAxis);
    const pointB = polyB.getFurthestPoint(minAxis.negate());

    if (polyB.contains(pointA)) {
      verts.push(pointA);
    }

    if (polyA.contains(pointB)) {
      verts.push(pointB);
    }
    // no candidates, pick something
    if (verts.length === 0) {
      verts.push(pointB);
    }

    const contact = verts.length === 2 ? verts[0].add(verts[1]).scale(0.5) : verts[0];

    return new CollisionContact(polyA.collider, polyB.collider, minAxis, contact, minAxis.normalize());
  }
};
