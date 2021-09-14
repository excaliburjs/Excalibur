import * as ex from '@excalibur';
import { CollisionJumpTable } from '@excalibur';
import { ExcaliburMatchers, ensureImagesLoaded, ExcaliburAsyncMatchers } from 'excalibur-jasmine';
import { TestUtils } from './util/TestUtils';

describe('Collision Shape', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
  });

  describe('a Circle', () => {
    let engine: ex.Engine;
    let scene: ex.Scene;

    let circle: ex.CircleCollider;
    let actor: ex.Actor;

    beforeEach(() => {
      engine = TestUtils.engine();
      engine.backgroundColor = ex.Color.Transparent;
      scene = new ex.Scene();
      engine.add('test', scene);
      engine.goToScene('test');
      engine.start();

      actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      circle = actor.collider.useCircleCollider(10, ex.Vector.Zero);
      actor.collider.update();
    });

    afterEach(() => {
      engine.stop();
      engine = null;
    });

    it('exists', () => {
      expect(ex.Circle).toBeDefined();
    });

    it('can be constructed with empty args', () => {
      const circle = new ex.CircleCollider({
        radius: 1
      });
      expect(circle).not.toBeNull();
    });

    it('can be cloned', () => {
      const actor1 = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      actor1.collider.useCircleCollider(10, ex.vec(20, 25));

      const sut = circle.clone();

      expect(sut).not.toBe(circle);
      expect(sut.offset).toBeVector(circle.offset);
      expect(sut.offset).not.toBe(circle.offset);
      expect(sut.radius).toBe(circle.radius);
    });

    it('has a center', () => {
      actor.pos = ex.vec(170, 300);
      const center = circle.center;
      expect(center.x).toBe(170);
      expect(center.y).toBe(300);
    });

    it('has bounds', () => {
      actor.pos = ex.vec(400, 400);

      const bounds = circle.bounds;
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

    it('can be raycast against only positive time of impact (toi)', () => {
      const ray = new ex.Ray(new ex.Vector(0, 0), ex.Vector.Right.clone());

      const point = circle.rayCast(ray);

      expect(point.x).toBe(10);
      expect(point.y).toBe(0);
    });

    it('doesnt have axes', () => {
      // technically circles have infinite axes
      expect(circle.axes).toEqual([]);
    });

    it('has a moment of inertia', () => {
      // following this formula
      //https://en.wikipedia.org/wiki/List_of_moments_of_inertia
      // I = m*r^2/2
      expect(circle.getInertia(actor.body.mass)).toBe((actor.body.mass * circle.radius * circle.radius) / 2);
    });

    it('should collide without a collider or body', () => {
      const circle1 = new ex.CircleCollider({
        offset: new ex.Vector(0, 0),
        radius: 5
      });

      const circle2 = new ex.CircleCollider({
        offset: new ex.Vector(9, 0),
        radius: 5
      });

      const cc = circle1.collide(circle2)[0];
      expect(cc.mtv).toBeVector(new ex.Vector(1, 0));
    });

    it('should collide with other circles when touching', () => {
      const actor2 = new ex.Actor({ x: 20, y: 0, width: 10, height: 10 });
      const circle2 = actor2.collider.useCircleCollider(10);
      actor2.collider.update();

      const directionOfBodyB = circle2.center.sub(circle.center);
      const contact = circle.collide(circle2)[0];

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the normal should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.points[0].x).toBe(10);
      expect(contact.points[0].y).toBe(0);
    });

    it('should not collide with other circles when touching', () => {
      const actor2 = new ex.Actor({ x: 21, y: 0, width: 10, height: 10 });
      const circle2 = actor2.collider.useCircleCollider(10);
      actor2.collider.update();
      circle2.update(actor2.transform);

      const contact = circle.collide(circle2);

      // there should not be a collision contact formed, null indicates that
      expect(contact).toEqual([]);
    });

    it('should collide with other polygons when touching', () => {
      const actor2 = new ex.Actor({ x: 14.99, y: 0, width: 10, height: 10 }); // meh close enough
      const poly = actor2.collider.usePolygonCollider(actor2.collider.localBounds.getPoints());
      actor2.collider.update();
      poly.update(actor2.transform);
      const directionOfBodyB = poly.center.sub(circle.center);
      const contact = circle.collide(poly)[0];

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the normal should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.points[0].x).toBe(10);
      expect(contact.points[0].y).toBe(0);
    });

    it('should not collide with other polygons when not touching', () => {
      const actor2 = new ex.Actor({ x: 16, y: 0, width: 10, height: 10 });
      const poly = actor2.collider.usePolygonCollider(actor2.collider.localBounds.getPoints());
      actor2.collider.update();
      poly.update(actor2.transform);
      const contact = circle.collide(poly);

      // there should not be a collision contact formed
      expect(contact).toEqual([]);
    });

    it('should collide with other edges when touching the edge face', () => {
      // position the circle actor in the middle of the edge
      actor.pos = ex.vec(5, -9.99);
      actor.collider.update();
      const actor2 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(10, 0));
      actor2.collider.update();

      const directionOfBodyB = edge.center.sub(circle.center);
      const contact = circle.collide(edge)[0];

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      // TODO this isn't true anymore? probably should ensure it points away from circle
      // expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the normal should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.points.length).toBe(1);
      expect(contact.points[0].x).toBe(5);
      expect(contact.points[0].y).toBe(0);
    });

    it('should collide with other edges when touching the edge end', () => {
      // position the circle actor in the end of the edge
      actor.pos = ex.vec(10, -9);

      const actor2 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(10, 0));

      const directionOfBodyB = edge.center.sub(circle.center);
      const contact = circle.collide(edge)[0];

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the normal should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.points[0].x).toBe(10);
      expect(contact.points[0].y).toBe(0);
    });

    it('should collide with other edges when touching the edge beginning', () => {
      // position the circle actor in the end of the edge
      actor.pos.setTo(0, -9);
      actor.collider.update();

      const actor2 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(10, 0));
      actor2.collider.update();

      const directionOfBodyB = edge.center.sub(circle.center);
      const contact = circle.collide(edge)[0];

      // there should be a collision contact formed
      expect(contact).not.toBe(null);

      // the normal should always point away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the normal should always be length 1
      expect(contact.normal.distance()).toBeCloseTo(1, 0.001);

      expect(contact.points[0].x).toBe(0);
      expect(contact.points[0].y).toBe(0);
    });

    it('can be drawn', (done) => {
      const circle = new ex.CircleCollider({
        offset: new ex.Vector(100, 100),
        radius: 30
      });

      circle.draw(engine.ctx, ex.Color.Blue, new ex.Vector(50, 0));

      ensureImagesLoaded(engine.canvas, 'src/spec/images/CollisionShapeSpec/circle.old.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can be debug drawn', async () => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 100;
      canvasElement.height = 100;
      const ctx = new ex.ExcaliburGraphicsContext2DCanvas({ canvasElement });

      const circle = new ex.CircleCollider({
        offset: new ex.Vector(50, 50),
        radius: 30
      });

      ctx.clear();

      circle.debug(ctx, ex.Color.Red);

      ctx.flush();

      await expectAsync(canvasElement).toEqualImage('src/spec/images/CollisionShapeSpec/circle-debug.png');
    });

    it('can be drawn with actor', async () => {
      const circleActor = new ex.Actor({
        pos: new ex.Vector(100, 100),
        color: ex.Color.Blue
      });
      circleActor.collider.useCircleCollider(100);
      scene.add(circleActor);
      scene.draw(engine.ctx, 100);

      await expectAsync(engine.canvas).toEqualImage('src/spec/images/CollisionShapeSpec/circle.png');
    });

    it('can calculate the distance to another circle', () => {
      const circle = new ex.CircleCollider({
        offset: new ex.Vector(100, 100),
        radius: 30
      });

      const circle2 = new ex.CircleCollider({
        offset: new ex.Vector(200, 100),
        radius: 30
      });

      const line = circle.getClosestLineBetween(circle2);

      expect(line.getLength()).toBe(40);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from circle to other circle should be away from this');
    });

    it('can calculate the distance to another polygon', () => {
      const circle = new ex.CircleCollider({
        offset: new ex.Vector(100, 100),
        radius: 30
      });

      const box = ex.Shape.Box(40, 40, ex.Vector.Zero, new ex.Vector(200, 100));

      const line = circle.getClosestLineBetween(box);

      expect(line.getLength()).toBe(70);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from circle to polygon should be away from polygon');
    });

    it('can calculate the distance to another edge', () => {
      const circle = new ex.CircleCollider({
        offset: new ex.Vector(100, 100),
        radius: 30
      });

      const edge = ex.Shape.Edge(new ex.Vector(200, 50), new ex.Vector(200, 150));

      const line = circle.getClosestLineBetween(edge);

      expect(line.getLength()).toBe(70);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from circle to edge should be away from circle');
    });
  });

  describe('a ConvexPolygon', () => {
    let engine: ex.Engine;
    let scene: ex.Scene;
    beforeEach(() => {
      engine = TestUtils.engine();
      engine.backgroundColor = ex.Color.Transparent;
      scene = new ex.Scene();
      engine.addScene('test', scene);
      engine.goToScene('test');
      engine.start();
    });

    afterEach(() => {
      engine.stop();
      engine = null;
    });

    it('exists', () => {
      expect(ex.ConvexPolygon).toBeDefined();
    });

    it('can be constructed with empty args', () => {
      const poly = new ex.ConvexPolygon({
        points: [ex.Vector.One]
      });
      expect(poly).not.toBe(null);
    });

    it('can be cloned', () => {
      const actor1 = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const poly = actor1.collider.usePolygonCollider([ex.Vector.One, ex.Vector.Half], new ex.Vector(20, 25));

      const sut = poly.clone();

      expect(sut).not.toBe(poly);
      expect(sut.offset).toBeVector(poly.offset);
      expect(sut.offset).not.toBe(poly.offset);
      expect(sut.points.length).toBe(2);
    });

    it('can be constructed with points', () => {
      const poly = new ex.ConvexPolygon({
        offset: ex.Vector.Zero.clone(),
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });
      expect(poly).not.toBe(null);
    });

    it('can have be constructed with position', () => {
      const poly = new ex.ConvexPolygon({
        offset: new ex.Vector(10, 0),
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });

      expect(poly.offset.x).toBe(10);
      expect(poly.offset.y).toBe(0);

      // should translate right 10 pixels
      const transformedPoints = poly.getTransformedPoints();
      expect(transformedPoints[0].x).toBe(0);
      expect(transformedPoints[1].x).toBe(20);
      expect(transformedPoints[2].x).toBe(20);
      expect(transformedPoints[3].x).toBe(0);
    });

    it('can collide with other polygons', () => {
      const polyA = new ex.ConvexPolygon({
        offset: ex.Vector.Zero.clone(),
        // specified relative to the position
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });

      const polyB = new ex.ConvexPolygon({
        offset: new ex.Vector(10, 0),
        points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
      });

      const directionOfBodyB = polyB.center.sub(polyA.center);

      // should overlap by 10 pixels in x
      const contact = polyA.collide(polyB)[0];

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
      const actor = new ex.Actor({ x: 5, y: -6, width: 20, height: 20 });
      actor.rotation = Math.PI / 4;
      const polyA = actor.collider.usePolygonCollider([
        new ex.Vector(-5, -5),
        new ex.Vector(5, -5),
        new ex.Vector(5, 5),
        new ex.Vector(-5, 5)
      ]);

      actor.collider.update();

      const actor2 = new ex.Actor({ x: 5, y: 0, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(10, 0));
      actor2.collider.update();

      const directionOfBodyB = edge.center.sub(polyA.center);

      const contact = polyA.collide(edge)[0];

      // there should be a collision
      expect(contact).not.toBe(null);

      // the normal should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

      // the mtv should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
    });

    it('can collide with the end of an edge', () => {
      const actor = new ex.Actor({ x: 0, y: -4, width: 20, height: 20 });
      const polyA = actor.collider.usePolygonCollider([
        new ex.Vector(-5, -5),
        new ex.Vector(5, -5),
        new ex.Vector(5, 5),
        new ex.Vector(-5, 5)
      ]);
      actor.collider.update();

      const actor2 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(0, 10));
      actor2.collider.update();

      const directionOfBodyB = edge.center.sub(polyA.center);
      const contact = polyA.collide(edge)[0];

      expect(contact).not.toBe(null);
      // the normal should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);
      // the mtv should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
    });

    it('can collide with the end of an edge regardless of order', () => {
      const actor = new ex.Actor({ x: 0, y: -4, width: 20, height: 20 });
      const polyA = actor.collider.usePolygonCollider([
        new ex.Vector(-5, -5),
        new ex.Vector(5, -5),
        new ex.Vector(5, 5),
        new ex.Vector(-5, 5)
      ]);
      actor.collider.update();

      const actor2 = new ex.Actor({ x: 0, y: 0, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(0, 10));
      actor2.collider.update();

      const directionOfBodyB = edge.center.sub(polyA.center);
      const contact = polyA.collide(edge)[0];
      expect(contact).not.toBeUndefined();
      // the normal should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);
      // the mtv should be pointing away from bodyA
      expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);
    });

    it('should not collide with the middle of an edge when not touching', () => {
      const actor = new ex.Actor({ x: 5, y: 0, width: 20, height: 20 });
      actor.rotation = Math.PI / 4;
      const polyA = actor.collider.usePolygonCollider([
        new ex.Vector(-5, -5),
        new ex.Vector(5, -5),
        new ex.Vector(5, 5),
        new ex.Vector(-5, 5)
      ]);
      actor.collider.update();

      const actor2 = new ex.Actor({ x: 5, y: 100, width: 10, height: 10 });
      const edge = actor2.collider.useEdgeCollider(new ex.Vector(0, 100), new ex.Vector(10, 100));
      actor2.collider.update();

      const directionOfBodyB = edge.center.sub(polyA.center);

      const contact = polyA.collide(edge);

      // there should not be a collision
      expect(contact).toEqual([]);
    });

    it('should detected contained points', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const polyA = actor.collider.usePolygonCollider([
        new ex.Vector(-5, -5),
        new ex.Vector(5, -5),
        new ex.Vector(5, 5),
        new ex.Vector(-5, 5)
      ]);
      actor.collider.update();

      const point = new ex.Vector(0, 0);
      const pointOnEdge = new ex.Vector(0, 5);
      const pointOutside = new ex.Vector(0, 5.1);

      expect(polyA.contains(point)).toBe(true);
      expect(polyA.contains(pointOnEdge)).toBe(true);
      expect(polyA.contains(pointOutside)).toBe(false);
    });

    it('can calculate the closest face to a point', () => {
      const polyA = new ex.ConvexPolygon({
        offset: ex.Vector.Zero.clone(),
        // specified relative to the position
        //           2
        // (-5, -5) --- (5, -5)
        //    |            |
        //  1 |    (0,0)   | 3
        //    |            |
        // (-5, 5)  --- (5, 5)
        //           4
        points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)]
      });

      const point1 = new ex.Vector(-5, 0);
      const { face: face1 } = polyA.getClosestFace(point1);

      expect(face1.begin).toBeVector(ex.vec(-5, 5));
      expect(face1.end).toBeVector(ex.vec(-5, -5));

      const point2 = new ex.Vector(0, -5);
      const { face: face2 } = polyA.getClosestFace(point2);
      expect(face2.begin).toBeVector(ex.vec(-5, -5));
      expect(face2.end).toBeVector(ex.vec(5, -5));

      const point3 = new ex.Vector(5, 0);
      const { face: face3 } = polyA.getClosestFace(point3);
      expect(face3.begin).toBeVector(ex.vec(5, -5));
      expect(face3.end).toBeVector(ex.vec(5, 5));

      const point4 = new ex.Vector(0, 5);
      const { face: face4 } = polyA.getClosestFace(point4);
      expect(face4.begin).toBeVector(ex.vec(5, 5));
      expect(face4.end).toBeVector(ex.vec(-5, 5));
    });

    it('can have ray cast to detect if the ray hits the polygon', () => {
      const actor = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const polyA = actor.collider.usePolygonCollider([
        new ex.Vector(-5, -5),
        new ex.Vector(5, -5),
        new ex.Vector(5, 5),
        new ex.Vector(-5, 5)
      ]);
      actor.collider.update();

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

    it('can be drawn', (done) => {
      const polygon = new ex.ConvexPolygon({
        offset: new ex.Vector(100, 100),
        points: [new ex.Vector(0, -100), new ex.Vector(-100, 50), new ex.Vector(100, 50)]
      });

      // Effective position is (150, 100)
      polygon.draw(engine.ctx, ex.Color.Blue, new ex.Vector(50, 0));

      ensureImagesLoaded(engine.canvas, 'src/spec/images/CollisionShapeSpec/triangle.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can be drawn with actor', (done) => {
      const polygonActor = new ex.Actor({
        pos: new ex.Vector(150, 100),
        color: ex.Color.Blue
      });
      polygonActor.collider.usePolygonCollider([new ex.Vector(0, -100), new ex.Vector(-100, 50), new ex.Vector(100, 50)]);

      scene.add(polygonActor);
      scene.draw(engine.ctx, 100);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/CollisionShapeSpec/triangle.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can calculate the distance to another circle', () => {
      const poly = ex.Shape.Box(40, 40, ex.Vector.Half, new ex.Vector(100, 100));

      const circle = new ex.CircleCollider({
        offset: new ex.Vector(200, 100),
        radius: 30
      });

      const line = poly.getClosestLineBetween(circle);

      expect(line.getLength()).toBe(50);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from polygon to other circle should be away from this');
    });

    it('can calculate the distance to another polygon', () => {
      const poly = ex.Shape.Box(40, 40, ex.Vector.Half, new ex.Vector(100, 100));

      const box = ex.Shape.Box(40, 40, ex.Vector.Zero, new ex.Vector(200, 100));

      const line = poly.getClosestLineBetween(box);

      expect(line.getLength()).toBe(80);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from polygon to polygon should be away from polygon');
    });

    it('can calculate the distance to another edge', () => {
      const poly = ex.Shape.Box(40, 40, ex.Vector.Half, new ex.Vector(100, 100));

      const edge = ex.Shape.Edge(new ex.Vector(200, 50), new ex.Vector(200, 150));

      const line = poly.getClosestLineBetween(edge);

      expect(line.getLength()).toBe(80);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from circle to edge should be away from circle');
    });
  });

  describe('an Edge', () => {
    let actor: ex.Actor = null;
    let edge: ex.Edge = null;

    let engine: ex.Engine;
    let scene: ex.Scene;

    afterEach(() => {
      engine.stop();
      engine = null;
    });

    beforeEach(() => {
      engine = TestUtils.engine();
      engine.backgroundColor = ex.Color.Transparent;
      scene = new ex.Scene();
      engine.addScene('test', scene);
      engine.goToScene('test');
      engine.start();

      actor = new ex.Actor({ x: 5, y: 0, width: 10, height: 10 });
      edge = actor.collider.useEdgeCollider(new ex.Vector(-5, 0), new ex.Vector(5, 0));
      actor.collider.update();
    });

    it('has a center', () => {
      const center = edge.center;

      expect(center.x).toBe(5);
      expect(center.y).toBe(0);
    });

    it('can be cloned', () => {
      const actor1 = new ex.Actor({ x: 0, y: 0, width: 20, height: 20 });
      const edge = actor1.collider.useEdgeCollider(ex.Vector.One, ex.Vector.Half);

      const sut = edge.clone();

      expect(sut).not.toBe(edge);
      expect(sut.offset).toBeVector(edge.offset);
      expect(sut.begin).toBeVector(edge.begin);
      expect(sut.end).toBeVector(edge.end);
      expect(sut.offset).not.toBe(edge.offset);
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
      const axes = edge.axes;
      expect(axes.length).toBe(4);
    });

    it('has bounds', () => {
      actor.pos = ex.vec(400, 400);
      const boundingBox = edge.bounds;
      const transformedBegin = new ex.Vector(395, 400);
      const transformedEnd = new ex.Vector(405, 400);

      expect(boundingBox.contains(transformedBegin)).toBe(true);
      expect(boundingBox.contains(transformedEnd)).toBe(true);
    });

    it('has a moi', () => {
      // following this formula https://en.wikipedia.org/wiki/List_of_moments_of_inertia
      // rotates from the middle treating the ends as a point mass
      const moi = edge.getInertia(10);
      const length = edge.end.sub(edge.begin).distance() / 2;
      expect(moi).toBeCloseTo(10 * length * length, 0.001);
    });

    it('can be drawn', (done) => {
      const edge = new ex.Edge({
        begin: new ex.Vector(100, 100),
        end: new ex.Vector(400, 400)
      });

      edge.draw(engine.ctx, ex.Color.Blue, new ex.Vector(50, 0));

      ensureImagesLoaded(engine.canvas, 'src/spec/images/CollisionShapeSpec/edge.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can be drawn with actor', (done) => {
      const edgeActor = new ex.Actor({
        pos: new ex.Vector(150, 100),
        color: ex.Color.Blue
      });
      edgeActor.collider.useEdgeCollider(ex.Vector.Zero, new ex.Vector(300, 300));

      scene.add(edgeActor);
      scene.draw(engine.ctx, 100);

      ensureImagesLoaded(engine.canvas, 'src/spec/images/CollisionShapeSpec/edge.png').then(([canvas, image]) => {
        expect(canvas).toEqualImage(image);
        done();
      });
    });

    it('can calculate the distance to another circle', () => {
      const edge = ex.Shape.Edge(new ex.Vector(100, 50), new ex.Vector(100, 150));

      const circle = new ex.CircleCollider({
        offset: new ex.Vector(200, 100),
        radius: 30
      });

      const line = edge.getClosestLineBetween(circle);

      expect(line.getLength()).toBe(70);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from polygon to other circle should be away from this');
    });

    it('can calculate the distance to another polygon', () => {
      const edge = ex.Shape.Edge(new ex.Vector(100, 50), new ex.Vector(100, 150));

      const box = ex.Shape.Box(40, 40, ex.Vector.Zero, new ex.Vector(200, 100));

      const line = edge.getClosestLineBetween(box);

      expect(line.getLength()).toBe(100);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from polygon to polygon should be away from polygon');
    });

    it('can calculate the distance to another edge', () => {
      const edge = ex.Shape.Edge(new ex.Vector(100, 50), new ex.Vector(100, 150));

      const edge2 = ex.Shape.Edge(new ex.Vector(200, 50), new ex.Vector(200, 150));

      const line = edge.getClosestLineBetween(edge2);

      expect(line.getLength()).toBe(100);
      expect(line.getEdge().dot(ex.Vector.Right)).toBeGreaterThan(0, 'Line from circle to edge should be away from circle');
    });

    it('can collide with a circle center edge', () => {
      const edge = ex.Shape.Edge(ex.vec(-100, 30), ex.vec(100, 30));
      const circle = ex.Shape.Circle(30);
      const contact = circle.collide(edge)[0];
      expect(contact.normal)
        .withContext('Circle/Edge normals point away from circle')
        .toBeVector(ex.Vector.Down);
      expect(contact.points[0]).toBeVector(ex.vec(0, 30));
      expect(contact.info.collider).toBe(circle);
      expect(contact.info.point).toBeVector(ex.vec(0, 30));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(0, 40));
      expect(separation).withContext('Negative separation means overlap').toBe(-10);
    });

    it('can collide with a circle, left edge', () => {
      const edge = ex.Shape.Edge(ex.vec(30, 0), ex.vec(100, 0));
      const circle = ex.Shape.Circle(30);
      const contact = circle.collide(edge)[0];
      expect(contact.normal)
        .withContext('Circle/Edge normals point away from circle')
        .toBeVector(ex.Vector.Right);
      expect(contact.points[0]).toBeVector(ex.vec(30, 0));
      expect(contact.info.collider).toBe(circle);
      expect(contact.info.point).toBeVector(ex.vec(30, 0));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(40, 0));
      expect(separation).toBe(-10);
    });

    it('can collide with a circle, right edge', () => {
      const edge = ex.Shape.Edge(ex.vec(-100, 0), ex.vec(-30, 0));
      const circle = ex.Shape.Circle(30);
      const contact = circle.collide(edge)[0];
      expect(contact.normal)
        .withContext('Circle/Edge normals point away from circle')
        .toBeVector(ex.Vector.Left);
      expect(contact.points[0]).toBeVector(ex.vec(-30, 0));
      expect(contact.info.collider).toBe(circle);
      expect(contact.info.point).toBeVector(ex.vec(-30, 0));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(-40, 0));
      expect(separation).toBe(-10);
    });

    it('can collide with a circle, bottom edge', () => {
      const edge = ex.Shape.Edge(ex.vec(-100, -30), ex.vec(100, -30));
      const circle = ex.Shape.Circle(30);
      const contact = circle.collide(edge)[0];
      expect(contact.normal)
        .withContext('Circle/Edge normals point away from circle')
        .toBeVector(ex.Vector.Up);
      expect(contact.points[0]).toBeVector(ex.vec(0, -30));
      expect(contact.info.collider).toBe(circle);
      expect(contact.info.point).toBeVector(ex.vec(0, -30));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(0, -40));
      expect(separation).toBe(-10);
    });

    it('can collide with a polygon, center edge', () => {
      const edge = ex.Shape.Edge(ex.vec(-100, 10), ex.vec(100, 10));
      const rect = ex.Shape.Box(40, 20, ex.Vector.Half);
      const contact = rect.collide(edge)[0];
      expect(contact.normal)
        .withContext('Rect/Edge normal point away from edge')
        .toBeVector(ex.Vector.Up);
      expect(contact.points[0]).toBeVector(ex.vec(20, 10));
      expect(contact.points[1]).toBeVector(ex.vec(-20, 10));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(0, 20));
      expect(separation).toBe(-10);
    });

    it('can collide with a polygon, right edge', () => {
      const edge = ex.Shape.Edge(ex.vec(10, 10), ex.vec(100, 10));
      const rect = ex.Shape.Box(40, 20, ex.Vector.Half);
      const contact = rect.collide(edge)[0];
      expect(contact.normal)
        .withContext('Rect/Edge normal point away from edge')
        .toBeVector(ex.Vector.Up);
      expect(contact.points[0]).toBeVector(ex.vec(20, 10));
      expect(contact.points[1]).toBeVector(ex.vec(10, 10));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(0, 20));
      expect(separation).toBe(-10);
    });

    it('can collide with a polygon, right edge', () => {
      const edge = ex.Shape.Edge(ex.vec(-100, 10), ex.vec(0, 10));
      const rect = ex.Shape.Box(40, 20, ex.Vector.Half);
      const contact = rect.collide(edge)[0];
      expect(contact.normal)
        .withContext('Rect/Edge normal point away from edge')
        .toBeVector(ex.Vector.Up);
      expect(contact.points[0]).toBeVector(ex.vec(-20, 10));
      expect(contact.points[1]).toBeVector(ex.vec(0, 10));

      const separation = CollisionJumpTable.FindContactSeparation(contact, ex.vec(0, 20));
      expect(separation).toBe(-10);
    });
  });
});
