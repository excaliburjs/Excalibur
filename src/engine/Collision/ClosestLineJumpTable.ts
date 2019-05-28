import { Line, Vector, Ray } from '../Algebra';
import { ConvexPolygon } from './ConvexPolygon';
import { Edge } from './Edge';
import { Circle } from './Circle';

/**
 * Finds the closes line between 2 line segments, were the magnitude of u, v are the lengths of each segment
 * L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
 * L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
 * @param p0 Point where L1 begins
 * @param u Direction and length of L1
 * @param q0 Point were L2 begins
 * @param v Direction and lenght of L2
 */
export function ClosestLine(p0: Vector, u: Vector, q0: Vector, v: Vector) {
  // Distance between 2 lines http://geomalgorithms.com/a07-_distance.html

  // w(s, t) = P(s) - Q(t)
  // The w(s, t) that has the minimum distance we will say is w(sClosest, tClosest) = wClosest
  //
  // wClosest is the vector that is uniquely perpendicular to the 2 line directions u & v.
  // wClosest = w0 + sClosest * u - tClosest * v, where w0 is p0 - q0
  //
  // The closest point between 2 lines then satisfies this pair of equations
  // 1: u * wClosest = 0
  // 2: v * wClosest = 0
  //
  // Substituting wClosest into the equations we get
  //
  // 1: (u * u) * sClosest - (u * v) tClosest = -u * w0
  // 2: (v * u) * sClosest - (v * v) tClosest = -v * w0

  // simplify w0
  const w0 = p0.sub(q0);

  // simplify (u * u);
  const a = u.dot(u);
  // simplify (u * v);
  const b = u.dot(v);
  // simplify (v * v)
  const c = v.dot(v);
  // simplify (u * w0)
  const d = u.dot(w0);
  // simplify (v * w0)
  const e = v.dot(w0);

  // denominator ac - b^2
  let denom = a * c - b * b;
  let sDenom = denom;
  let tDenom = denom;
  // if denom is 0 they are parallel, use any point from either as the start in this case p0
  if (denom === 0 || denom <= 0.01) {
    const tClosestParallel = d / b;
    return new Line(p0, q0.add(v.scale(tClosestParallel)));
  }

  // Solve for sClosest for infinite line
  let sClosest = b * e - c * d; // / denom;

  // Solve for tClosest for infinite line
  let tClosest = a * e - b * d; // / denom;

  // Solve for segments candidate edges, if sClosest and tClosest are outside their segments
  if (sClosest < 0) {
    sClosest = 0;
    tClosest = e;
    tDenom = c;
  } else if (sClosest > sDenom) {
    sClosest = sDenom;
    tClosest = e + b;
    tDenom = c;
  }

  if (tClosest < 0) {
    tClosest = 0;
    if (-d < 0) {
      sClosest = 0;
    } else if (-d > a) {
      sClosest = sDenom;
    } else {
      sClosest = -d;
      sDenom = a;
    }
  } else if (tClosest > tDenom) {
    tClosest = tDenom;
    if (-d + b < 0) {
      sClosest = 0;
    } else if (-d + b > a) {
      sClosest = sDenom;
    } else {
      sClosest = -d + b;
      sDenom = a;
    }
  }
  sClosest = Math.abs(sClosest) < 0.001 ? 0 : sClosest / sDenom;
  tClosest = Math.abs(tClosest) < 0.001 ? 0 : tClosest / tDenom;

  return new Line(p0.add(u.scale(sClosest)), q0.add(v.scale(tClosest)));
}

export let ClosestLineJumpTable = {
  PolygonPolygonClosestLine(polygonA: ConvexPolygon, polygonB: ConvexPolygon) {
    // Find the 2 closest faces on each polygon
    const otherWorldPos = polygonB.worldPos;
    const otherDirection = otherWorldPos.sub(polygonA.worldPos);
    const thisDirection = otherDirection.negate();

    const rayTowardsOther = new Ray(polygonA.worldPos, otherDirection);
    const rayTowardsThis = new Ray(otherWorldPos, thisDirection);

    const thisPoint = polygonA.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));
    const otherPoint = polygonB.rayCast(rayTowardsThis).add(rayTowardsThis.dir.scale(0.1));

    const thisFace = polygonA.getClosestFace(thisPoint);
    const otherFace = polygonB.getClosestFace(otherPoint);

    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const p0 = thisFace.face.begin;
    const u = thisFace.face.getEdge();

    // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
    const q0 = otherFace.face.begin;
    const v = otherFace.face.getEdge();

    return ClosestLine(p0, u, q0, v);
  },

  PolygonEdgeClosestLine(polygon: ConvexPolygon, edge: Edge) {
    // Find the 2 closest faces on each polygon
    const otherWorldPos = edge.worldPos;
    const otherDirection = otherWorldPos.sub(polygon.worldPos);

    const rayTowardsOther = new Ray(polygon.worldPos, otherDirection);

    const thisPoint = polygon.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));

    const thisFace = polygon.getClosestFace(thisPoint);

    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const p0 = thisFace.face.begin;
    const u = thisFace.face.getEdge();

    // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
    const edgeLine = edge.asLine();
    const edgeStart = edgeLine.begin;
    const edgeVector = edgeLine.getEdge();
    const q0 = edgeStart;
    const v = edgeVector;

    return ClosestLine(p0, u, q0, v);
  },

  PolygonCircleClosestLine(polygon: ConvexPolygon, circle: Circle) {
    // https://math.stackexchange.com/questions/1919177/how-to-find-point-on-line-closest-to-sphere
    // Find the 2 closest faces on each polygon
    const otherWorldPos = circle.worldPos;
    const otherDirection = otherWorldPos.sub(polygon.worldPos);

    const rayTowardsOther = new Ray(polygon.worldPos, otherDirection.normalize());

    const thisPoint = polygon.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));

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
    return new Line(u.scale(t).add(p0), new Vector(otherWorldPos.x + circlex, otherWorldPos.y + circley));
  },

  CircleCircleClosestLine(circleA: Circle, circleB: Circle) {
    // Find the 2 closest faces on each polygon
    const otherWorldPos = circleB.worldPos;
    const otherDirection = otherWorldPos.sub(circleA.worldPos);

    const thisWorldPos = circleA.worldPos;
    const thisDirection = thisWorldPos.sub(circleB.worldPos);

    const rayTowardsOther = new Ray(circleA.worldPos, otherDirection);
    const rayTowardsThis = new Ray(circleB.worldPos, thisDirection);

    const thisPoint = circleA.rayCast(rayTowardsOther).add(rayTowardsOther.dir.scale(0.1));
    const otherPoint = circleB.rayCast(rayTowardsThis).add(rayTowardsThis.dir.scale(0.1));

    return new Line(thisPoint, otherPoint);
  },

  CircleEdgeClosestLine(circle: Circle, edge: Edge) {
    // https://math.stackexchange.com/questions/1919177/how-to-find-point-on-line-closest-to-sphere
    const circleWorlPos = circle.worldPos;

    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const edgeLine = edge.asLine();
    const edgeStart = edgeLine.begin;
    const edgeVector = edgeLine.getEdge();
    const p0 = edgeStart;
    const u = edgeVector;

    // Time of minimum distance
    let t = (u.x * (circleWorlPos.x - p0.x) + u.y * (circleWorlPos.y - p0.y)) / (u.x * u.x + u.y * u.y);

    // If time of minimum is past the edge clamp to edge
    if (t > 1) {
      t = 1;
    } else if (t < 0) {
      t = 0;
    }

    // Minimum distance
    const d = Math.sqrt(Math.pow(p0.x + u.x * t - circleWorlPos.x, 2) + Math.pow(p0.y + u.y * t - circleWorlPos.y, 2)) - circle.radius;

    const circlex = ((p0.x + u.x * t - circleWorlPos.x) * circle.radius) / (circle.radius + d);
    const circley = ((p0.y + u.y * t - circleWorlPos.y) * circle.radius) / (circle.radius + d);
    return new Line(u.scale(t).add(p0), new Vector(circleWorlPos.x + circlex, circleWorlPos.y + circley));
  },

  EdgeEdgeClosestLine(edgeA: Edge, edgeB: Edge) {
    // L1 = P(s) = p0 + s * u, where s is time and p0 is the start of the line
    const edgeLineA = edgeA.asLine();
    const edgeStartA = edgeLineA.begin;
    const edgeVectorA = edgeLineA.getEdge();
    const p0 = edgeStartA;
    const u = edgeVectorA;

    // L2 = Q(t) = q0 + t * v, where t is time and q0 is the start of the line
    const edgeLineB = edgeB.asLine();
    const edgeStartB = edgeLineB.begin;
    const edgeVectorB = edgeLineB.getEdge();
    const q0 = edgeStartB;
    const v = edgeVectorB;

    return ClosestLine(p0, u, q0, v);
  }
};
