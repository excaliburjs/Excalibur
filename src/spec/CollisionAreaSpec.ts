// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />

describe('Collision Areas', () => {
   describe('Polygons ', () => {
      it('exist', () => {
         expect(ex.PolygonArea).toBeDefined();
      });

      it('can be constructed with empty args', () => {
         var poly = new ex.PolygonArea({});
      });

      it('can be constructed with points', () => {
         var poly = new ex.PolygonArea({
            pos: ex.Vector.Zero.clone(),
            points: [new ex.Vector(-10, -10), new ex.Vector(10, -10), new ex.Vector(10, 10), new ex.Vector(-10, 10)]
         });
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

         // should overlap by 10 pixels in x
         var contact = polyA.collide(polyB);

         expect(contact).toBeTruthy();
         expect(contact.mtv.x).toBeCloseTo(10, 0.01);
         expect(contact.normal.x).toBeCloseTo(1, 0.01);
         expect(contact.mtv.y).toBeCloseTo(0, 0.01);
         expect(contact.normal.y).toBeCloseTo(0, 0.01);
      });
   });
});