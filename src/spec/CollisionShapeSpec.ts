import * as ex from '../../build/dist/excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('Collision Shape', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  describe('a Circle', () => {
    let circle: ex.CircleArea;
    let actor: ex.Actor;

    beforeEach(() => {
      actor = new ex.Actor(0, 0, 20, 20);
      circle = new ex.CircleArea({
        pos: ex.Vector.Zero.clone(),
        radius: 10,
        body: actor.body
      });
    });

    it('exists', () => {
      expect(ex.CircleArea).toBeDefined();
    });

    it('can be constructed with empty args', () => {
      const circle = new ex.CircleArea({});
      expect(circle).not.toBeNull();
    });

    it('can be cloned', () => {
      const actor1 = new ex.Actor(0, 0, 20, 20);
      const circle = new ex.CircleArea({
        collider: actor1.body.collider,
        pos: new ex.Vector(20, 25)
      });

      const sut = circle.clone();

      expect(sut).not.toBe(circle);
      expect(sut.pos).toBeVector(circle.pos);
      expect(sut.pos).not.toBe(circle.pos);
      expect(sut.collider).toBe(null);
    });

    it('can be constructed with points', () => {
      const actor = new ex.Actor(0, 0, 10, 10);
      const circle = new ex.CircleArea({
        pos: ex.Vector.Zero.clone(),
        radius: 10,
        body: actor.body
      });
      expect(circle).not.toBeNull();
    });

    it('has a center', () => {
      actor.pos.setTo(170, 300);
      const center = circle.getCenter();
      expect(center.x).toBe(170);
      expect(center.y).toBe(300);
    });

    it('has bounds', () => {
      actor.pos.setTo(400, 400);

      const bounds = circle.getBounds();
      expect(bounds.left).toBe(390);
      expect(bounds.right).toBe(410);
      expect(bounds.top).toBe(390);
      expect(bounds.bottom).toBe(410);
    });

    it('can contain points', () => {
      const pointInside = new ex.Vector(0, 5);
      const pointOnEdge = new ex.Vector(0, 10);
      const pointJustOutside = new ex.Vector(0, 10.1);

      expect(circle.contains(pointInside)).toBe(true);
      expect(circle.contains(pointOnEdge)).toBe(true);
      expect(circle.contains(pointJustOutside)).toBe(false);
    });

    it('can be raycast against', () => {
      const ray = new ex.Ray(new ex.Vector(-100, 0), ex.Vector.Right.clone());
      const rayTangent = new ex.Ray(new ex.Vector(-100, 10), ex.Vector.Right.clone());
      const rayNoHit = new ex.Ray(new ex.Vector(-100, 10), ex.Vector.Left.clone());

      const point = circle.rayCast(ray);
      const pointTangent = circle.rayCast(rayTangent);
      const pointNoHit = circle.rayCast(rayNoHit);
      const pointTooFar = circle.rayCast(ray, 1);

      expect(point.x).toBe(-10);
      expect(point.y).toBe(0);

      expect(pointTangent.x).toBe(0);
      expect(pointTangent.y).toBe(10);

      expect(pointNoHit).toBe(null);
      expect(pointTooFar).toBe(null, 'The circle should be too far away for a hit');
    });

    it('doesnt have axes', () => {
      // technically circles have infinite axes
      expect(circle.getAxes()).toBe(null);
    });

    it('has a moment of inertia', () => {
      // following this formula
      //https://en.wikipedia.org/wiki/List_of_moments_of_inertia
      // I = m*r^2/2
      expect(circle.getInertia()).toBe((circle.body.collider.mass * circle.radius * circle.radius) / 2);
    });

    it('should collide without a collider or body', () => {
      const circle1 = new ex.CircleArea({
        pos: new ex.Vector(0, 0),
        radius: 5
      });

      const circle2 = new ex.CircleArea({
        pos: new ex.Vector(9, 0),
        radius: 5
      });

      const cc = circle1.collide(circle2);
      expect(cc.mtv).toBeVector(new ex.Vector(1, 0));
    });

    it('should collide with other circles when touching', () => {
      const actor2 = new ex.Actor(20, 0, 10, 10);
      const circle2 = new ex.CircleArea({
        radius: 10,
        body: actor2.body
      });

      const directionOfBodyB = circle2.getCenter().sub(circle.getCenter());
      const contact = circle.collide(circle2);

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the nomral should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.point.x).toBe(10);
      expect(contact.point.y).toBe(0);
    });

    it('should not collide with other circles when touching', () => {
      const actor2 = new ex.Actor(21, 0, 10, 10);
      const circle2 = new ex.CircleArea({
        radius: 10,
        body: actor2.body
      });

      const contact = circle.collide(circle2);

      // there should not be a collision contact formed, null indicates that
      expect(contact).toBe(null);
    });

    it('should collide with other polygons when touching', () => {
      const actor2 = new ex.Actor(14.99, 0, 10, 10); // meh close enough
      const poly = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        points: actor2.getRelativeBounds().getPoints(),
        body: actor2.body
      });

      const directionOfBodyB = poly.getCenter().sub(circle.getCenter());
      const contact = circle.collide(poly);

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the nomral should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.point.x).toBe(10);
      expect(contact.point.y).toBe(0);
    });

    it('should not collide with other polygons when not touching', () => {
      const actor2 = new ex.Actor(16, 0, 10, 10);
      const poly = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        points: actor2.getRelativeBounds().getPoints(),
        body: actor2.body
      });

      const contact = circle.collide(poly);

      // there should not be a collision contact formed
      expect(contact).toBe(null);
    });

    it('should collide with other edges when touching the edge face', () => {
      // position the circle actor in the middle of the edge
      actor.pos.setTo(5, -9.99);

      const actor2 = new ex.Actor(5, 0, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 0),
        end: new ex.Vector(10, 0),
        collider: actor2.body.collider
      });

      const directionOfBodyB = edge.getCenter().sub(circle.getCenter());
      const contact = circle.collide(edge);

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the nomral should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.point.x).toBe(5);
      expect(contact.point.y).toBe(0);
    });

    it('should collide with other edges when touching the edge end', () => {
      // position the circle actor in the end of the edge
      actor.pos.setTo(10, -9);

      const actor2 = new ex.Actor(5, 0, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 0),
        end: new ex.Vector(10, 0),
        collider: actor2.body.collider
      });

      const directionOfBodyB = edge.getCenter().sub(circle.getCenter());
      const contact = circle.collide(edge);

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the nomral should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.point.x).toBe(10);
      expect(contact.point.y).toBe(0);
    });

    it('should collide with other edges when touching the edge beginning', () => {
      // position the circle actor in the end of the edge
      actor.pos.setTo(0, -9);

      const actor2 = new ex.Actor(5, 0, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 0),
        end: new ex.Vector(10, 0),
        collider: actor2.body.collider
      });

      const directionOfBodyB = edge.getCenter().sub(circle.getCenter());
      const contact = circle.collide(edge);

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the nomral should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.point.x).toBe(0);
      expect(contact.point.y).toBe(0);
    });
  });

  describe('a ConvexPolygon', () => {
    it('exists', () => {
      expect(ex.ConvexPolygon).toBeDefined();
    });

    it('can be constructed with empty args', () => {
      const poly = new ex.ConvexPolygon({});
      expect(poly).not.toBe(null);
    });

    it('can be cloned', () => {
      const actor1 = new ex.Actor(0, 0, 20, 20);
      const poly = new ex.ConvexPolygon({
        collider: actor1.body.collider,
        points: [ex.Vector.One, ex.Vector.Half],
        pos: new ex.Vector(20, 25)
      });

      const sut = poly.clone();

      expect(sut).not.toBe(poly);
      expect(sut.pos).toBeVector(poly.pos);
      expect(sut.pos).not.toBe(poly.pos);
      expect(sut.points.length).toBe(2);
      expect(sut.collider).toBe(null);
    });

    it('can be constructed with points', () => {
      const poly = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });
      expect(poly).not.toBe(null);
    });

    it('can have be constructed with position', () => {
      const poly = new ex.ConvexPolygon({
        pos: new ex.Vector(10, 0),
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });

      expect(poly.pos.x).toBe(10);
      expect(poly.pos.y).toBe(0);

      // should translate right 10 pixels
      const transformedPoints = poly.getTransformedPoints();
      expect(transformedPoints[0].x).toBe(0);
      expect(transformedPoints[1].x).toBe(20);
      expect(transformedPoints[2].x).toBe(20);
      expect(transformedPoints[3].x).toBe(0);
    });

    it('can collide with other polygons', () => {
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });

      const polyB = new ex.ConvexPolygon({
        pos: new ex.Vector(10, 0),
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });

      const directionOfBodyB = polyB.getCenter().sub(polyA.getCenter());

      // should overlap by 10 pixels in x
      const contact = polyA.collide(polyB);

      // there should be a collision
      expect(contact).not.toBe(null);

      // normal and mtv should point away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      expect(contact.mtv.x).toBeCloseTo(10, 0.01);
      expect(contact.normal.x).toBeCloseTo(1, 0.01);
      expect(contact.mtv.y).toBeCloseTo(0, 0.01);
      expect(contact.normal.y).toBeCloseTo(0, 0.01);
    });

    it('can collide with the middle of an edge', () => {
      const actor = new ex.Actor(5, -6, 20, 20);
      actor.rotation = Math.PI / 4;
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
        body: actor.body
      });
      polyA.recalc();

      const actor2 = new ex.Actor(5, 0, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 0),
        end: new ex.Vector(10, 0),
        body: actor2.body
      });

      const directionOfBodyB = edge.getCenter().sub(polyA.getCenter());

      const contact = polyA.collide(edge);

      // there should be a collision
      expect(contact).not.toBe(null);

      // the normal should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the mtv should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
    });

    it('can collide with the end of an edge', () => {
      const actor = new ex.Actor(0, -4, 20, 20);
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
        body: actor.body
      });
      polyA.recalc();

      const actor2 = new ex.Actor(5, 0, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 0),
        end: new ex.Vector(0, 10),
        body: actor2.body
      });
      edge.recalc();

      const directionOfBodyB = edge.getCenter().sub(polyA.getCenter());
      const contact = polyA.collide(edge);

      expect(contact).not.toBe(null);
      // the normal should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);
      // the mtv should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
    });

    it('can collide with the end of an edge regardless of order', () => {
      const actor = new ex.Actor(0, -4, 20, 20);
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
        body: actor.body
      });
      polyA.recalc();

      const actor2 = new ex.Actor(5, 0, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 10),
        end: new ex.Vector(0, 0),
        body: actor2.body
      });
      edge.recalc();

      const directionOfBodyB = edge.getCenter().sub(polyA.getCenter());
      const contact = polyA.collide(edge);

      expect(contact).not.toBe(null);
      // the normal should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);
      // the mtv should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
    });

    it('should not collide with the middle of an edge when not touching', () => {
      const actor = new ex.Actor(5, 0, 20, 20);
      actor.rotation = Math.PI / 4;
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
        body: actor.body
      });
      polyA.recalc();

      const actor2 = new ex.Actor(5, 100, 10, 10);
      const edge = new ex.EdgeArea({
        begin: new ex.Vector(0, 100),
        end: new ex.Vector(10, 100),
        body: actor2.body
      });

      const directionOfBodyB = edge.getCenter().sub(polyA.getCenter());

      const contact = polyA.collide(edge);

      // there should not be a collision
      expect(contact).toBe(null);
    });

    it('should detected contained points', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
        body: actor.body
      });
      polyA.recalc();

      const point = new ex.Vector(0, 0);
      const pointOnEdge = new ex.Vector(0, 5);
      const pointOutside = new ex.Vector(0, 5.1);

      expect(polyA.contains(point)).toBe(true);
      expect(polyA.contains(pointOnEdge)).toBe(true);
      expect(polyA.contains(pointOutside)).toBe(false);
    });

    it('can calculate the closest face to a point', () => {
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)]
      });
      polyA.recalc();

      const point1 = new ex.Vector(-5, 0);
      const { face: face1 } = polyA.getClosestFace(point1);

      const point2 = new ex.Vector(0, -5);
      const { face: face2 } = polyA.getClosestFace(point2);

      const point3 = new ex.Vector(5, 0);
      const { face: face3 } = polyA.getClosestFace(point3);

      const point4 = new ex.Vector(0, 5);
      const { face: face4 } = polyA.getClosestFace(point4);

      expect(face1.begin.x).toBe(-5);
      expect(face1.begin.y).toBe(-5);
      expect(face1.end.x).toBe(-5);
      expect(face1.end.y).toBe(5);

      expect(face2.begin.x).toBe(5);
      expect(face2.begin.y).toBe(-5);
      expect(face2.end.x).toBe(-5);
      expect(face2.end.y).toBe(-5);

      expect(face3.begin.x).toBe(5);
      expect(face3.begin.y).toBe(5);
      expect(face3.end.x).toBe(5);
      expect(face3.end.y).toBe(-5);

      expect(face4.begin.x).toBe(-5);
      expect(face4.begin.y).toBe(5);
      expect(face4.end.x).toBe(5);
      expect(face4.end.y).toBe(5);
    });

    it('can have ray cast to detect if the ray hits the polygon', () => {
      const actor = new ex.Actor(0, 0, 20, 20);
      const polyA = new ex.ConvexPolygon({
        pos: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
        body: actor.body
      });
      polyA.recalc();

      const rayTowards = new ex.Ray(new ex.Vector(-100, 0), ex.Vector.Right.clone());
      const rayAway = new ex.Ray(new ex.Vector(-100, 0), new ex.Vector(-1, 0));

      const point = polyA.rayCast(rayTowards);
      const noHit = polyA.rayCast(rayAway);
      const tooFar = polyA.rayCast(rayTowards, 1);

      expect(point.x).toBeCloseTo(-5, 0.001);
      expect(point.y).toBeCloseTo(0, 0.001);
      expect(noHit).toBe(null);
      expect(tooFar).toBe(null, 'The polygon should be too far away for a hit');
    });
  });

  describe('an Edge', () => {
    let actor: ex.Actor = null;
    let edge: ex.EdgeArea = null;

    beforeEach(() => {
      actor = new ex.Actor(5, 0, 10, 10);
      edge = new ex.EdgeArea({
        begin: new ex.Vector(-5, 0),
        end: new ex.Vector(5, 0),
        body: actor.body
      });
    });

    it('has a center', () => {
      const center = edge.getCenter();

      expect(center.x).toBe(5);
      expect(center.y).toBe(0);
    });

    it('can be cloned', () => {
      const actor1 = new ex.Actor(0, 0, 20, 20);
      const edge = new ex.Edge({
        collider: actor1.body.collider,
        begin: ex.Vector.One,
        end: ex.Vector.Half
      });

      const sut = edge.clone();

      expect(sut).not.toBe(edge);
      expect(sut.pos).toBeVector(edge.pos);
      expect(sut.begin).toBeVector(edge.begin);
      expect(sut.end).toBeVector(edge.end);
      expect(sut.pos).not.toBe(edge.pos);
      expect(sut.collider).toBe(null);
    });

    it('has a length', () => {
      const length = edge.getLength();
      expect(length).toBe(10);
    });

    it('has a slope', () => {
      const slope = edge.getSlope();
      expect(slope.y).toBe(0);
      expect(slope.x).toBe(1);
    });

    it('can be ray cast against', () => {
      const ray = new ex.Ray(new ex.Vector(5, -100), ex.Vector.Down.clone());
      const rayLeftTangent = new ex.Ray(new ex.Vector(0, -100), ex.Vector.Down.clone());
      const rayRightTangent = new ex.Ray(new ex.Vector(10, -100), ex.Vector.Down.clone());
      const rayNoHit = new ex.Ray(new ex.Vector(5, -100), ex.Vector.Up.clone());

      const midPoint = edge.rayCast(ray);
      const leftTan = edge.rayCast(rayLeftTangent);
      const rightTan = edge.rayCast(rayRightTangent);
      const noHit = edge.rayCast(rayNoHit);
      const tooFar = edge.rayCast(ray, 1);

      expect(midPoint.x).toBeCloseTo(5, 0.001);
      expect(midPoint.y).toBeCloseTo(0, 0.001);

      expect(leftTan.x).toBeCloseTo(0, 0.001);
      expect(leftTan.y).toBeCloseTo(0, 0.001);

      expect(rightTan.x).toBeCloseTo(10, 0.001);
      expect(rightTan.y).toBeCloseTo(0, 0.001);

      expect(tooFar).toBe(null, 'Ray should be too far for a hit');
    });

    it('has 4 axes', () => {
      const axes = edge.getAxes();
      expect(axes.length).toBe(4);
    });

    it('has bounds', () => {
      actor.pos.setTo(400, 400);
      const boundingBox = edge.getBounds();

      const transformedBegin = new ex.Vector(395, 400);
      const transformedEnd = new ex.Vector(405, 400);

      expect(boundingBox.contains(transformedBegin)).toBe(true);
      expect(boundingBox.contains(transformedEnd)).toBe(true);
    });

    it('has a moi', () => {
      // following this formula https://en.wikipedia.org/wiki/List_of_moments_of_inertia
      // rotates from the middle treating the ends as a point mass
      const moi = edge.getInertia();
      const length = edge.end.sub(edge.begin).distance() / 2;
      expect(moi).toBeCloseTo(edge.body.collider.mass * length * length, 0.001);
    });
  });
});
