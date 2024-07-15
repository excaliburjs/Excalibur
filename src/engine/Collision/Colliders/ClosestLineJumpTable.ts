import { LineSegment } from '../../Math/line-segment';
import { Vector } from '../../Math/vector';
import { Ray } from '../../Math/ray';
import { PolygonCollider } from './PolygonCollider';
import { EdgeCollider } from './EdgeCollider';
import { CircleCollider } from './CircleCollider';
import { clamp } from '../../Math/util';

/**
 * Finds the closest line segment between two given line segments.
 */
function ClosestLine(line1: LineSegment, line2: LineSegment) {
  // https://math.stackexchange.com/questions/1993953/closest-points-between-2-lines-in-2d
  const EPSILON = 1e-9;

  const line1Dir = line1.dir();
  const line2Dir = line2.dir();

  const d1Squared = line1Dir.dot(line1Dir);
  const d2Squared = line2Dir.dot(line2Dir);

  if (d1Squared < EPSILON && d2Squared < EPSILON) {
    return new LineSegment(line1.begin, line2.begin);
  }

  if (d1Squared < EPSILON) {
    const t = clamp(line2Dir.dot(line1.begin.sub(line2.begin)) / d2Squared, 0, 1);
    const closestPoint = line2.begin.add(line2Dir.scale(t));
    return new LineSegment(line1.begin, closestPoint);
  }

  if (d2Squared < EPSILON) {
    const t = clamp(line1Dir.dot(line2.begin.sub(line1.begin)) / d1Squared, 0, 1);
    const closestPoint = line1.begin.add(line1Dir.scale(t));
    return new LineSegment(closestPoint, line2.begin);
  }

  const r = line1.begin.sub(line2.begin);
  const a = d1Squared;
  const e = d2Squared;
  const f = line2Dir.dot(r);

  const denom = a * e - Math.pow(line1Dir.dot(line2Dir), 2);

  let s = 0;
  let t = 0;

  if (Math.abs(denom) > EPSILON) {
    s = clamp((line1Dir.dot(line2Dir) * f - e * line1Dir.dot(r)) / denom, 0, 1);
  } else {
    // lines are parallel
    s = clamp(line1Dir.dot(r) / a, 0, 1);
  }

  if (Math.abs(e) > EPSILON) {
    t = clamp((line1Dir.dot(line2Dir) * s + f) / e, 0, 1);
  } else {
    // line2 is a degenerate point
    t = 0;
  }

  const closestPointOnLine1 = line1.begin.add(line1Dir.scale(s));
  const closestPointOnLine2 = line2.begin.add(line2Dir.scale(t));

  return new LineSegment(closestPointOnLine1, closestPointOnLine2);
}

export const ClosestLineJumpTable = {
  PolygonPolygonClosestLine(polygonA: PolygonCollider, polygonB: PolygonCollider) {
    const aSides = polygonA.getSides();
    const bSides = polygonB.getSides();

    let minDistance = Number.MAX_VALUE;
    let closestLine: LineSegment | null = null;

    for (let i = 0; i < aSides.length; i++) {
      for (let j = 0; j < bSides.length; j++) {
        const line = ClosestLine(aSides[i], bSides[j]);
        const distance = line.getLength();

        if (distance < minDistance) {
          minDistance = distance;
          closestLine = line;
        }
      }
    }

    return closestLine;
  },

  PolygonEdgeClosestLine(polygon: PolygonCollider, edge: EdgeCollider) {
    // Find the 2 closest faces on each polygon
    const otherWorldPos = edge.worldPos;
    const otherDirection = otherWorldPos.sub(polygon.worldPos);

    const rayTowardsOther = new Ray(polygon.worldPos, otherDirection);

    const thisPoint = polygon.rayCast(rayTowardsOther).point.add(rayTowardsOther.dir.scale(0.1));

    const thisFace = polygon.getClosestFace(thisPoint);

    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line

    // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
    const edgeLine = edge.asLine();

    return ClosestLine(thisFace.face, edgeLine);
  },

  PolygonCircleClosestLine(polygon: PolygonCollider, circle: CircleCollider) {
    // https://math.stackexchange.com/questions/1919177/how-to-find-point-on-line-closest-to-sphere
    // Find the 2 closest faces on each polygon
    const otherWorldPos = circle.worldPos;
    const otherDirection = otherWorldPos.sub(polygon.worldPos);

    const rayTowardsOther = new Ray(polygon.worldPos, otherDirection.normalize());

    const thisPoint = polygon.rayCast(rayTowardsOther).point.add(rayTowardsOther.dir.scale(0.1));

    const thisFace = polygon.getClosestFace(thisPoint);

    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const p0 = thisFace.face.begin;
    const u = thisFace.face.getEdge();

    // Time of minimum distance
    let t = (u.x * (otherWorldPos.x - p0.x) + u.y * (otherWorldPos.y - p0.y)) / (u.x * u.x + u.y * u.y);

    // If time of minimum is past the edge clamp
    if (t > 1) {
      t = 1;
    } else if (t < 0) {
      t = 0;
    }

    // Minimum distance
    const d = Math.sqrt(Math.pow(p0.x + u.x * t - otherWorldPos.x, 2) + Math.pow(p0.y + u.y * t - otherWorldPos.y, 2)) - circle.radius;

    const circlex = ((p0.x + u.x * t - otherWorldPos.x) * circle.radius) / (circle.radius + d);
    const circley = ((p0.y + u.y * t - otherWorldPos.y) * circle.radius) / (circle.radius + d);
    return new LineSegment(u.scale(t).add(p0), new Vector(otherWorldPos.x + circlex, otherWorldPos.y + circley));
  },

  CircleCircleClosestLine(circleA: CircleCollider, circleB: CircleCollider) {
    // Find the 2 closest faces on each polygon
    const otherWorldPos = circleB.worldPos;
    const otherDirection = otherWorldPos.sub(circleA.worldPos);

    const thisWorldPos = circleA.worldPos;
    const thisDirection = thisWorldPos.sub(circleB.worldPos);

    const rayTowardsOther = new Ray(circleA.worldPos, otherDirection);
    const rayTowardsThis = new Ray(circleB.worldPos, thisDirection);

    const thisPoint = circleA.rayCast(rayTowardsOther);
    const otherPoint = circleB.rayCast(rayTowardsThis);

    return new LineSegment(thisPoint.point, otherPoint.point);
  },

  CircleEdgeClosestLine(circle: CircleCollider, edge: EdgeCollider) {
    // https://math.stackexchange.com/questions/1919177/how-to-find-point-on-line-closest-to-sphere
    const circleWorldPos = circle.worldPos;

    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const edgeLine = edge.asLine();
    const edgeStart = edgeLine.begin;
    const edgeVector = edgeLine.getEdge();
    const p0 = edgeStart;
    const u = edgeVector;

    // Time of minimum distance
    let t = (u.x * (circleWorldPos.x - p0.x) + u.y * (circleWorldPos.y - p0.y)) / (u.x * u.x + u.y * u.y);

    // If time of minimum is past the edge clamp to edge
    if (t > 1) {
      t = 1;
    } else if (t < 0) {
      t = 0;
    }

    // Minimum distance
    const d = Math.sqrt(Math.pow(p0.x + u.x * t - circleWorldPos.x, 2) + Math.pow(p0.y + u.y * t - circleWorldPos.y, 2)) - circle.radius;

    const circlex = ((p0.x + u.x * t - circleWorldPos.x) * circle.radius) / (circle.radius + d);
    const circley = ((p0.y + u.y * t - circleWorldPos.y) * circle.radius) / (circle.radius + d);
    return new LineSegment(u.scale(t).add(p0), new Vector(circleWorldPos.x + circlex, circleWorldPos.y + circley));
  },

  EdgeEdgeClosestLine(edgeA: EdgeCollider, edgeB: EdgeCollider) {
    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const edgeLineA = edgeA.asLine();

    // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
    const edgeLineB = edgeB.asLine();

    return ClosestLine(edgeLineA, edgeLineB);
  }
};
