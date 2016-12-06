/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />



describe('Collision areas', () => {
   describe('A Circle shape', () => {
      var circle: ex.CircleArea;
      var actor: ex.Actor; 

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
         var circle = new ex.CircleArea({});
         expect(circle).not.toBeNull();
      });

      it('can be constructed with points', () => {
         var actor = new ex.Actor(0, 0, 10, 10);
         var circle = new ex.CircleArea({
            pos: ex.Vector.Zero.clone(),
            radius: 10,
            body: actor.body
         });
         expect(circle).not.toBeNull();
      });

      it('has a center', () => {
         actor.pos.setTo(170, 300);
         var center = circle.getCenter();
         expect(center.x).toBe(170);
         expect(center.y).toBe(300);
      });

      it('has bounds', () => {
         actor.pos.setTo(400, 400);

         var bounds = circle.getBounds();
         expect(bounds.left).toBe(390);
         expect(bounds.right).toBe(410);
         expect(bounds.top).toBe(390);
         expect(bounds.bottom).toBe(410);

      });

      it('can contain points', () => {
         var pointInside = new ex.Vector(0, 5);
         var pointOnEdge = new ex.Vector(0, 10);
         var pointJustOutside = new ex.Vector(0, 10.1);

         expect(circle.contains(pointInside)).toBe(true);
         expect(circle.contains(pointOnEdge)).toBe(true);
         expect(circle.contains(pointJustOutside)).toBe(false);
         
      });

      it('can be raycast against', () => {
        var ray = new ex.Ray(new ex.Vector(-100, 0), ex.Vector.Right.clone());
        var rayTangent = new ex.Ray(new ex.Vector(-100, 10), ex.Vector.Right.clone());
        var rayNoHit = new ex.Ray(new ex.Vector(-100, 10), ex.Vector.Left.clone());

        var point = circle.rayCast(ray);
        var pointTangent = circle.rayCast(rayTangent);
        var pointNoHit = circle.rayCast(rayNoHit);
        var pointTooFar = circle.rayCast(ray, 1);

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
        expect(circle.getMomentOfInertia()).toBe((circle.body.mass * circle.radius * circle.radius) / 2);
      });

      it('should collide with other circles when touching', () => {
         var actor2 = new ex.Actor(20, 0, 10, 10);
         var circle2 = new ex.CircleArea({
            radius: 10,
            body: actor2.body
         });

         var directionOfBodyB = circle2.getCenter().sub(circle.getCenter());
         var contact = circle.collide(circle2);

         // there should be a collision contact formed
         expect(contact).not.toBe(null);

         // the normal should always point away from bodyA
         expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

         // the nomral should always be length 1
         expect(contact.normal.distance()).toBeCloseTo(1, .001);

         expect(contact.point.x).toBe(10);
         expect(contact.point.y).toBe(0);
         
      });


      it('should not collide with other circles when touching', () => {
         var actor2 = new ex.Actor(21, 0, 10, 10);
         var circle2 = new ex.CircleArea({
            radius: 10,
            body: actor2.body
         });

         var contact = circle.collide(circle2);

         // there should not be a collision contact formed, null indicates that
         expect(contact).toBe(null);
         
      });

      it('should collide with other polygons when touching', () => {
         var actor2 = new ex.Actor(14.99, 0, 10, 10); // meh close enough
         var poly = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            points: actor2.getRelativeBounds().getPoints(),
            body: actor2.body
         });

         var directionOfBodyB = poly.getCenter().sub(circle.getCenter());
         var contact = circle.collide(poly);

         // there should be a collision contact formed
         expect(contact).not.toBe(null);

         // the normal should always point away from bodyA
         expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

         // the nomral should always be length 1
         expect(contact.normal.distance()).toBeCloseTo(1, .001);

         expect(contact.point.x).toBe(10);
         expect(contact.point.y).toBe(0);
         
      });

      it('should not collide with other polygons when not touching', () => {
         var actor2 = new ex.Actor(16, 0, 10, 10); 
         var poly = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            points: actor2.getRelativeBounds().getPoints(),
            body: actor2.body
         });

         var contact = circle.collide(poly);

         // there should not be a collision contact formed
         expect(contact).toBe(null);      
      });

      it('should collide with other edges when touching the edge face', () => {
         // position the circle actor in the middle of the edge
         actor.pos.setTo(5, -9.99);
         
         var actor2 = new ex.Actor(5, 0, 10, 10);
         var edge = new ex.EdgeArea({
            begin: new ex.Vector(0, 0),
            end: new ex.Vector(10, 0),         
            body: actor2.body
         });

         var directionOfBodyB = edge.getCenter().sub(circle.getCenter());
         var contact = circle.collide(edge);

         // there should be a collision contact formed
         expect(contact).not.toBe(null);

         // the normal should always point away from bodyA
         expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

         // the nomral should always be length 1
         expect(contact.normal.distance()).toBeCloseTo(1, .001);

         expect(contact.point.x).toBe(5);
         expect(contact.point.y).toBe(0);      
      });

      it('should collide with other edges when touching the edge end', () => {
         // position the circle actor in the end of the edge
         actor.pos.setTo(10, -9);
         
         
         var actor2 = new ex.Actor(5, 0, 10, 10);
         var edge = new ex.EdgeArea({
            begin: new ex.Vector(0, 0),
            end: new ex.Vector(10, 0),         
            body: actor2.body
         });

         var directionOfBodyB = edge.getCenter().sub(circle.getCenter());
         var contact = circle.collide(edge);

         // there should be a collision contact formed
         expect(contact).not.toBe(null);

         // the normal should always point away from bodyA
         expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

         // the nomral should always be length 1
         expect(contact.normal.distance()).toBeCloseTo(1, .001);

         expect(contact.point.x).toBe(10);
         expect(contact.point.y).toBe(0);
      });

      it('should collide with other edges when touching the edge beginning', () => {
         // position the circle actor in the end of the edge
         actor.pos.setTo(0, -9);      
         
         var actor2 = new ex.Actor(5, 0, 10, 10);
         var edge = new ex.EdgeArea({
            begin: new ex.Vector(0, 0),
            end: new ex.Vector(10, 0),         
            body: actor2.body
         });

         var directionOfBodyB = edge.getCenter().sub(circle.getCenter());
         var contact = circle.collide(edge);

         // there should be a collision contact formed
         expect(contact).not.toBe(null);

         // the normal should always point away from bodyA
         expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

         // the nomral should always be length 1
         expect(contact.normal.distance()).toBeCloseTo(1, .001);

         expect(contact.point.x).toBe(0);
         expect(contact.point.y).toBe(0);
      });

   });

   describe('A Polygon shape', () => {
      it('exists', () => {
         expect(ex.PolygonArea).toBeDefined();
      });

      it('can be constructed with empty args', () => {
         var poly = new ex.PolygonArea({});
         expect(poly).not.toBe(null);
      });

      it('can be constructed with points', () => {
         var poly = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
         });
         expect(poly).not.toBe(null);
      });

      it('can have be constructed with position', () => {
         var poly = new ex.PolygonArea({
            pos: new ex.Vector(10, 0),
            points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
         });

         expect(poly.pos.x).toBe(10);
         expect(poly.pos.y).toBe(0);

         // should translate right 10 pixels
         var transformedPoints = poly.getTransformedPoints();
         expect(transformedPoints[0].x).toBe(0);
         expect(transformedPoints[1].x).toBe(20);
         expect(transformedPoints[2].x).toBe(20);
         expect(transformedPoints[3].x).toBe(0);
         
      });

      it('can collide with other polygons', () => {
         var polyA = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            // specified relative to the position
            points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
         });

         var polyB = new ex.PolygonArea({
            pos: new ex.Vector(10, 0),
            points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
         });

         var directionOfBodyB = polyB.getCenter().sub(polyA.getCenter());

         // should overlap by 10 pixels in x
         var contact = polyA.collide(polyB);

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
         var actor = new ex.Actor(5, -6, 20, 20);
         actor.rotation = Math.PI / 4;
         var polyA = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            // specified relative to the position
            points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
            body: actor.body
         });
         polyA.recalc();


         var actor2 = new ex.Actor(5, 0, 10, 10);
         var edge = new ex.EdgeArea({
            begin: new ex.Vector(0, 0),
            end: new ex.Vector(10, 0),         
            body: actor2.body
         });

         var directionOfBodyB = edge.getCenter().sub(polyA.getCenter());

         var contact = polyA.collide(edge);

         // there should be a collision
         expect(contact).not.toBe(null);

         // the normal should be pointing away from bodyA
         expect(directionOfBodyB.dot(contact.normal)).toBeGreaterThan(0);

         // the mtv should be pointing away from bodyA
         expect(directionOfBodyB.dot(contact.mtv)).toBeGreaterThan(0);

      });

       it('should not collide with the middle of an edge when not touching', () => {
         var actor = new ex.Actor(5, 0, 20, 20);
         actor.rotation = Math.PI / 4;
         var polyA = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            // specified relative to the position
            points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
            body: actor.body
         });
         polyA.recalc();


         var actor2 = new ex.Actor(5, 100, 10, 10);
         var edge = new ex.EdgeArea({
            begin: new ex.Vector(0, 100),
            end: new ex.Vector(10, 100),         
            body: actor2.body
         });

         var directionOfBodyB = edge.getCenter().sub(polyA.getCenter());

         var contact = polyA.collide(edge);

         // there should not be a collision
         expect(contact).toBe(null);

      });

      it('should detected contained points', () => {
         var actor = new ex.Actor(0, 0, 20, 20);
         var polyA = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            // specified relative to the position
            points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
            body: actor.body
         });
         polyA.recalc();

         var point = new ex.Vector(0, 0);
         var pointOnEdge = new ex.Vector(0, 5);
         var pointOutside = new ex.Vector(0, 5.1);

         expect(polyA.contains(point)).toBe(true);
         expect(polyA.contains(pointOnEdge)).toBe(true);
         expect(polyA.contains(pointOutside)).toBe(false);
      });

      it('can have ray cast to detect if the ray hits the polygon', () => {
         var actor = new ex.Actor(0, 0, 20, 20);
         var polyA = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            // specified relative to the position
            points: [new ex.Vector(-5, -5), new ex.Vector(5, -5), new ex.Vector(5, 5), new ex.Vector(-5, 5)],
            body: actor.body
         });
         polyA.recalc();

         var rayTowards = new ex.Ray(new ex.Vector(-100, 0), ex.Vector.Right.clone());
         var rayAway = new ex.Ray(new ex.Vector(-100, 0), new ex.Vector(-1, 0));

         var point = polyA.rayCast(rayTowards);
         var noHit = polyA.rayCast(rayAway);
         var tooFar = polyA.rayCast(rayTowards, 1);

         expect(point.x).toBeCloseTo(-5, .001);
         expect(point.y).toBeCloseTo(0, .001);
         expect(noHit).toBe(null);
         expect(tooFar).toBe(null, 'The polygon should be too far away for a hit');

      });
   });

   describe('An Edge shape', () => {
      var actor: ex.Actor = null;
      var edge: ex.EdgeArea = null;

      beforeEach(() => {
         actor = new ex.Actor(5, 0, 10, 10);
         edge = new ex.EdgeArea({
            begin: new ex.Vector(-5, 0),
            end: new ex.Vector(5, 0),         
            body: actor.body
         });
      });

      it('has a center', () => {         

         var center = edge.getCenter();

         expect(center.x).toBe(5);
         expect(center.y).toBe(0);
      });

      it('has a length', () => {
         var length = edge.getLength();
         expect(length).toBe(10);
      });

      it('has a slope', () => {
         var slope = edge.getSlope();
         expect(slope.y).toBe(0);
         expect(slope.x).toBe(1);
      });

      it('can be ray cast against', () => {
        var ray = new ex.Ray(new ex.Vector(5, -100), ex.Vector.Down.clone());
        var rayLeftTangent = new ex.Ray(new ex.Vector(0, -100), ex.Vector.Down.clone());
        var rayRightTangent = new ex.Ray(new ex.Vector(10, -100), ex.Vector.Down.clone());
        var rayNoHit = new ex.Ray(new ex.Vector(5, -100), ex.Vector.Up.clone());

        var midPoint = edge.rayCast(ray);
        var leftTan = edge.rayCast(rayLeftTangent);
        var rightTan = edge.rayCast(rayRightTangent);
        var noHit = edge.rayCast(rayNoHit);
        var tooFar = edge.rayCast(ray, 1);

        expect(midPoint.x).toBeCloseTo(5, .001);
        expect(midPoint.y).toBeCloseTo(0, .001);

        expect(leftTan.x).toBeCloseTo(0, .001);
        expect(leftTan.y).toBeCloseTo(0, .001);

        expect(rightTan.x).toBeCloseTo(10, .001);
        expect(rightTan.y).toBeCloseTo(0, .001);

        expect(tooFar).toBe(null, 'Ray should be too far for a hit');
      }); 

      it('has 4 axes', () => {
        var axes = edge.getAxes();
        expect(axes.length).toBe(4);
      });

      it('has bounds', () => {
        actor.pos.setTo(400, 400);
        var boundingBox = edge.getBounds();

        var transformedBegin = new ex.Vector(395, 400);
        var transformedEnd = new ex.Vector(405, 400);

        expect(boundingBox.contains(transformedBegin)).toBe(true);
        expect(boundingBox.contains(transformedEnd)).toBe(true);
      });



      it('has a moi', () => {
        // following this formula https://en.wikipedia.org/wiki/List_of_moments_of_inertia
        // rotates from the middle treating the ends as a point mass
        var moi = edge.getMomentOfInertia();
        var length = edge.end.sub(edge.begin).distance() / 2;
        expect(moi).toBeCloseTo(edge.body.mass * length * length, .001);
      });

   });
});
