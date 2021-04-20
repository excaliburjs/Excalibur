import { Circle } from './Circle';
import { CollisionContact } from '../Detection/CollisionContact';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';
import { SeparatingAxis, SeparationInfo } from './SeparatingAxis';
import { Line, Vector } from '../../Algebra';
import { TransformComponent } from '../../EntityComponentSystem';

export const CollisionJumpTable = {
  CollideCircleCircle(circleA: Circle, circleB: Circle): CollisionContact {
    const circleAPos = circleA.worldPos;
    const circleBPos = circleB.worldPos;
    const combinedRadius = circleA.radius + circleB.radius;
    const distance = circleAPos.distance(circleBPos);

    if (distance >= combinedRadius) {
      return null;
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
    }

    return new CollisionContact(circleA, circleB, mvt, normal, tangent, [point], [local], info);
  },

  CollideCirclePolygon(circle: Circle, polygon: ConvexPolygon): CollisionContact {
    let minAxis =  SeparatingAxis.findCirclePolygonSeparation(circle, polygon);
    if (!minAxis) {
      return null;
    }

    // make sure that the minAxis is pointing away from circle
    const samedir = minAxis.dot(polygon.center.sub(circle.center));
    minAxis = samedir < 0 ? minAxis.negate() : minAxis;

    const point = circle.getFurthestPoint(minAxis);
    const local = circle.owner.transform.applyInverse(point);
    const normal = minAxis.normalize();

    const info: SeparationInfo = {
      collider: circle,
      separation: -minAxis.size,
      axis: normal,
      point: point,
      localPoint: local,
      side: polygon.findSide(normal.negate()),
      localSide: polygon.findLocalSide(normal.negate())
    }

    return new CollisionContact(
      circle,
      polygon,
      minAxis,
      normal,
      normal.perpendicular(),
      [point],
      [local],
      info
    );
  },

  CollideCircleEdge(circle: Circle, edge: Edge): CollisionContact {
    // TODO not sure this actually abides by local/world collisions
    // Are edge.begin and edge.end local space or world space? I think they should be local

    // center of the circle
    const cc = circle.center;
    // vector in the direction of the edge
    const e = edge.end.sub(edge.begin);

    // amount of overlap with the circle's center along the edge direction
    const u = e.dot(edge.end.sub(cc));
    const v = e.dot(cc.sub(edge.begin));
    const side = edge.asLine();
    const localSide = edge.asLocalLine();

    // Potential region A collision (circle is on the left side of the edge, before the beginning)
    if (v <= 0) {
      const da = edge.begin.sub(cc);
      const dda = da.dot(da); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
      // save some sqrts
      if (dda > circle.radius * circle.radius) {
        return null; // no collision
      }

      const normal = da.normalize();
      const separation = circle.radius - Math.sqrt(dda)
      

      const info: SeparationInfo = {
        collider: circle,
        separation: separation,
        axis: normal,
        point: side.begin,
        side: side,
        localSide: localSide
      }

      return new CollisionContact(
        circle,
        edge,
        normal.scale(separation),
        normal,
        normal.perpendicular(),
        [side.begin],
        [localSide.begin],
        info
      );
    }

    // Potential region B collision (circle is on the right side of the edge, after the end)
    if (u <= 0) {
      const db = edge.end.sub(cc);
      const ddb = db.dot(db);
      if (ddb > circle.radius * circle.radius) {
        return null;
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
      }

      return new CollisionContact(
        circle,
        edge,
        normal.scale(separation),
        normal,
        normal.perpendicular(),
        [side.end],
        [localSide.end],
        info
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

    let normal = e.perpendicular();
    // flip correct direction
    if (normal.dot(cc.sub(edge.begin)) < 0) {
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
    }


    return new CollisionContact(
      circle,
      edge,
      mvt,
      normal,
      normal.perpendicular(),
      [pointOnEdge],
      [pointOnEdge],
      info
    );
  },

  CollideEdgeEdge(): CollisionContact {
    // Edge-edge collision doesn't make sense
    return null;
  },

  CollidePolygonEdge(polygon: ConvexPolygon, edge: Edge): CollisionContact {

    const pc = polygon.center;
    const ec = edge.center;
    const dir = ec.sub(pc).normalize();

    // build a temporary polygon from the edge to use SAT
    const linePoly = new ConvexPolygon({
      points: [edge.begin, edge.end, edge.end.add(dir.scale(100)), edge.begin.add(dir.scale(100))]
    });
    linePoly.owner = edge.owner;
    linePoly.owningId = edge.owningId;
    linePoly.update(edge.owner.transform);
    return this.CollidePolygonPolygon(polygon, linePoly);
  },

  CollidePolygonPolygon(polyA: ConvexPolygon, polyB: ConvexPolygon): CollisionContact {
    // Multi contact from SAT
    // https://gamedev.stackexchange.com/questions/111390/multiple-contacts-for-sat-collision-detection
    // do a SAT test to find a min axis if it exists
    const separationA = SeparatingAxis.findPolygonPolygonSeparation(polyA, polyB);
      // If there is no overlap from boxA's perspective we can end early
      if (separationA.separation > 0) {
          return null;
      } 

      const separationB = SeparatingAxis.findPolygonPolygonSeparation(polyB, polyA);
      // If there is no overlap from boxB's perspective exit now
      if (separationB.separation > 0) {
          return null;
      }

      // Separations are both negative, we want to pick the least negative (minimal movement)
      const separation = separationA.separation > separationB.separation ? separationA : separationB;

      // The incident side is the most opposite from the axes of collision on the other shape
      const other = separation.collider === polyA ? polyB : polyA;
      const incident = other.findSide(separation.axis.negate()) as Line;

      // Clip incident side by the perpendicular lines at each end of the reference side
      // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
      const reference = separation.side;
      const refDir = reference.dir().normalize();
      
      // Find our contact points by clipping the incident by the collision side
      const clipRight = incident.clip(refDir.negate(), -refDir.dot(reference.begin));
      let clipLeft: Line | null = null;
      if (clipRight) {
          clipLeft = clipRight.clip(refDir, refDir.dot(reference.end));
      }

      // If there is no left there is no collision
      if (clipLeft) {
          // We only want clip points below the reference edge, discard the others
          const points = clipLeft.getPoints().filter(p => {
            return reference.below(p)
          });

          let normal = separation.axis;
          let tangent = normal.perpendicular();
          // Point Contact A -> B
          if (polyB.worldPos.sub(polyA.worldPos).dot(normal) < 0) {
              normal = normal.negate();
              tangent = normal.perpendicular();
          }
          // Points are clipped from incident which is the other collider
          // Store those as locals
          let localPoints: Vector[] = [];
          if (separation.collider === polyA) {
              const xf = polyB.owner?.transform ?? new TransformComponent(); 
              localPoints = points.map(p => xf.applyInverse(p));
            } else {
            const xf = polyA.owner?.transform ?? new TransformComponent(); 
              localPoints = points.map(p => xf.applyInverse(p));
          }
          return new CollisionContact(
            polyA,
            polyB,
            normal.scale(-separation.separation),
            normal,
            tangent,
            points,
            localPoints,
            separation
          );
      }
      return null;
  }
};
